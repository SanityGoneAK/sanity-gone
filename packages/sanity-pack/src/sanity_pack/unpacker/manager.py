import asyncio
import json
from pathlib import Path
from typing import Optional
import aiofiles
import aiofiles.os

import UnityPy
from UnityPy.enums.BundleFile import CompressionFlags
from UnityPy.files import ObjectReader
from UnityPy.helpers import CompressionHelper
from UnityPy.classes import AudioClip, MonoBehaviour, Object, Sprite, TextAsset, Texture2D

from sanity_pack.utils.compression import decompress_lz4ak
from sanity_pack.config.models import Config, ServerRegion
from sanity_pack.unpacker.processors import AssetProcessorFactory, AssetResult
from sanity_pack.utils.logger import log

CompressionHelper.DECOMPRESSION_MAP[CompressionFlags.LZHAM] = decompress_lz4ak


def _get_target_path(obj: ObjectReader, name: str, source_dir: Path, output_dir: Path) -> Path:
    """Determine the target path for saving an asset."""
    if obj.container:
        source_dir = Path(*Path(obj.container).parts[1:-1])

    assert isinstance(name, str)
    return output_dir / source_dir / name


class UnityAssetExtractor:
    """Handles extraction of Unity assets from downloaded game files."""
    """Assets (.ab) can have objects inside of them of many types we use the Processor to handle these types"""
    
    def __init__(self, config: Config, region: ServerRegion, concurrency: int = 128):
        self.config = config
        self._region = region
        self._semaphore = asyncio.Semaphore(concurrency)  # Limit concurrent extractions
        self._object_semaphore = asyncio.Semaphore(concurrency)  # Limit concurrent object processing
        self._processor_factory = AssetProcessorFactory()
    
    async def _process_object(self, obj: ObjectReader) -> Optional[AssetResult]:
        """Process a single Unity object."""
        async with self._object_semaphore:
            processor = self._processor_factory.get_processor(obj)
            if processor:
                return await processor.process(obj)
            return None
    
    def _get_env(self, asset_path: str) -> UnityPy.Environment:
        """Get or create a UnityPy environment for the given asset."""
        server_dir = self.config.output_dir / self._region.value.lower()
        asset_file = server_dir / asset_path
        return UnityPy.load(str(asset_file))

    # TODO: Move this to saver.py
    async def _save_asset(self, result: AssetResult, asset_path: Path, base_dir: Path) -> None:
        """Save an asset to disk asynchronously."""
        # Get the target path based on the source path and object type
        target_path = _get_target_path(
            result.obj,
            result.name,
            asset_path.parent,
            base_dir
        )
        log.info(f"Saving to path: {str(target_path)}...")
        await aiofiles.os.makedirs(target_path.parent, exist_ok=True)

        if result.object_type in (Texture2D, Sprite):
            file_extension = ".png" if "dynchars" in str(target_path) else ".webp"
            
            # Overrides to grab all data correctly
            target_path_str = target_path.as_posix()
            if "/arts/item" in target_path_str:
                target_path = base_dir / "arts/items" / target_path.name
            if "/arts/charavatars" in target_path_str:
                target_path = base_dir / "arts/charavatars" / target_path.name
            
            target_path = target_path.with_suffix(file_extension)
            # Save image in a separate thread to avoid blocking
            await asyncio.get_event_loop().run_in_executor(
                None, 
                lambda: result.content.save(target_path)
            )

        elif result.object_type == TextAsset:
            async with aiofiles.open(target_path, 'wb') as f:
                await f.write(result.content)

        elif result.object_type == MonoBehaviour:
            target_path = target_path.with_suffix('.json')
            async with aiofiles.open(target_path, 'w', encoding='utf-8') as f:
                await f.write(json.dumps(result.content, indent=2, ensure_ascii=False))

        elif result.object_type == AudioClip:
            for name, audio_data in result.content.items():
                audio_path = _get_target_path(result.obj, name, asset_path, base_dir)
                await aiofiles.os.makedirs(audio_path.parent, exist_ok=True)
                async with aiofiles.open(audio_path, 'wb') as f:
                    await f.write(audio_data)
    
    async def process_asset(self, asset_path: Path) -> None:
        """Process a single asset file (.ab) asynchronously."""
        async with self._semaphore:
            try:
                relative_path = asset_path.relative_to(self.config.output_dir / self._region.value.lower())
                log.info(f"Extracting Asset {relative_path}...")
                
                # 1. Get UnityPy environment
                env = self._get_env(str(relative_path))
                
                # 2. Process all objects
                tasks = [self._process_object(obj) for obj in env.objects]
                results = await asyncio.gather(*tasks)
                
                # 3. Save all assets concurrently
                base_dir = self.config.output_dir / self._region.value.lower()
                save_tasks = [
                    self._save_asset(result, relative_path, base_dir)
                    for result in results
                    if result
                ]
                await asyncio.gather(*save_tasks)
                
                # 4. Clean up
                await asyncio.get_event_loop().run_in_executor(None, asset_path.unlink)
                log.info(f"Successfully extracted objects from asset: {relative_path}")
                
            except Exception as e:
                log.exception(f"Error processing {asset_path}")

    async def unpack(self)-> None:
        """Unpack all assets asynchronously."""
        log.info(f"\nProcessing {self._region.value} server assets...")
        server_dir = self.config.output_dir / self._region.value.lower()
        asset_files = []
        # Find .ab and .bin files
        for pattern in ["**/*.ab", "**/*.bin"]:
            asset_files.extend(server_dir.glob(pattern))

        tasks = [self.process_asset(file_path) for file_path in asset_files]
        await asyncio.gather(*tasks)

    
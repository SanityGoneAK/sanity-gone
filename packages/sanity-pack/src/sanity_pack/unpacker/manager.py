import json
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Optional

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
        self._concurrency = concurrency
        self._semaphore = threading.Semaphore(concurrency)  # Limit concurrent extractions
        self._object_semaphore = threading.Semaphore(concurrency)  # Limit concurrent object processing
        self._processor_factory = AssetProcessorFactory()
    
    def _process_object(self, obj: ObjectReader) -> Optional[AssetResult]:
        """Process a single Unity object."""
        with self._object_semaphore:
            processor = self._processor_factory.get_processor(obj)
            if processor:
                return processor.process(obj)
            return None
    
    def _get_env(self, asset_path: str) -> UnityPy.Environment:
        """Get or create a UnityPy environment for the given asset."""
        server_dir = self.config.output_dir / self._region.value.lower()
        asset_file = server_dir / asset_path
        return UnityPy.load(str(asset_file))

    # TODO: Move this to saver.py
    def _save_asset(self, result: AssetResult, asset_path: Path, base_dir: Path) -> None:
        """Save an asset to disk."""
        # Get the target path based on the source path and object type
        target_path = _get_target_path(
            result.obj,
            result.name,
            asset_path.parent,
            base_dir
        )
        log.info(f"Saving to path: {str(target_path)}...")
        target_path.parent.mkdir(parents=True, exist_ok=True)

        if result.object_type in (Texture2D, Sprite):
            file_extension = ".png" if "dynchars" in str(target_path) else ".webp"
            
            # Overrides to grab all data correctly
            target_path_str = target_path.as_posix()
            if "/arts/item" in target_path_str:
                target_path = base_dir / "arts/items" / target_path.name
            if "/arts/charavatars" in target_path_str:
                target_path = base_dir / "arts/charavatars" / target_path.name
            
            target_path = target_path.with_suffix(file_extension)
            # Save image
            result.content.save(target_path)

        elif result.object_type == TextAsset:
            with open(target_path, 'wb') as f:
                f.write(result.content)

        elif result.object_type == MonoBehaviour:
            target_path = target_path.with_suffix('.json')
            with open(target_path, 'w', encoding='utf-8') as f:
                f.write(json.dumps(result.content, indent=2, ensure_ascii=False))

        elif result.object_type == AudioClip:
            for name, audio_data in result.content.items():
                audio_path = _get_target_path(result.obj, name, asset_path, base_dir)
                audio_path.parent.mkdir(parents=True, exist_ok=True)
                with open(audio_path, 'wb') as f:
                    f.write(audio_data)
    
    def process_asset(self, asset_path: Path) -> None:
        """Process a single asset file (.ab)."""
        with self._semaphore:
            try:
                relative_path = asset_path.relative_to(self.config.output_dir / self._region.value.lower())
                log.info(f"Extracting Asset {relative_path}...")
                
                # 1. Get UnityPy environment
                env = self._get_env(str(relative_path))
                
                # 2. Process all objects in thread pool
                with ThreadPoolExecutor(max_workers=self._concurrency) as executor:
                    futures = [executor.submit(self._process_object, obj) for obj in env.objects]
                    results = [f.result() for f in as_completed(futures)]
                
                # 3. Save all assets
                base_dir = self.config.output_dir / self._region.value.lower()
                for result in results:
                    if result:
                        self._save_asset(result, relative_path, base_dir)
                
                # 4. Clean up
                asset_path.unlink()
                log.info(f"Successfully extracted objects from asset: {relative_path}")
                
            except Exception as e:
                log.exception(f"Error processing {asset_path}")

    def unpack(self) -> None:
        """Unpack all assets."""
        log.info(f"\nProcessing {self._region.value} server assets...")
        server_dir = self.config.output_dir / self._region.value.lower()
        asset_files = []
        # Find .ab and .bin files
        for pattern in ["**/*.ab", "**/*.bin"]:
            asset_files.extend(server_dir.glob(pattern))

        with ThreadPoolExecutor(max_workers=self._concurrency) as executor:
            futures = [executor.submit(self.process_asset, file_path) for file_path in asset_files]
            for future in as_completed(futures):
                try:
                    future.result()
                except Exception as e:
                    log.exception(f"Unpack task failed: {e}")

    
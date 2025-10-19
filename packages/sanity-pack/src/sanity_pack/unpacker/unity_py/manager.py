import json
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Optional

import UnityPy
from UnityPy.enums.BundleFile import CompressionFlags
from UnityPy.files import ObjectReader
from UnityPy.helpers import CompressionHelper

from sanity_pack.utils.compression import decompress_lz4ak
from sanity_pack.utils.logger import log
from sanity_pack.config.models import Config, ServerRegion
from sanity_pack.unpacker.base import AssetUnpacker
from sanity_pack.unpacker.unity_py.processors import AssetProcessorFactory, ObjectResult
from sanity_pack.unpacker.unity_py.save import Save

CompressionHelper.DECOMPRESSION_MAP[CompressionFlags.LZHAM] = decompress_lz4ak

class UnityAssetExtractor(AssetUnpacker):
    """Handles extraction of Unity assets from downloaded game files using UnityPy.
    
    Assets (.ab) can have objects inside of them of many types we use the Processor to handle these types.
    """
    
    def __init__(self, config: Config, region: ServerRegion, concurrency: int = 64):
        super().__init__(config, region, concurrency)
        self._semaphore = threading.Semaphore(concurrency)  # Limit concurrent extractions
        self._object_semaphore = threading.Semaphore(concurrency)  # Limit concurrent object processing
        self._processor_factory = AssetProcessorFactory()
    
    def _process_object(self, obj: ObjectReader) -> Optional[ObjectResult]:
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

                # Identify if objects/results in the asset relate to a Spine
                
                # 4. Save all assets
                base_dir = self.config.output_dir / self._region.value.lower()
                with ThreadPoolExecutor(max_workers=self._concurrency) as executor:
                    save_futures = [executor.submit(Save.object, result, relative_path, base_dir) for result in results if result]
                    save_results = [f.result() for f in as_completed(save_futures)]
                
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

    
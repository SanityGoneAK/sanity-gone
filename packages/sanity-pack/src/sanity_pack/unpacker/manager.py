"""Main unpacker manager for async Unity asset processing."""

import asyncio
from pathlib import Path
from typing import Dict, List, Optional, Set
from dataclasses import dataclass

import UnityPy
from UnityPy.helpers import CompressionHelper

from sanity_pack.config.models import Config, ServerRegion
from sanity_pack.utils.logger import log
from sanity_pack.utils.compression import decompress_lz4ak
from .saver import SafeFileSaver
from .processors import AssetProcessorFactory
from .spine import SpineAssetProcessor

# Configure UnityPy decompression
CompressionHelper.DECOMPRESSION_MAP[UnityPy.enums.BundleFile.CompressionFlags.LZHAM] = decompress_lz4ak


@dataclass
class UnpackResult:
    """Result of unpacking an asset file."""
    file_path: Path
    objects_processed: int
    files_saved: int
    errors: List[str]
    spine_assets_found: int = 0


class UnityAssetUnpacker:
    """Main manager for async Unity asset unpacking."""

    def __init__(self, config: Config, concurrency: int = 50):
        self._config = config
        self._concurrency = max(1, concurrency)
        self._semaphore = asyncio.Semaphore(self._concurrency)
        self._saver = SafeFileSaver()
        self._processor_factory = AssetProcessorFactory()
        self._spine_processor = SpineAssetProcessor()

    def _get_asset_files(self, region: ServerRegion) -> List[Path]:
        """Get all asset files for a region."""
        server_dir = self._config.output_dir / region.value.lower()
        if not server_dir.exists():
            return []
        
        asset_files = []
        # Find .ab and .bin files
        for pattern in ["**/*.ab", "**/*.bin"]:
            asset_files.extend(server_dir.glob(pattern))
        
        return asset_files

    async def _process_asset_file(self, file_path: Path, region: ServerRegion) -> UnpackResult:
        """Process a single asset file."""
        async with self._semaphore:
            result = UnpackResult(
                file_path=file_path,
                objects_processed=0,
                files_saved=0,
                errors=[]
            )
            
            try:
                log.info(f"Processing {file_path.name}...")
                
                # Load Unity environment
                env = UnityPy.load(str(file_path))
                objects = list(env.objects)
                result.objects_processed = len(objects)
                
                # Process objects concurrently
                tasks = []
                for obj in objects:
                    task = self._process_object(obj, file_path, region)
                    tasks.append(task)
                
                # Wait for all processing to complete
                processed_results = await asyncio.gather(*tasks, return_exceptions=True)
                
                # Count successful results and handle errors
                for processed_result in processed_results:
                    if isinstance(processed_result, Exception):
                        result.errors.append(str(processed_result))
                    elif processed_result:
                        result.files_saved += 1
                        if hasattr(processed_result, 'is_spine') and processed_result.is_spine:
                            result.spine_assets_found += 1
                
                # Clean up original asset file
                file_path.unlink()
                log.info(f"✓ Processed {file_path.name} ({result.objects_processed} objects, {result.files_saved} files)")
                
            except Exception as e:
                error_msg = f"Failed to process {file_path.name}: {str(e)}"
                log.exception(error_msg)
                result.errors.append(error_msg)
            
            return result

    async def _process_object(self, obj, file_path: Path, region: ServerRegion):
        """Process a single Unity object."""
        try:
            # Check if it's a Spine asset first
            if self._spine_processor.is_spine_asset(obj):
                return await self._spine_processor.process(obj, file_path, region)
            
            # Use standard processor
            processor = self._processor_factory.get_processor(obj)
            if processor:
                return await processor.process(obj, file_path, region)
            
            return None
            
        except Exception as e:
            log.exception(f"Error processing object {obj}: {str(e)}")
            return None

    async def unpack_region(self, region: ServerRegion, show_progress: bool = True) -> Dict[str, any]:
        """Unpack all assets for a specific region."""
        asset_files = self._get_asset_files(region)
        
        if not asset_files:
            log.warning(f"No asset files found for {region.value}")
            return {"region": region.value, "files_processed": 0, "total_objects": 0, "total_saved": 0, "spine_assets": 0, "errors": 0}
        
        log.info(f"Found {len(asset_files)} asset files for {region.value}")
        
        # Process files with optional progress bar
        if show_progress:
            from rich.progress import Progress, SpinnerColumn, BarColumn, TaskProgressColumn, TimeRemainingColumn
            
            with Progress(
                SpinnerColumn(),
                f"Unpacking ({region.value})",
                BarColumn(),
                TaskProgressColumn(),
                TimeRemainingColumn(),
                transient=False,
            ) as progress:
                task_id = progress.add_task(f"Processing {region.value}", total=len(asset_files))
                
                tasks = [
                    self._process_asset_file(file_path, region)
                    for file_path in asset_files
                ]
                
                results = []
                for coro in asyncio.as_completed(tasks):
                    result = await coro
                    results.append(result)
                    progress.advance(task_id, 1)
        else:
            # Process without progress bar
            tasks = [
                self._process_asset_file(file_path, region)
                for file_path in asset_files
            ]
            results = await asyncio.gather(*tasks)
        
        # Aggregate results
        total_objects = sum(r.objects_processed for r in results)
        total_saved = sum(r.files_saved for r in results)
        total_spine = sum(r.spine_assets_found for r in results)
        total_errors = sum(len(r.errors) for r in results)
        
        log.info(f"✓ {region.value}: {len(asset_files)} files, {total_objects} objects, {total_saved} files saved, {total_spine} spine assets, {total_errors} errors")
        
        return {
            "region": region.value,
            "files_processed": len(asset_files),
            "total_objects": total_objects,
            "total_saved": total_saved,
            "spine_assets": total_spine,
            "errors": total_errors
        }

    async def unpack_all(self, regions: Optional[List[ServerRegion]] = None, show_progress: bool = True) -> Dict[str, any]:
        """Unpack assets for all enabled regions concurrently."""
        if regions is None:
            regions = self._config.get_enabled_servers()
        
        log.info(f"Unpacking assets for regions: {', '.join(r.value for r in regions)}")
        
        # Process all regions concurrently
        tasks = [
            self.unpack_region(region, show_progress)
            for region in regions
        ]
        
        results = await asyncio.gather(*tasks)
        
        # Aggregate all results
        total_files = sum(r["files_processed"] for r in results)
        total_objects = sum(r["total_objects"] for r in results)
        total_saved = sum(r["total_saved"] for r in results)
        total_spine = sum(r["spine_assets"] for r in results)
        total_errors = sum(r["errors"] for r in results)
        
        log.info(f"✓ Unpacking complete: {total_files} files, {total_objects} objects, {total_saved} files saved, {total_spine} spine assets, {total_errors} errors")
        
        return {
            "regions": results,
            "total_files": total_files,
            "total_objects": total_objects,
            "total_saved": total_saved,
            "spine_assets": total_spine,
            "errors": total_errors
        }

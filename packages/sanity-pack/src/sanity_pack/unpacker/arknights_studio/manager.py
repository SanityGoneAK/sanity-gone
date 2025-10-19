"""Asset unpacker using Arknights Studio tools."""

import shutil
import subprocess
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import List, Optional

from sanity_pack.utils.logger import log
from sanity_pack.config.models import Config, ServerRegion
from sanity_pack.unpacker.base import AssetUnpacker


class ArknightsStudioExtractor(AssetUnpacker):
    """Handles extraction of Unity assets using Arknights Studio tools.
    
    Arknights Studio provides a higher-level interface for asset extraction,
    with better support for game-specific structures like prefabs.
    """
    
    def __init__(self, config: Config, region: ServerRegion, concurrency: int = 128):
        super().__init__(config, region, concurrency)
        self._semaphore = threading.Semaphore(concurrency)  # Limit concurrent extractions
        
        # Validate Arknights Studio configuration
        if not config.arknights_studio:
            raise ValueError(
                "Arknights Studio configuration is required when using ARKNIGHTS_STUDIO unpack mode. "
                "Please add 'arknights_studio' section to your config."
            )
        
        self._cli_dll_path = config.arknights_studio.cli_dll_path
        
        # Validate CLI DLL exists
        if not self._cli_dll_path.exists():
            raise FileNotFoundError(
                f"ArknightsStudioCLI.dll not found at: {self._cli_dll_path}\n"
                "Please ensure the CLI is installed and the path in config is correct."
            )
    
    def _run_cli(self, input_path: Path, output_path: Path) -> None:
        """Run ArknightsStudioCLI to extract assets.
        
        Args:
            input_path: Path to asset file or folder to process
            output_path: Path to output directory
        """
        # Build command
        cmd = [
            "dotnet",
            str(self._cli_dll_path),
            str(input_path),
            "-o", str(output_path),
            "-g", "containerFull",  # Group by container path
            "--image-format", "webp",  # Use asset name for filename
        ]
        try:
            result = subprocess.run(
                cmd,
                check=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            if result.stdout:
                log.info(f"CLI output: {result.stdout}")
                
        except subprocess.CalledProcessError as e:
            error_msg = e.stderr if e.stderr else str(e)
            log.error(f"ArknightsStudioCLI failed: {error_msg}")
            raise
        except FileNotFoundError:
            raise RuntimeError(
                "dotnet command not found. Please ensure .NET runtime is installed.\n"
                "Download from: https://dotnet.microsoft.com/download"
            )

    def unpack(self) -> None:
        """Unpack all assets using Arknights Studio CLI."""
        log.info(f"\nProcessing {self._region.value} server assets with Arknights Studio...")
        log.info(f"CLI Path: {self._cli_dll_path}")
        
        server_dir = self.config.output_dir / self._region.value.lower()

        self._run_cli(server_dir, server_dir)
        
        # Move all folders from server_dir/dyn to server_dir
        dyn_dir = server_dir / "dyn"
        if dyn_dir.exists() and dyn_dir.is_dir():
            log.info(f"Moving extracted assets from {dyn_dir} to {server_dir}")
            for item in dyn_dir.iterdir():
                if item.is_dir():
                    dest = server_dir / item.name
                    if dest.exists():
                        log.warning(f"Destination {dest} already exists, merging contents...")
                        shutil.copytree(item, dest, dirs_exist_ok=True)
                        shutil.rmtree(item)
                    else:
                        shutil.move(str(item), str(dest))
                    log.info(f"Moved {item.name} to {server_dir}")
            
            # Remove empty dyn directory
            if not any(dyn_dir.iterdir()):
                dyn_dir.rmdir()
                log.info(f"Removed empty dyn directory")
        
        log.info(f"Completed Arknights Studio unpacking for {self._region.value}")

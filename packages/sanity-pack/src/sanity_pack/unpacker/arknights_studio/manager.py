"""Asset unpacker using Arknights Studio tools."""

import shutil
import subprocess
import threading
from pathlib import Path
import os
import re


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
            "-t", "Sprite,AkPortraitSprite,AudioClip,TextAsset",
            "--image-format", "webp",  # Use webp for image formats
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

        # Taken and modified from Ashlen's ArknightsAssets repo, resolves a bunch of issues with folder structures.
        # https://github.com/ArknightsAssets/ArknightsAssets2/blob/master/script.py
        for root, dirs, files in os.walk(server_dir):
            # when a file is alone in its directory then move it up a directory
            # when a file is in a numbered directory (with #) then also move it up a directory
            # when a file is in the form filename_#00.ext and there exists filename.ext, skip it, as it is a duplicate due to assetstudio
            for file in files:
                if (match := re.match(r"^(.+?)(_#\d+?)(\..+?)$", file)) and match[1] + match[3] in files:
                    continue
                current_path = os.path.join(root, file)
                if len(files) == 1 or "#" in root:
                    desired_relpath = os.path.join(os.path.dirname(os.path.dirname(os.path.relpath(current_path, server_dir))), file)
                    log.info(f"Copying {current_path} to {desired_relpath}")
                    future_path = os.path.join(server_dir, desired_relpath).lower()
                    log.info(f"Future Path {future_path}")
                else:
                    future_path = os.path.join(server_dir, os.path.relpath(current_path, server_dir).lower())
                    log.info(f"Current Path {current_path}")
                    log.info(f"Future Path {future_path}")

                os.makedirs(os.path.dirname(future_path), exist_ok=True)
                shutil.move(os.path.abspath(current_path), os.path.abspath(future_path))
            for directory in dirs:
                full_path = os.path.join(root, directory)
                if not os.listdir(full_path):
                    os.rmdir(full_path)
        
        log.info(f"Completed Arknights Studio unpacking for {self._region.value}")

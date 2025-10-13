"""Safe file saver with format detection and async operations."""

import asyncio
import json
from pathlib import Path
from typing import Any, Dict, Optional, Union
from dataclasses import dataclass

import aiofiles
import aiofiles.os
from PIL import Image

from sanity_pack.config.models import ServerRegion
from sanity_pack.utils.logger import log


@dataclass
class SaveResult:
    """Result of saving a file."""
    success: bool
    file_path: Path
    size_bytes: int
    error: Optional[str] = None


class SafeFileSaver:
    """Handles safe file saving with format detection and async operations."""

    def __init__(self):
        self._save_semaphore = asyncio.Semaphore(100)  # Limit concurrent saves

    def _detect_image_format(self, file_path: Path, content: Image.Image) -> str:
        """Detect the best image format based on file path and content."""
        path_str = str(file_path).lower()
        
        # Special cases for different asset types
        if "dynchars" in path_str or "spine" in path_str:
            return "PNG"  # PNG for dynamic characters and spine assets
        elif "charportraits" in path_str or "charavatars" in path_str:
            return "WEBP"  # WEBP for character portraits
        elif "item" in path_str:
            return "WEBP"  # WEBP for items (smaller size)
        elif "arts" in path_str:
            return "WEBP"  # WEBP for general arts
        else:
            # Default to WEBP for smaller file sizes
            return "WEBP"

    def _get_save_path(self, original_path: Path, base_dir: Path, region: ServerRegion) -> Path:
        """Determine the final save path for an asset, preserving Unity structure."""
        # Start with the original path structure
        target_path = base_dir / original_path
        
        # Apply specific overrides only when needed
        target_path_str = target_path.as_posix()
        
        # Override for items to use organized structure
        if "/arts/item" in target_path_str:
            target_path = base_dir / "arts/items" / original_path.name
        
        # Override for charavatars to use organized structure  
        if "/arts/charavatars" in target_path_str:
            target_path = base_dir / "arts/charavatars" / original_path.name
        
        return target_path

    async def save_image(self, content: Image.Image, file_path: Path, region: ServerRegion) -> SaveResult:
        """Save an image with format detection."""
        async with self._save_semaphore:
            try:
                # Determine save path and format
                base_dir = Path("assets") / region.value.lower()
                save_path = self._get_save_path(file_path, base_dir, region)
                format_type = self._detect_image_format(save_path, content)
                
                # Add appropriate extension
                if format_type == "PNG":
                    save_path = save_path.with_suffix(".png")
                elif format_type == "WEBP":
                    save_path = save_path.with_suffix(".webp")
                else:
                    save_path = save_path.with_suffix(".png")
                
                # Ensure directory exists
                await aiofiles.os.makedirs(save_path.parent, exist_ok=True)
                
                # Save image in executor to avoid blocking
                def _save():
                    content.save(save_path, format=format_type, optimize=True)
                    return save_path.stat().st_size
                
                size_bytes = await asyncio.get_event_loop().run_in_executor(None, _save)
                
                log.debug(f"Saved image: {save_path} ({size_bytes} bytes)")
                return SaveResult(success=True, file_path=save_path, size_bytes=size_bytes)
                
            except Exception as e:
                error_msg = f"Failed to save image {file_path}: {str(e)}"
                log.exception(error_msg)
                return SaveResult(success=False, file_path=file_path, size_bytes=0, error=error_msg)

    async def save_text(self, content: Union[str, bytes], file_path: Path, region: ServerRegion, encoding: str = "utf-8") -> SaveResult:
        """Save text content to file."""
        async with self._save_semaphore:
            try:
                base_dir = Path("assets") / region.value.lower()
                save_path = self._get_save_path(file_path, base_dir, region)
                
                # Ensure directory exists
                await aiofiles.os.makedirs(save_path.parent, exist_ok=True)
                
                # Handle encoding
                if isinstance(content, str):
                    content_bytes = content.encode(encoding, "surrogateescape")
                else:
                    content_bytes = content
                
                # Save file
                async with aiofiles.open(save_path, 'wb') as f:
                    await f.write(content_bytes)
                
                size_bytes = len(content_bytes)
                log.debug(f"Saved text: {save_path} ({size_bytes} bytes)")
                return SaveResult(success=True, file_path=save_path, size_bytes=size_bytes)
                
            except Exception as e:
                error_msg = f"Failed to save text {file_path}: {str(e)}"
                log.exception(error_msg)
                return SaveResult(success=False, file_path=file_path, size_bytes=0, error=error_msg)

    async def save_json(self, content: Dict[str, Any], file_path: Path, region: ServerRegion) -> SaveResult:
        """Save JSON data to file."""
        async with self._save_semaphore:
            try:
                base_dir = Path("assets") / region.value.lower()
                save_path = self._get_save_path(file_path, base_dir, region).with_suffix('.json')
                
                # Ensure directory exists
                await aiofiles.os.makedirs(save_path.parent, exist_ok=True)
                
                # Convert to JSON string
                json_str = json.dumps(content, indent=2, ensure_ascii=False)
                content_bytes = json_str.encode('utf-8', 'surrogateescape')
                
                # Save file
                async with aiofiles.open(save_path, 'wb') as f:
                    await f.write(content_bytes)
                
                size_bytes = len(content_bytes)
                log.debug(f"Saved JSON: {save_path} ({size_bytes} bytes)")
                return SaveResult(success=True, file_path=save_path, size_bytes=size_bytes)
                
            except Exception as e:
                error_msg = f"Failed to save JSON {file_path}: {str(e)}"
                log.exception(error_msg)
                return SaveResult(success=False, file_path=file_path, size_bytes=0, error=error_msg)

    async def save_audio(self, content: Dict[str, bytes], file_path: Path, region: ServerRegion) -> SaveResult:
        """Save audio data to files."""
        async with self._save_semaphore:
            try:
                base_dir = Path("assets") / region.value.lower()
                total_size = 0
                saved_files = []
                
                for name, audio_data in content.items():
                    audio_path = self._get_save_path(Path(name), base_dir, region)
                    
                    # Ensure directory exists
                    await aiofiles.os.makedirs(audio_path.parent, exist_ok=True)
                    
                    # Save audio file
                    async with aiofiles.open(audio_path, 'wb') as f:
                        await f.write(audio_data)
                    
                    total_size += len(audio_data)
                    saved_files.append(audio_path)
                
                log.debug(f"Saved audio: {len(saved_files)} files ({total_size} bytes)")
                return SaveResult(success=True, file_path=file_path, size_bytes=total_size)
                
            except Exception as e:
                error_msg = f"Failed to save audio {file_path}: {str(e)}"
                log.exception(error_msg)
                return SaveResult(success=False, file_path=file_path, size_bytes=0, error=error_msg)

    async def save_spine_assets(self, spine_data: Dict[str, Any], file_path: Path, region: ServerRegion) -> SaveResult:
        """Save Spine asset data (atlas, skeleton, textures)."""
        async with self._save_semaphore:
            try:
                base_dir = Path("assets") / region.value.lower() / "spine"
                total_size = 0
                saved_files = []
                
                for asset_type, content in spine_data.items():
                    if asset_type == "atlas":
                        # Save atlas file
                        atlas_path = base_dir / f"{file_path.stem}.atlas"
                        await aiofiles.os.makedirs(atlas_path.parent, exist_ok=True)
                        async with aiofiles.open(atlas_path, 'wb') as f:
                            await f.write(content.encode('utf-8'))
                        total_size += len(content.encode('utf-8'))
                        saved_files.append(atlas_path)
                    
                    elif asset_type == "skeleton":
                        # Save skeleton file (JSON or binary)
                        skel_path = base_dir / f"{file_path.stem}.json"
                        await aiofiles.os.makedirs(skel_path.parent, exist_ok=True)
                        async with aiofiles.open(skel_path, 'wb') as f:
                            await f.write(content.encode('utf-8'))
                        total_size += len(content.encode('utf-8'))
                        saved_files.append(skel_path)
                    
                    elif asset_type == "textures":
                        # Save texture files
                        for tex_name, tex_data in content.items():
                            tex_path = base_dir / f"{tex_name}.png"
                            await aiofiles.os.makedirs(tex_path.parent, exist_ok=True)
                            await asyncio.get_event_loop().run_in_executor(
                                None, lambda: tex_data.save(tex_path)
                            )
                            total_size += tex_path.stat().st_size
                            saved_files.append(tex_path)
                
                log.debug(f"Saved Spine assets: {len(saved_files)} files ({total_size} bytes)")
                return SaveResult(success=True, file_path=file_path, size_bytes=total_size)
                
            except Exception as e:
                error_msg = f"Failed to save Spine assets {file_path}: {str(e)}"
                log.exception(error_msg)
                return SaveResult(success=False, file_path=file_path, size_bytes=0, error=error_msg)

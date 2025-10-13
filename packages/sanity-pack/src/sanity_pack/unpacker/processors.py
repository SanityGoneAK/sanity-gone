"""Modular asset processors for different Unity object types."""

import asyncio
from pathlib import Path
from typing import Any, Dict, Optional, Protocol, TypeVar, Union
from dataclasses import dataclass

import UnityPy
from UnityPy.classes import Texture2D, Sprite, TextAsset, MonoBehaviour, AudioClip, Object, MonoScript

from sanity_pack.config.models import ServerRegion
from sanity_pack.utils.logger import log
from .saver import SafeFileSaver

T = TypeVar('T', bound=Object)


@dataclass
class ProcessResult:
    """Result of processing a Unity object."""
    success: bool
    object_name: str
    object_type: str
    file_path: Path
    size_bytes: int
    error: Optional[str] = None
    is_spine: bool = False


class AssetProcessor(Protocol[T]):
    """Protocol for asset processors."""
    async def process(self, obj: T, file_path: Path, region: ServerRegion) -> Optional[ProcessResult]:
        """Process a Unity object and return the result."""
        ...


class TextureProcessor:
    """Processor for Texture2D objects."""
    
    def __init__(self):
        self._saver = SafeFileSaver()

    async def process(self, obj: Texture2D, file_path: Path, region: ServerRegion) -> Optional[ProcessResult]:
        """Process a Texture2D object."""
        try:
            data = obj.read()
            if not hasattr(data, 'image') or not data.image:
                return None
            
            # Get object name and construct proper path
            name = getattr(data, 'm_Name', obj.m_Name or 'unknown_texture')
            
            # Use container path if available, otherwise use object name
            if obj.container:
                asset_path = Path(*Path(obj.container).parts[1:-1]) / name
            else:
                asset_path = Path(name)
            
            # Save the image
            result = await self._saver.save_image(data.image, asset_path, region)
            
            if result.success:
                return ProcessResult(
                    success=True,
                    object_name=name,
                    object_type="Texture2D",
                    file_path=result.file_path,
                    size_bytes=result.size_bytes
                )
            else:
                return ProcessResult(
                    success=False,
                    object_name=name,
                    object_type="Texture2D",
                    file_path=Path(name),
                    size_bytes=0,
                    error=result.error
                )
                
        except Exception as e:
            log.exception(f"Error processing texture: {str(e)}")
            return ProcessResult(
                success=False,
                object_name=obj.m_Name or 'unknown',
                object_type="Texture2D",
                file_path=Path(obj.m_Name or 'unknown'),
                size_bytes=0,
                error=str(e)
            )


class SpriteProcessor:
    """Processor for Sprite objects."""
    
    def __init__(self):
        self._saver = SafeFileSaver()

    async def process(self, obj: Sprite, file_path: Path, region: ServerRegion) -> Optional[ProcessResult]:
        """Process a Sprite object."""
        try:
            data = obj.read()
            if not hasattr(data, 'image') or not data.image:
                return None
            
            # Get object name and construct proper path
            name = getattr(data, 'm_Name', obj.m_Name or 'unknown_sprite')
            
            # Use container path if available, otherwise use object name
            if obj.container:
                asset_path = Path(*Path(obj.container).parts[1:-1]) / name
            else:
                asset_path = Path(name)
            
            # Save the image
            result = await self._saver.save_image(data.image, asset_path, region)
            
            if result.success:
                return ProcessResult(
                    success=True,
                    object_name=name,
                    object_type="Sprite",
                    file_path=result.file_path,
                    size_bytes=result.size_bytes
                )
            else:
                return ProcessResult(
                    success=False,
                    object_name=name,
                    object_type="Sprite",
                    file_path=Path(name),
                    size_bytes=0,
                    error=result.error
                )
                
        except Exception as e:
            log.exception(f"Error processing sprite: {str(e)}")
            return ProcessResult(
                success=False,
                object_name=obj.m_Name or 'unknown',
                object_type="Sprite",
                file_path=Path(obj.m_Name or 'unknown'),
                size_bytes=0,
                error=str(e)
            )


class TextAssetProcessor:
    """Processor for TextAsset objects."""
    
    def __init__(self):
        self._saver = SafeFileSaver()

    async def process(self, obj: TextAsset, file_path: Path, region: ServerRegion) -> Optional[ProcessResult]:
        """Process a TextAsset object."""
        try:
            data = obj.read()
            content = data.m_Script
            
            # Get object name and construct proper path
            name = getattr(data, 'm_Name', obj.m_Name or 'unknown_text')
            
            # Use container path if available, otherwise use object name
            if obj.container:
                asset_path = Path(*Path(obj.container).parts[1:-1]) / name
            else:
                asset_path = Path(name)
            
            # Determine if it's JSON or plain text
            if content.strip().startswith('{') and content.strip().endswith('}'):
                # Try to parse as JSON
                import json
                try:
                    json_data = json.loads(content)
                    result = await self._saver.save_json(json_data, asset_path, region)
                except json.JSONDecodeError:
                    # Not valid JSON, save as text
                    result = await self._saver.save_text(content, asset_path, region)
            else:
                # Save as text
                result = await self._saver.save_text(content, asset_path, region)
            
            if result.success:
                return ProcessResult(
                    success=True,
                    object_name=name,
                    object_type="TextAsset",
                    file_path=result.file_path,
                    size_bytes=result.size_bytes
                )
            else:
                return ProcessResult(
                    success=False,
                    object_name=name,
                    object_type="TextAsset",
                    file_path=Path(name),
                    size_bytes=0,
                    error=result.error
                )
                
        except Exception as e:
            log.exception(f"Error processing text asset: {str(e)}")
            return ProcessResult(
                success=False,
                object_name=obj.m_Name or 'unknown',
                object_type="TextAsset",
                file_path=Path(obj.m_Name or 'unknown'),
                size_bytes=0,
                error=str(e)
            )


class MonoBehaviourProcessor:
    """Processor for MonoBehaviour objects."""
    
    def __init__(self):
        self._saver = SafeFileSaver()

    async def process(self, obj: MonoBehaviour, file_path: Path, region: ServerRegion) -> Optional[ProcessResult]:
        """Process a MonoBehaviour object."""
        try:
            data = obj.read()
            
            # Get object name and construct proper path
            name = getattr(data, 'm_Name', obj.m_Name or 'unknown_monobehaviour')
            
            # Use container path if available, otherwise use object name
            if obj.container:
                asset_path = Path(*Path(obj.container).parts[1:-1]) / name
            else:
                asset_path = Path(name)
            
            # Try to get type tree
            if obj.serialized_type and obj.serialized_type.node:
                tree = obj.read_typetree()
                result = await self._saver.save_json(tree, asset_path, region)
            else:
                # Fallback to basic data
                basic_data = {
                    "m_Name": getattr(data, 'm_Name', 'unknown'),
                    "m_GameObject": getattr(data, 'm_GameObject', None),
                    "m_Enabled": getattr(data, 'm_Enabled', True)
                }
                result = await self._saver.save_json(basic_data, asset_path, region)
            
            if result.success:
                return ProcessResult(
                    success=True,
                    object_name=name,
                    object_type="MonoBehaviour",
                    file_path=result.file_path,
                    size_bytes=result.size_bytes
                )
            else:
                return ProcessResult(
                    success=False,
                    object_name=name,
                    object_type="MonoBehaviour",
                    file_path=Path(name),
                    size_bytes=0,
                    error=result.error
                )
                
        except Exception as e:
            log.exception(f"Error processing MonoBehaviour: {str(e)}")
            return ProcessResult(
                success=False,
                object_name=obj.m_Name or 'unknown',
                object_type="MonoBehaviour",
                file_path=Path(obj.m_Name or 'unknown'),
                size_bytes=0,
                error=str(e)
            )


class AudioClipProcessor:
    """Processor for AudioClip objects."""
    
    def __init__(self):
        self._saver = SafeFileSaver()

    async def process(self, obj: AudioClip, file_path: Path, region: ServerRegion) -> Optional[ProcessResult]:
        """Process an AudioClip object."""
        try:
            clip = obj.read()
            
            # Get object name and construct proper path
            name = getattr(clip, 'm_Name', obj.m_Name or 'unknown_audio')
            
            # Use container path if available, otherwise use object name
            if obj.container:
                asset_path = Path(*Path(obj.container).parts[1:-1]) / name
            else:
                asset_path = Path(name)
            
            # Extract audio samples
            audio_data = {}
            if hasattr(clip, 'samples') and clip.samples:
                audio_data = {name: byte for name, byte in clip.samples.items()}
            
            if not audio_data:
                return None
            
            # Save audio files
            result = await self._saver.save_audio(audio_data, asset_path, region)
            
            if result.success:
                return ProcessResult(
                    success=True,
                    object_name=name,
                    object_type="AudioClip",
                    file_path=result.file_path,
                    size_bytes=result.size_bytes
                )
            else:
                return ProcessResult(
                    success=False,
                    object_name=name,
                    object_type="AudioClip",
                    file_path=Path(name),
                    size_bytes=0,
                    error=result.error
                )
                
        except Exception as e:
            log.exception(f"Error processing AudioClip: {str(e)}")
            return ProcessResult(
                success=False,
                object_name=obj.m_Name or 'unknown',
                object_type="AudioClip",
                file_path=Path(obj.m_Name or 'unknown'),
                size_bytes=0,
                error=str(e)
            )


class AssetProcessorFactory:
    """Factory for creating asset processors."""
    
    def __init__(self):
        self._processors = {
            Texture2D: TextureProcessor(),
            Sprite: SpriteProcessor(),
            TextAsset: TextAssetProcessor(),
            MonoBehaviour: MonoBehaviourProcessor(),
            AudioClip: AudioClipProcessor(),
        }

    def get_processor(self, obj: Object) -> Optional[AssetProcessor]:
        """Get the appropriate processor for a Unity object."""
        try:
            # Get the actual object type
            obj_type = type(obj.read())
            
            # Check if we have a processor for this type
            for processor_type, processor in self._processors.items():
                if issubclass(obj_type, processor_type):
                    return processor
            
            # Special case for MonoScript - skip it
            if isinstance(obj, MonoScript):
                return None
            
            # Log unhandled types
            log.debug(f"No processor found for object type: {obj_type.__name__}")
            return None
            
        except Exception as e:
            log.exception(f"Error determining processor for object: {str(e)}")
            return None

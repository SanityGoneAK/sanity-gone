from dataclasses import dataclass
from typing import Dict, List, Optional, Union, Tuple, Any, Protocol, runtime_checkable, TypeVar, Generic
from pathlib import Path
from UnityPy.classes import Texture2D, Sprite, AssetBundle, TextAsset, MonoBehaviour, AudioClip, Object, MonoScript
from UnityPy.files import ObjectReader

from sanity_pack.utils.logger import log

T = TypeVar('T', bound=ObjectReader)

@dataclass
class AssetResult:
    """Result of processing an asset."""
    obj: ObjectReader
    content: Any
    object_type: type
    name: str

@runtime_checkable
class AssetProcessor(Protocol[T]):
    """Protocol for asset processors."""
    def process(self, obj: T) -> Optional[AssetResult]:
        """Process a Unity object and return the result."""
        ...

class TextureProcessor(AssetProcessor[ObjectReader[Texture2D]]):
    """Processor for Texture2D objects."""
    def process(self, obj: ObjectReader[Texture2D]) -> Optional[AssetResult]:
        try:
            data = obj.read()
            return AssetResult(
                name=getattr(data, 'm_Name', None),
                obj=obj,
                content=data.image,
                object_type=Texture2D,
            )
        except Exception as e:
            log.exception(f"Error processing texture")
            return None

class SpriteProcessor(AssetProcessor[ObjectReader[Sprite]]):
    """Processor for Sprite objects."""
    def process(self, obj: ObjectReader[Sprite]) -> Optional[AssetResult]:
        try:
            data = obj.read()
            return AssetResult(
                name=getattr(data, 'm_Name', None),
                obj=obj,
                content=data.image,
                object_type=Sprite,
            )
        except Exception as e:
            log.exception(f"Error processing sprite")
            return None

class TextAssetProcessor(AssetProcessor[ObjectReader[TextAsset]]):
    """Processor for TextAsset objects."""
    def process(self, obj: ObjectReader[TextAsset]) -> Optional[AssetResult]:
        try:
            data = obj.read()
            return AssetResult(
                name=Path(obj.container).name if obj.container else getattr(data, 'm_Name', None),
                obj=obj,
                content=data.m_Script.encode("utf-8", "surrogateescape"),
                object_type=TextAsset,
            )
        except Exception as e:
            log.exception(f"Error processing text asset")
            return None

class MonoBehaviourProcessor(AssetProcessor[ObjectReader[MonoBehaviour]]):
    """Processor for MonoBehaviour objects."""
    def process(self, obj: ObjectReader[MonoBehaviour]) -> Optional[AssetResult]:
        try:
            obj.read()
            if obj.serialized_type.node:
                tree = obj.read_typetree()
                return AssetResult(
                    name=tree["m_Name"],
                    obj=obj,
                    content=tree,
                    object_type=MonoBehaviour,
                )
        except Exception as e:
            log.exception(f"Error processing MonoBehaviour")
        return None

class AudioClipProcessor(AssetProcessor[ObjectReader[AudioClip]]):
    """Processor for AudioClip objects."""
    def process(self, obj: ObjectReader[AudioClip]) -> Optional[AssetResult]:
        try:
            clip = obj.read()
            return AssetResult(
                obj=obj,
                name=str(Path(obj.container).stem),
                content={name: byte for name, byte in clip.samples.items()},
                object_type=AudioClip,
            )
        except Exception as e:
            log.exception(f"Error processing AudioClip")
            return None

class AssetProcessorFactory:
    """Factory for creating asset processors."""
    @staticmethod
    def get_processor(obj: ObjectReader) -> Optional[AssetProcessor]:
        """Get the appropriate processor for a Unity object."""
        try:
            obj_type = obj.read()
            match obj_type:
                case MonoScript():
                    return None
                case Texture2D():
                    return TextureProcessor()
                case Sprite():
                    return SpriteProcessor()
                case TextAsset():
                    return TextAssetProcessor()
                case MonoBehaviour():
                    return MonoBehaviourProcessor()
                case AudioClip():
                    return AudioClipProcessor()
                case _:
                    if isinstance(obj, AssetBundle) and getattr(obj, "m_Name", None):
                        log.warning(f'Found unhandled Object type named "{obj.m_Name}"')
                    return None
        except Exception as e:
            log.error(f"Error determining processor: {str(e)}", exc_info=True)
            return None
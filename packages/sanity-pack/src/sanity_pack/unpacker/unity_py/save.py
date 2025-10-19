from pathlib import Path
import json
from PIL.Image import Image

import UnityPy
from UnityPy.files import ObjectReader
from UnityPy.classes import Texture2D, Sprite, AssetBundle, TextAsset, MonoBehaviour, AudioClip, Object, MonoScript

from sanity_pack.unpacker.unity_py.processors import ObjectResult
from sanity_pack.utils.logger import log

# Path override configuration for images
# Maps source path patterns to their target directory
IMAGE_PATH_OVERRIDES = {
    "/arts/item": "arts/items", # items has many nested folders this flattens that structure
    "/arts/charavatars": "arts/charavatars", # same with charavatars, elite avatars are in nested folders
}

def _apply_path_overrides(target_path: Path, base_dir: Path, overrides: dict[str, str]) -> Path:
    """Apply path overrides based on configuration.
    
    Args:
        target_path: The original target path
        base_dir: The base output directory
        overrides: Dictionary mapping source patterns to target directories
    
    Returns:
        Modified path if an override matches, otherwise the original path
    """
    target_path_str = target_path.as_posix()
    
    for source_pattern, target_dir in overrides.items():
        if source_pattern in target_path_str:
            return base_dir / target_dir / target_path.name
    
    return target_path

def _get_target_path(obj: ObjectReader, name: str, source_dir: Path, output_dir: Path) -> Path:
    """Determine the target path for saving an asset."""
    if obj.container:
        source_dir = Path(*Path(obj.container).parts[1:-1])

    assert isinstance(name, str)
    return output_dir / source_dir / name

class Save:
    @staticmethod
    def object(result: ObjectResult, asset_path: Path, base_dir: Path) -> None:
        """Save an asset to disk."""
        target_path = _get_target_path(
            result.obj,
            result.name,
            asset_path.parent,
            base_dir
        )
        # TODO: Handle Spine Assets separately
        target_path.parent.mkdir(parents=True, exist_ok=True)
        log.info(f"Saving to path: {str(target_path)}...")

        match result.object_type:
            case UnityPy.classes.Sprite | UnityPy.classes.Texture2D:
                target_path = target_path.with_suffix(".webp")
                target_path = _apply_path_overrides(target_path, base_dir, IMAGE_PATH_OVERRIDES)
                Save.image(result.content, target_path)
            case UnityPy.classes.TextAsset:
                Save.bytes(result.content, target_path)
            case UnityPy.classes.MonoBehaviour:
                Save.json(result.content, target_path)
            case UnityPy.classes.AudioClip:
                for name, audio_data in result.content.items():
                    audio_path = _get_target_path(result.obj, name, asset_path, base_dir)
                    audio_path.parent.mkdir(parents=True, exist_ok=True)
                    Save.bytes(audio_data, audio_path)


    @staticmethod
    def image(image: Image, target_path: Path) -> None:
        """Save an image to disk."""
        image.save(target_path)

    @staticmethod
    def bytes(data: bytes, target_path: Path) -> None:
        """Save a bytes to disk."""
        with open(target_path, 'wb') as f:
            f.write(data)

    @staticmethod
    def json(data, target_path: Path):
        """Save a json file to disk."""
        target_path = target_path.with_suffix('.json')
        with open(target_path, 'w', encoding='utf-8') as f:
            f.write(json.dumps(data, indent=2, ensure_ascii=False))
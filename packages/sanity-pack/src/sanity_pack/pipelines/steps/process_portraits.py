"""Process portrait images pipeline step."""
import json
from typing import Optional, Set
from PIL import Image
from pathlib import Path

from typing import List, Optional

from sanity_pack.config.models import UnpackMode
from sanity_pack.pipelines.base import PipelineStep
from sanity_pack.utils.logger import log


class ProcessPortraitsStep(PipelineStep):
    """Process portrait images (Unity Py mode only)."""
    
    @property
    def name(self) -> str:
        return "Process Portraits"
    
    @property
    def required_modes(self) -> Optional[Set[UnpackMode]]:
        return {UnpackMode.UNITY_PY}

    def _get_portrait_paths(self) -> List[Path]:
        portrait_dir = self._output_dir / "arts" / "charportraits"

        if not portrait_dir.exists():
            return []

        return list(portrait_dir.glob("portraits#*.json"))

    def process_portrait(self, atlas_path: Path, sprite_data: dict, output_path: Optional[Path] = None) -> Image.Image:
        """Process a portrait from an atlas using sprite data."""
        # Load the atlas image
        atlas = Image.open(atlas_path)

        # Extract sprite information from the data
        rect = sprite_data.get("rect", {})
        x = rect.get("x", 0)
        y = rect.get("y", 0)
        width = rect.get("w", 0)
        height = rect.get("h", 0)

        # Convert from Unity's bottom-left origin to PIL's top-left origin
        # Unity's y coordinate is from bottom, so we need to subtract the height
        # and then subtract the y coordinate from the total height
        atlas_height = atlas.size[1]
        y_pil = atlas_height - (y + height)

        # Crop the sprite from the atlas
        sprite = atlas.crop((x, y_pil, x + width, y_pil + height))

        # Extract rotation if present
        rotation = sprite_data.get("rotate", 0)

        # Apply rotation if needed
        if rotation != 0:
            sprite = sprite.rotate(-90, expand=True)

        if output_path:
            sprite.save(output_path)

        return sprite

    def _process_atlas(self, json_path: Path) -> None:
        """Process a single portrait atlas."""
        try:
            # Load the JSON data
            with open(json_path) as f:
                atlas_data = json.load(f)

            # Get the atlas image path (same name but with .png extension)
            atlas_image_path = json_path.with_suffix(".webp")
            if not atlas_image_path.exists():
                log.warning(f"Warning: Atlas image not found for {json_path}")
                return

            # Process each sprite in the atlas
            for sprite in atlas_data.get("_sprites", []):
                try:
                    char_name = sprite["name"]

                    output_path = json_path.parent / f"{char_name}.webp"
                    self.process_portrait(atlas_image_path, sprite, output_path)
                    log.info(f"Processed portrait: {char_name}")

                except Exception as e:
                    log.exception(f"Error processing sprite {sprite.get('name', 'unknown')}")

            # Clean up original files
            json_path.unlink()
            atlas_image_path.unlink()
            log.info(f"Cleaned up atlas files: {json_path.stem}")

        except Exception as e:
            log.error(f"Error processing atlas {json_path}",)

    def process(self) -> None:
        """Process portrait images from unpacked assets."""

        portrait_paths = self._get_portrait_paths()
        for json_path in portrait_paths:
            self._process_atlas(json_path)

        log.info(f"Processing portraits in {self._output_dir}")

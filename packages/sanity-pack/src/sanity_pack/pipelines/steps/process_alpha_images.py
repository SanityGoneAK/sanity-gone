"""Process alpha images pipeline step."""

import re
from pathlib import Path
from typing import Optional, List, Tuple, Set

from PIL import Image
from PIL.Image import Resampling

from sanity_pack.config.models import UnpackMode
from sanity_pack.pipelines.base import PipelineStep
from sanity_pack.utils.logger import log


class ProcessAlphaImagesStep(PipelineStep):
    """Process images with alpha channels (Unity Py mode only)."""

    ALPHA_SUFFIXES = [
        r"\[alpha\](\$[0-9]+)?$",  # [alpha] or [alpha]$1
        r"_alpha(\$[0-9]+)?$",  # _alpha or _alpha$1
        r"alpha(\$[0-9]+)?$",  # alpha or alpha$1
        r"a(\$[0-9]+)?$",  # a or a$1
    ]
    
    @property
    def name(self) -> str:
        return "Process Alpha Images"

    def combine_alpha_rgb(self, rgb_path: Path, alpha_path: Path, output_path: Optional[Path] = None) -> Image.Image:
        """Combine RGB and alpha channel images into a single RGBA image."""
        rgb = Image.open(rgb_path).convert("RGB")
        alpha = Image.open(alpha_path).convert("L")  # Convert to grayscale

        if rgb.size != alpha.size:
            alpha = alpha.resize(rgb.size, Resampling.NEAREST)

        # Create RGBA image
        rgba = Image.new("RGBA", rgb.size)
        rgba.paste(rgb, (0, 0))
        rgba.putalpha(alpha)

        if output_path:
            rgba.save(output_path)

        return rgba

    def _get_rgb_path_from_alpha(self, alpha_path: Path) -> Optional[Path]:
        """Verifies that the path is actually an alpha path and gets the corresponding RGB path for that path."""
        stem = alpha_path.stem
        for pattern in [re.compile(suffix) for suffix in self.ALPHA_SUFFIXES]:
            match = pattern.search(stem)
            if match:
                # Remove the alpha suffix and any version number
                base_name = stem[:match.start()]
                return alpha_path.parent / f"{base_name}{alpha_path.suffix}"
        return None
    
    def process(self) -> None:
        """Process images with alpha channels."""
        log.info(f"Processing alpha images in {self._output_dir}")

        image_extensions = {'.png', '.jpg', '.jpeg', '.webp'}
        alpha_images: List[Tuple[Path, Path]] = []
        for alpha_path in self._output_dir.rglob("*"):
            if alpha_path.suffix.lower() in image_extensions:
                rgb_path = self._get_rgb_path_from_alpha(alpha_path)
                if rgb_path and rgb_path.exists():
                    alpha_images.append((rgb_path, alpha_path))

        for rgb_path, alpha_path in alpha_images:
            try:
                log.info(f"Processing alpha image: {alpha_path}")

                # Combine the images
                combined_image = self.combine_alpha_rgb(rgb_path, alpha_path)

                # Save the combined image over the RGB image
                combined_image.save(rgb_path)

                # Delete the alpha image
                alpha_path.unlink()
                log.info(f"Successfully processed and deleted: {alpha_path}")

            except Exception as e:
                log.exception(f"Error processing {alpha_path}")

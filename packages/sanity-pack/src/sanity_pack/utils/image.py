from pathlib import Path
from typing import Optional, Tuple

from PIL import Image


def combine_alpha_rgb(
    rgb_path: Path,
    alpha_path: Path,
    output_path: Optional[Path] = None
) -> Image.Image:
    """Combine RGB and alpha channel images into a single RGBA image."""
    rgb = Image.open(rgb_path).convert("RGB")
    alpha = Image.open(alpha_path).convert("L")  # Convert to grayscale

    if rgb.size != alpha.size:
        alpha = alpha.resize(rgb.size, Image.NEAREST)
    
    # Create RGBA image
    rgba = Image.new("RGBA", rgb.size)
    rgba.paste(rgb, (0, 0))
    rgba.putalpha(alpha)
    
    if output_path:
        rgba.save(output_path)
    
    return rgba
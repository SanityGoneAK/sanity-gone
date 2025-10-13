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


def process_portrait(
    atlas_path: Path,
    sprite_data: dict,
    output_path: Optional[Path] = None
) -> Image.Image:
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
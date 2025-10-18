"""Specialized Spine asset processor based on Ark-Unpacker."""

from pathlib import Path
from typing import Dict, Any, Optional, List, Tuple
from dataclasses import dataclass

import UnityPy
from UnityPy.classes import TextAsset, Texture2D, MonoBehaviour, Object

from sanity_pack.config.models import ServerRegion
from sanity_pack.utils.logger import log
from .save import SafeFileSaver


@dataclass
class SpineAsset:
    """Represents a complete Spine asset with all components."""
    name: str
    atlas_content: str
    skeleton_content: str
    textures: Dict[str, Any]  # name -> PIL Image
    asset_type: str
    is_spine: bool = True


class SpineAssetProcessor:
    """Specialized processor for Spine assets based on Ark-Unpacker logic."""

    def __init__(self):
        self._saver = SafeFileSaver()
        self._spine_types = {
            "Building": "building",
            "BattleFront": "battle_front", 
            "BattleBack": "battle_back",
            "DynIllust": "dynamic_illust",
            "DynIllustStart": "dynamic_illust_start",
            "DynPortrait": "dynamic_portrait",
            "DynUnknown": "dynamic_unknown"
        }

    def is_spine_asset(self, obj: Object) -> bool:
        """Check if an object is part of a Spine asset."""
        try:
            # Check for Spine-related components
            if hasattr(obj, 'm_Name'):
                name = obj.m_Name.lower()
                if any(keyword in name for keyword in ['spine', 'skeleton', 'atlas']):
                    return True
            
            # Check object type
            if isinstance(obj, (TextAsset, Texture2D, MonoBehaviour)):
                # Additional checks for Spine-specific patterns
                if hasattr(obj, 'container') and obj.container:
                    container_name = str(obj.container).lower()
                    if any(keyword in container_name for keyword in ['spine', 'skeleton', 'atlas']):
                        return True
            
            return False
            
        except Exception:
            return False

    def _detect_spine_type(self, name: str, content: str = "") -> str:
        """Detect the type of Spine asset based on name and content."""
        name_lower = name.lower()
        content_lower = content.lower()
        
        # Dynamic assets
        if name_lower.startswith("dyn_"):
            if name_lower.startswith("dyn_portrait_"):
                return "DynPortrait"
            elif name_lower.startswith("dyn_illust_"):
                return "DynIllust"
            else:
                return "DynUnknown"
        
        # Battle assets
        elif name_lower.startswith("enemy_"):
            return "BattleFront"
        
        # Building assets
        elif name_lower.startswith("build_"):
            return "Building"
        
        # Content-based detection
        elif content:
            if content_lower.count("\\nf_") + content_lower.count("\\nc_") >= content_lower.count("\\nb_"):
                return "BattleFront"
            else:
                return "BattleBack"
        
        return "Unknown"

    def _extract_atlas_data(self, atlas_obj: TextAsset) -> Optional[str]:
        """Extract atlas data from TextAsset."""
        try:
            data = atlas_obj.read()
            return data.m_Script
        except Exception as e:
            log.exception(f"Failed to extract atlas data: {str(e)}")
            return None

    def _extract_skeleton_data(self, skeleton_obj: TextAsset) -> Optional[str]:
        """Extract skeleton data from TextAsset."""
        try:
            data = skeleton_obj.read()
            content = data.m_Script
            
            # Handle both JSON and binary formats
            if content.startswith("{"):
                return content  # JSON format
            else:
                # Binary format - convert to string
                return content.encode("utf-8", "surrogateescape").decode("utf-8", "surrogateescape")
        except Exception as e:
            log.exception(f"Failed to extract skeleton data: {str(e)}")
            return None

    def _extract_textures(self, texture_objects: List[Texture2D]) -> Dict[str, Any]:
        """Extract texture data from Texture2D objects."""
        textures = {}
        
        for tex_obj in texture_objects:
            try:
                data = tex_obj.read()
                if hasattr(data, 'image') and data.image:
                    textures[tex_obj.m_Name] = data.image
            except Exception as e:
                log.exception(f"Failed to extract texture {tex_obj.m_Name}: {str(e)}")
        
        return textures

    def _find_spine_components(self, env: UnityPy.Environment) -> List[Tuple[str, str, Dict[str, Any]]]:
        """Find and group Spine components in the environment."""
        spine_groups = []
        
        # Find all potential Spine objects
        atlas_objects = []
        skeleton_objects = []
        texture_objects = []
        
        for obj in env.objects:
            if not self.is_spine_asset(obj):
                continue
                
            if isinstance(obj, TextAsset):
                content = getattr(obj.read(), 'm_Script', '')
                if 'atlas' in obj.m_Name.lower() or 'atlas' in content.lower():
                    atlas_objects.append(obj)
                elif 'skeleton' in obj.m_Name.lower() or 'skeleton' in content.lower():
                    skeleton_objects.append(obj)
            
            elif isinstance(obj, Texture2D):
                texture_objects.append(obj)
        
        # Group related components
        for atlas_obj in atlas_objects:
            atlas_name = atlas_obj.m_Name
            atlas_content = self._extract_atlas_data(atlas_obj)
            
            if not atlas_content:
                continue
            
            # Find matching skeleton
            skeleton_content = None
            for skel_obj in skeleton_objects:
                if atlas_name.replace('atlas', 'skeleton') in skel_obj.m_Name:
                    skeleton_content = self._extract_skeleton_data(skel_obj)
                    break
            
            # Find related textures
            related_textures = {}
            for tex_obj in texture_objects:
                if atlas_name.split('_')[0] in tex_obj.m_Name:
                    tex_data = tex_obj.read()
                    if hasattr(tex_data, 'image'):
                        related_textures[tex_obj.m_Name] = tex_data.image
            
            if skeleton_content and related_textures:
                spine_groups.append((atlas_name, atlas_content, skeleton_content, related_textures))
        
        return spine_groups

    def process(self, obj: Object, file_path: Path, region: ServerRegion) -> Optional[SpineAsset]:
        """Process a Spine asset object."""
        try:
            # Load environment to find all related components
            env = UnityPy.load(str(file_path))
            spine_groups = self._find_spine_components(env)
            
            if not spine_groups:
                return None
            
            # Process the first (and usually only) Spine group
            atlas_name, atlas_content, skeleton_content, textures = spine_groups[0]
            
            # Detect asset type
            asset_type = self._detect_spine_type(atlas_name, atlas_content)
            
            # Create Spine asset
            spine_asset = SpineAsset(
                name=atlas_name,
                atlas_content=atlas_content,
                skeleton_content=skeleton_content,
                textures=textures,
                asset_type=asset_type
            )
            
            # Save the asset
            self._save_spine_asset(spine_asset, file_path, region)
            
            log.info(f"Processed Spine asset: {atlas_name} (type: {asset_type})")
            return spine_asset
            
        except Exception as e:
            log.exception(f"Failed to process Spine asset: {str(e)}")
            return None

    def _save_spine_asset(self, spine_asset: SpineAsset, file_path: Path, region: ServerRegion):
        """Save a complete Spine asset."""
        try:
            # Prepare data for saving
            spine_data = {
                "atlas": spine_asset.atlas_content,
                "skeleton": spine_asset.skeleton_content,
                "textures": spine_asset.textures
            }
            
            # Save using the safe saver
            result = self._saver.save_spine_assets(spine_data, file_path, region)
            
            if result.success:
                log.debug(f"Saved Spine asset: {spine_asset.name}")
            else:
                log.error(f"Failed to save Spine asset: {result.error}")
                
        except Exception as e:
            log.exception(f"Error saving Spine asset {spine_asset.name}: {str(e)}")

    def get_spine_statistics(self, spine_assets: List[SpineAsset]) -> Dict[str, Any]:
        """Get statistics about processed Spine assets."""
        stats = {
            "total_assets": len(spine_assets),
            "by_type": {},
            "total_textures": 0,
            "total_size_estimate": 0
        }
        
        for asset in spine_assets:
            # Count by type
            asset_type = asset.asset_type
            stats["by_type"][asset_type] = stats["by_type"].get(asset_type, 0) + 1
            
            # Count textures
            stats["total_textures"] += len(asset.textures)
            
            # Estimate size (rough calculation)
            atlas_size = len(asset.atlas_content.encode('utf-8'))
            skeleton_size = len(asset.skeleton_content.encode('utf-8'))
            texture_size = sum(
                img.width * img.height * 4  # RGBA estimate
                for img in asset.textures.values()
                if hasattr(img, 'width') and hasattr(img, 'height')
            )
            stats["total_size_estimate"] += atlas_size + skeleton_size + texture_size
        
        return stats

"""Cache manager for Sanity Pack."""

import json
from pathlib import Path
from typing import Optional
from sanity_pack.utils.logger import log

from sanity_pack.cache.models import VersionCache, AssetCache, FlatBuffersCache
from sanity_pack.config.models import ServerRegion

class CacheManager:
    """Manages cache loading and saving."""

    VERSION_CACHE_NAME = "versions.json"
    ASSET_CACHE_NAME = "assets.json"
    FLATBUFFERS_CACHE_NAME = "flatbuffers.json"

    def __init__(self, cache_dir: Path):
        """
        Initialize the cache manager.

        Args:
            cache_dir: Directory to store cache files
        """
        self.cache_dir = Path(cache_dir).resolve()
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
        self.version_cache_path = self.cache_dir / self.VERSION_CACHE_NAME
        self.asset_cache_path = self.cache_dir / self.ASSET_CACHE_NAME
        self.flatbuffers_cache_path = self.cache_dir / self.FLATBUFFERS_CACHE_NAME
        
        self._version_cache: Optional[VersionCache] = None
        self._asset_cache: Optional[AssetCache] = None
        self._flatbuffers_cache: Optional[FlatBuffersCache] = None

    # ========== Version Cache Methods ==========

    def load_versions(self) -> VersionCache:
        """
        Load version cache from file.

        Returns:
            VersionCache object
        """
        if not self.version_cache_path.exists():
            log.warning(
                f"[yellow]Version cache not found, creating new one[/yellow]"
            )
            self._version_cache = VersionCache()
            return self._version_cache

        try:
            with open(self.version_cache_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            # Convert old format to new format if needed
            if data and not any(key in data for key in ["versions"]):
                # Old format: {"CN": {"resource": "...", "client": "..."}}
                # New format: {"versions": {"CN": {"resource": "...", "client": "..."}}}
                data = {"versions": data}
            
            self._version_cache = VersionCache.model_validate(data)
            return self._version_cache
        except json.JSONDecodeError as e:
            log.exception(f"[red]Invalid JSON in version cache: {e}[/red]")
            self._version_cache = VersionCache()
            return self._version_cache
        except Exception as e:
            log.exception(f"[red]Failed to load version cache[/red]")
            self._version_cache = VersionCache()
            return self._version_cache

    def save_versions(self, cache: Optional[VersionCache] = None) -> None:
        """
        Save version cache to file.

        Args:
            cache: VersionCache to save. If None, saves the current cache.
        """
        if cache is None:
            cache = self.get_versions()
        
        with open(self.version_cache_path, "w", encoding="utf-8") as f:
            # Save in the old format for compatibility
            # {"CN": {"resource": "...", "client": "..."}}
            data = {
                region.value: version.model_dump()
                for region, version in cache.versions.items()
            }
            json.dump(data, f, indent=2, ensure_ascii=False)

    def get_versions(self) -> VersionCache:
        """
        Get version cache, loading if necessary.

        Returns:
            VersionCache object
        """
        if self._version_cache is None:
            self._version_cache = self.load_versions()
        return self._version_cache

    # ========== Asset Cache Methods ==========

    def load_assets(self) -> AssetCache:
        """
        Load asset cache from file.

        Returns:
            AssetCache object
        """
        if not self.asset_cache_path.exists():
            log.warning(
                f"[yellow]Asset cache not found, creating new one[/yellow]"
            )
            self._asset_cache = AssetCache()
            return self._asset_cache

        try:
            with open(self.asset_cache_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            # Handle both old and new formats
            if "assets" in data:
                # Old format: {"assets": {"path": "hash"}}
                # Convert to new format: {"CN": {"path": "hash"}}
                old_assets = data["assets"]
                # We can't determine region from old format, so put everything under CN
                # This is a migration fallback
                converted_data = {"assets": {ServerRegion.CN: old_assets}}
                self._asset_cache = AssetCache.model_validate(converted_data)
            else:
                # New format: {"CN": {"path": "hash"}, "EN": {"path": "hash"}}
                # Convert string keys to ServerRegion enums
                converted_data = {
                    "assets": {
                        ServerRegion(region): assets 
                        for region, assets in data.items()
                    }
                }
                self._asset_cache = AssetCache.model_validate(converted_data)
            return self._asset_cache
        except json.JSONDecodeError as e:
            log.exception(f"[red]Invalid JSON in asset cache[/red]")
            self._asset_cache = AssetCache()
            return self._asset_cache
        except Exception as e:
            log.exception(f"[red]Failed to load asset cache[/red]")
            self._asset_cache = AssetCache()
            return self._asset_cache

    def save_assets(self, cache: Optional[AssetCache] = None) -> None:
        """
        Save asset cache to file.

        Args:
            cache: AssetCache to save. If None, saves the current cache.
        """
        if cache is None:
            cache = self.get_assets()
        
        with open(self.asset_cache_path, "w", encoding="utf-8") as f:
            # Save in the new per-server format: {"CN": {"path": "hash"}, "EN": {"path": "hash"}}
            data = {
                region.value: assets
                for region, assets in cache.assets.items()
            }
            json.dump(data, f, indent=2, ensure_ascii=False)

    def get_assets(self) -> AssetCache:
        """
        Get asset cache, loading if necessary.

        Returns:
            AssetCache object
        """
        if self._asset_cache is None:
            self._asset_cache = self.load_assets()
        return self._asset_cache

    # ========== FlatBuffers Cache Methods ==========

    def load_flatbuffers(self) -> FlatBuffersCache:
        """
        Load FlatBuffers cache from file.

        Returns:
            FlatBuffersCache object
        """
        if not self.flatbuffers_cache_path.exists():
            log.warning(
                f"[yellow]FlatBuffers cache not found, creating new one[/yellow]"
            )
            self._flatbuffers_cache = FlatBuffersCache()
            return self._flatbuffers_cache

        try:
            with open(self.flatbuffers_cache_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            # Convert string keys to ServerRegion enums
            converted_data = {
                "schemas": {
                    ServerRegion(region): schemas 
                    for region, schemas in data.items()
                }
            }
            self._flatbuffers_cache = FlatBuffersCache.model_validate(converted_data)
            return self._flatbuffers_cache
        except json.JSONDecodeError as e:
            log.exception(f"[red]Invalid JSON in FlatBuffers cache: {e}[/red]")
            self._flatbuffers_cache = FlatBuffersCache()
            return self._flatbuffers_cache
        except Exception as e:
            log.exception(f"[red]Failed to load FlatBuffers cache[/red]")
            self._flatbuffers_cache = FlatBuffersCache()
            return self._flatbuffers_cache

    def save_flatbuffers(self, cache: Optional[FlatBuffersCache] = None) -> None:
        """
        Save FlatBuffers cache to file.

        Args:
            cache: FlatBuffersCache to save. If None, saves the current cache.
        """
        if cache is None:
            cache = self.get_flatbuffers()
        
        with open(self.flatbuffers_cache_path, "w", encoding="utf-8") as f:
            # Save in per-server format: {"CN": {"schema": "commit"}, "EN": {"schema": "commit"}}
            data = {
                region.value: schemas
                for region, schemas in cache.schemas.items()
            }
            json.dump(data, f, indent=2, ensure_ascii=False)

    def get_flatbuffers(self) -> FlatBuffersCache:
        """
        Get FlatBuffers cache, loading if necessary.

        Returns:
            FlatBuffersCache object
        """
        if self._flatbuffers_cache is None:
            self._flatbuffers_cache = self.load_flatbuffers()
        return self._flatbuffers_cache

    # ========== Combined Operations ==========

    def reload_all(self) -> tuple[VersionCache, AssetCache, FlatBuffersCache]:
        """
        Reload all caches.

        Returns:
            Tuple of (VersionCache, AssetCache, FlatBuffersCache)
        """
        self._version_cache = None
        self._asset_cache = None
        self._flatbuffers_cache = None
        return self.get_versions(), self.get_assets(), self.get_flatbuffers()

    def get_stats(self) -> dict:
        """
        Get cache statistics.

        Returns:
            Dict with cache stats
        """
        versions = self.get_versions()
        assets = self.get_assets()
        flatbuffers = self.get_flatbuffers()
        
        return {
            "version_cache_exists": self.version_cache_path.exists(),
            "asset_cache_exists": self.asset_cache_path.exists(),
            "flatbuffers_cache_exists": self.flatbuffers_cache_path.exists(),
            "tracked_servers": len(versions.versions),
            "cached_assets": assets.get_assets_count(),
            "cached_schemas": flatbuffers.get_schemas_count(),
            "assets_per_region": {
                region.value: assets.get_assets_count(region)
                for region in ServerRegion
            },
            "schemas_per_region": {
                region.value: flatbuffers.get_schemas_count(region)
                for region in ServerRegion
            }
        }


# Global cache manager instance
_cache_manager: Optional[CacheManager] = None


def get_cache_manager(cache_dir: Optional[Path] = None) -> CacheManager:
    """
    Get the global cache manager instance.

    Args:
        cache_dir: Cache directory (only used on first call)

    Returns:
        CacheManager instance
    """
    global _cache_manager
    if _cache_manager is None:
        if cache_dir is None:
            from sanity_pack.config import get_config
            cache_dir = get_config().cache_dir
        _cache_manager = CacheManager(cache_dir)
    return _cache_manager


def get_version_cache(cache_dir: Optional[Path] = None) -> VersionCache:
    """
    Convenience function to get version cache.

    Args:
        cache_dir: Cache directory (only used on first call)

    Returns:
        VersionCache object
    """
    return get_cache_manager(cache_dir).get_versions()


def get_asset_cache(cache_dir: Optional[Path] = None) -> AssetCache:
    """
    Convenience function to get asset cache.

    Args:
        cache_dir: Cache directory (only used on first call)

    Returns:
        AssetCache object
    """
    return get_cache_manager(cache_dir).get_assets()


def get_flatbuffers_cache(cache_dir: Optional[Path] = None) -> FlatBuffersCache:
    """
    Convenience function to get FlatBuffers cache.

    Args:
        cache_dir: Cache directory (only used on first call)

    Returns:
        FlatBuffersCache object
    """
    return get_cache_manager(cache_dir).get_flatbuffers()
"""Cache models for Sanity Pack."""

from typing import Dict
from pydantic import BaseModel, Field
from sanity_pack.config.models import ServerRegion


class ServerVersion(BaseModel):
    """Version information for a specific server."""
    resource: str = Field(..., description="Resource version string")
    client: str = Field(..., description="Client version string")


class VersionCache(BaseModel):
    """Cache for server versions."""
    versions: Dict[ServerRegion, ServerVersion] = Field(
        default_factory=dict,
        description="Version info per server region"
    )

    def get_version(self, region: ServerRegion) -> ServerVersion | None:
        """Get version for a specific region."""
        return self.versions.get(region)

    def set_version(
        self, 
        region: ServerRegion, 
        resource: str, 
        client: str
    ) -> None:
        """Set version for a specific region."""
        self.versions[region] = ServerVersion(
            resource=resource,
            client=client
        )

    def has_version(self, region: ServerRegion) -> bool:
        """Check if version exists for a region."""
        return region in self.versions

    def is_version_changed(
        self,
        region: ServerRegion,
        resource: str,
        client: str
    ) -> bool:
        """
        Check if version has changed for a region.
        
        Returns:
            True if version changed or doesn't exist, False otherwise
        """
        if not self.has_version(region):
            return True
        
        current = self.versions[region]
        return current.resource != resource or current.client != client


class AssetCache(BaseModel):
    """Cache for asset hashes."""
    assets: Dict[str, str] = Field(
        default_factory=dict,
        description="Asset path to hash mapping"
    )

    def get_hash(self, path: str) -> str | None:
        """Get hash for a specific asset path."""
        return self.assets.get(path)

    def set_hash(self, path: str, hash_value: str) -> None:
        """Set hash for a specific asset path."""
        self.assets[path] = hash_value

    def has_asset(self, path: str) -> bool:
        """Check if asset exists in cache."""
        return path in self.assets

    def is_hash_changed(self, path: str, hash_value: str) -> bool:
        """
        Check if hash has changed for an asset.
        
        Returns:
            True if hash changed or doesn't exist, False otherwise
        """
        if not self.has_asset(path):
            return True
        return self.assets[path] != hash_value

    def remove_asset(self, path: str) -> None:
        """Remove asset from cache."""
        self.assets.pop(path, None)

    def clear(self) -> None:
        """Clear all assets from cache."""
        self.assets.clear()

    def get_assets_count(self) -> int:
        """Get total number of cached assets."""
        return len(self.assets)

    def filter_changed_assets(
        self,
        new_assets: Dict[str, str]
    ) -> Dict[str, str]:
        """
        Filter assets to only those that changed or are new.
        
        Args:
            new_assets: Dict of path -> hash for new assets
            
        Returns:
            Dict of only changed or new assets
        """
        changed = {}
        for path, hash_value in new_assets.items():
            if self.is_hash_changed(path, hash_value):
                changed[path] = hash_value
        return changed
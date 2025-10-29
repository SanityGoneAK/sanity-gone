"""Cache models for Sanity Pack."""

from typing import Dict
from pydantic import BaseModel, Field
from sanity_pack.config.models import ServerRegion


class ServerVersion(BaseModel):
    """Version information for a specific server."""
    resource: str = Field(..., description="Resource version string")
    client: str = Field(..., description="Client version string")
    folders: Dict[str, int] = Field(
        default_factory=dict,
        description="Aggregated folder sizes (bytes) for this version"
    )


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
    """Cache for asset hashes per server region."""
    assets: Dict[ServerRegion, Dict[str, str]] = Field(
        default_factory=dict,
        description="Per-region asset path to hash mapping"
    )

    def get_hash(self, region: ServerRegion, path: str) -> str | None:
        """Get hash for a specific asset path in a region."""
        return self.assets.get(region, {}).get(path)

    def set_hash(self, region: ServerRegion, path: str, hash_value: str) -> None:
        """Set hash for a specific asset path in a region."""
        self.assets[region][path] = hash_value

    def has_asset(self, region: ServerRegion, path: str) -> bool:
        """Check if asset exists in cache for a region."""
        return path in self.assets.get(region, {})

    def is_hash_changed(self, region: ServerRegion, path: str, hash_value: str) -> bool:
        """
        Check if hash has changed for an asset in a region.
        
        Returns:
            True if hash changed or doesn't exist, False otherwise
        """
        if not self.has_asset(region, path):
            return True
        return self.assets[region][path] != hash_value

    def remove_asset(self, region: ServerRegion, path: str) -> None:
        """Remove asset from cache for a region."""
        if region in self.assets:
            self.assets[region].pop(path, None)

    def clear(self, region: ServerRegion | None = None) -> None:
        """Clear assets from cache. If region is None, clears all."""
        if region is None:
            self.assets.clear()
        elif region in self.assets:
            self.assets[region].clear()

    def get_assets_count(self, region: ServerRegion | None = None) -> int:
        """Get total number of cached assets. If region is None, returns total across all regions."""
        if region is None:
            return sum(len(assets) for assets in self.assets.values())
        return len(self.assets.get(region, {}))

    def filter_changed_assets(
        self,
        region: ServerRegion,
        new_assets: Dict[str, str]
    ) -> Dict[str, str]:
        """
        Filter assets to only those that changed or are new for a region.
        
        Args:
            region: Server region to check
            new_assets: Dict of path -> hash for new assets
            
        Returns:
            Dict of only changed or new assets
        """
        changed = {}
        for path, hash_value in new_assets.items():
            if self.is_hash_changed(region, path, hash_value):
                changed[path] = hash_value
        return changed


class FlatBuffersCache(BaseModel):
    """Cache for FlatBuffers schema commit mappings per server region."""
    schemas: Dict[ServerRegion, Dict[str, str]] = Field(
        default_factory=dict,
        description="Per-region schema name to commit hash mapping"
    )

    def get_commit(self, region: ServerRegion, schema: str) -> str | None:
        """Get commit hash for a specific schema in a region."""
        return self.schemas.get(region, {}).get(schema)

    def set_commit(self, region: ServerRegion, schema: str, commit: str) -> None:
        """Set commit hash for a specific schema in a region."""
        if region not in self.schemas:
            self.schemas[region] = {}
        self.schemas[region][schema] = commit

    def has_schema(self, region: ServerRegion, schema: str) -> bool:
        """Check if schema exists in cache for a region."""
        return schema in self.schemas.get(region, {})

    def is_commit_changed(self, region: ServerRegion, schema: str, commit: str) -> bool:
        """
        Check if commit has changed for a schema in a region.
        
        Returns:
            True if commit changed or doesn't exist, False otherwise
        """
        if not self.has_schema(region, schema):
            return True
        return self.schemas[region][schema] != commit

    def remove_schema(self, region: ServerRegion, schema: str) -> None:
        """Remove schema from cache for a region."""
        if region in self.schemas:
            self.schemas[region].pop(schema, None)

    def clear(self, region: ServerRegion | None = None) -> None:
        """Clear schemas from cache. If region is None, clears all."""
        if region is None:
            self.schemas.clear()
        elif region in self.schemas:
            self.schemas[region].clear()

    def get_schemas_count(self, region: ServerRegion | None = None) -> int:
        """Get total number of cached schemas. If region is None, returns total across all regions."""
        if region is None:
            return sum(len(schemas) for schemas in self.schemas.values())
        return len(self.schemas.get(region, {}))

    def get_all_schemas(self, region: ServerRegion) -> Dict[str, str]:
        """Get all schemas for a specific region."""
        return self.schemas.get(region, {}).copy()
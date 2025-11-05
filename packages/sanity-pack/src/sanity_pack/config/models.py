"""Configuration models for Sanity Pack."""

from pathlib import Path
from typing import Dict, List
from pydantic import BaseModel, Field, field_validator
from enum import Enum
from typing import Optional

class ServerRegion(str, Enum):
    """Available server regions."""
    CN = "CN"
    TW = "TW"
    EN = "EN"
    JP = "JP"
    KR = "KR"

class UnpackMode(str, Enum):
    """Available unpack modes. Unity Py is a lower level implementation than arknights studio,
     but we have more control over it, some paths to containers are not specified in UnityPy vs Arknights Studio specifically prefabs"""
    ARKNIGHTS_STUDIO = "arknights_studio"
    UNITY_PY = "unity_py"


class ArknightsStudioConfig(BaseModel):
    """Configuration for Arknights Studio CLI tool."""
    cli_dll_path: Path = Field(
        default=Path("./ArknightsStudioCLI/ArknightsStudioCLI.dll"),
        description="Path to ArknightsStudioCLI.dll"
    )
    
    @field_validator("cli_dll_path")
    @classmethod
    def validate_cli_path(cls, v: Path) -> Path:
        """Resolve and validate CLI DLL path."""
        resolved = v.expanduser().resolve()
        # Note: We don't check existence here as the file might not exist yet during config creation
        return resolved


class ServerConfig(BaseModel):
    """Configuration for a specific server region."""
    enabled: bool = Field(default=True, description="Whether to fetch data from this server")
    path_whitelist: Optional[List[str]] = Field(
        default=None,
        description="List of paths to extract. If None, all paths will be extracted",
    )

    @field_validator("path_whitelist")
    @classmethod
    def normalize_paths(cls, v: List[str]) -> List[str]:
        """Normalize path separators to forward slashes."""
        return [path.replace("\\", "/") for path in v]


class Config(BaseModel):
    """Main configuration for Sanity Pack."""
    output_dir: Path = Field(default=Path("./assets"), description="Directory for extracted data")
    cache_dir: Path = Field(default=Path("./cache"), description="Directory for cache files")
    fbs_dir: Path = Field(default=Path("./fbs"), description="Directory for flatbuffer schemas")
    flatc_path: str = Field(default="flatc", description="Path to flatc executable (can be a command name or full path)")
    unpack_mode: UnpackMode = Field(default=UnpackMode.ARKNIGHTS_STUDIO, description="Method of unpacking assets")
    arknights_studio: Optional[ArknightsStudioConfig] = Field(
        default=None,
        description="Configuration for Arknights Studio CLI (required when unpack_mode is ARKNIGHTS_STUDIO)"
    )
    servers: Dict[ServerRegion, ServerConfig] = Field(
        default_factory=lambda: {
            server: ServerConfig() for server in ServerRegion
        }, 
        description="Configuration for each server region")

    @field_validator("output_dir", "cache_dir")
    @classmethod
    def resolve_path(cls, v: Path) -> Path:
        """Resolve path to absolute."""
        return v.expanduser().resolve()

    def get_enabled_servers(self) -> List[ServerRegion]:
        """Get list of enabled server regions."""
        return [
            region for region, config in self.servers.items()
            if config.enabled
        ]

    def is_path_whitelisted(self, region: ServerRegion, path: str) -> bool:
        """Check if a path is whitelisted for a specific region."""
        if region not in self.servers:
            return False
        
        server_config = self.servers[region]
        path_normalized = path.replace("\\", "/")
        
        return any(
            path_normalized.startswith(whitelist_path)
            for whitelist_path in server_config.path_whitelist
        )

    model_config = {
        "json_schema_extra": {
            "example": {
                "output_dir": "./assets",
                "cache_dir": "./cache",
                "flatc_path": "flatc",
                "unpack_mode": "arknights_studio",
                "arknights_studio": {
                    "cli_dll_path": "./ArknightsStudioCLI/ArknightsStudioCLI.dll"
                },
                "servers": {
                    "CN": {
                        "enabled": True,
                        "path_whitelist": ["anon", "arts/charportraits"]
                    }
                }
            }
        }
    }
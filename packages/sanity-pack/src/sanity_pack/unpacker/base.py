"""Base interface for asset unpacker managers."""

from abc import ABC, abstractmethod
from sanity_pack.config.models import Config, ServerRegion


class AssetUnpacker(ABC):
    """Abstract base class for asset unpacker managers.
    
    Defines the interface that all unpacker implementations must follow.
    """
    
    def __init__(self, config: Config, region: ServerRegion, concurrency: int = 128):
        """Initialize the asset unpacker.
        
        Args:
            config: Configuration object containing paths and settings
            region: Server region to unpack assets for
            concurrency: Maximum number of concurrent operations (default: 128)
        """
        self.config = config
        self._region = region
        self._concurrency = concurrency
    
    @abstractmethod
    def unpack(self) -> None:
        """Unpack all assets for the configured region.
        
        This method should:
        1. Find all asset files in the region's directory
        2. Process each asset file to extract objects
        3. Save extracted objects to the output directory
        4. Clean up temporary files
        """
        pass

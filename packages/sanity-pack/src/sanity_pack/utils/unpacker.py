from sanity_pack.config import ServerRegion, UnpackMode
from sanity_pack.unpacker import AssetUnpacker
from sanity_pack.unpacker.arknights_studio.manager import ArknightsStudioExtractor
from sanity_pack.unpacker.unity_py.manager import UnityAssetExtractor


def get_unpacker(config, region: ServerRegion, concurrency: int) -> AssetUnpacker:
    """Factory function to get the appropriate unpacker based on config.

    Args:
        config: Configuration object
        region: Server region
        concurrency: Max concurrent operations

    Returns:
        AssetUnpacker instance (either UnityAssetExtractor or ArknightsStudioExtractor)
    """
    if config.unpack_mode == UnpackMode.UNITY_PY:
        return UnityAssetExtractor(config=config, region=region, concurrency=concurrency)
    elif config.unpack_mode == UnpackMode.ARKNIGHTS_STUDIO:
        return ArknightsStudioExtractor(config=config, region=region, concurrency=concurrency)
    else:
        raise ValueError(f"Unknown unpack mode: {config.unpack_mode}")


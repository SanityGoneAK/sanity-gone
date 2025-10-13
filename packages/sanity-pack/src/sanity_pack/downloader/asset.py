from __future__ import annotations

import asyncio
from io import BytesIO
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from zipfile import ZipFile

from tenacity import retry, stop_after_attempt, wait_exponential

from sanity_pack.config.models import Config, ServerRegion
from sanity_pack.cache.manager import get_cache_manager
from sanity_pack.utils.logger import log
from .client import ArknightsSession, VERSION_URLS, ASSET_BASE_URLS


class ArknightsAssets:
    """High-level orchestrator for downloading and tracking Arknights assets per region."""

    def __init__(self, config: Config, region: ServerRegion, concurrency: int = 128):
        self._config = config
        self._region = region
        self._concurrency = max(1, concurrency)
        self._semaphore = asyncio.Semaphore(self._concurrency)
        self._cache_mgr = get_cache_manager(config.cache_dir)

    def _is_path_whitelisted(self, path: str) -> bool:
        """Check if a path matches the region's whitelist (if present)."""
        server_cfg = self._config.servers.get(self._region)
        if not server_cfg or not server_cfg.path_whitelist:
            return True
        normalized = path.replace("\\", "/")
        return any(
            normalized.startswith(prefix) or prefix.startswith(normalized)
            for prefix in server_cfg.path_whitelist
        )

    async def _fetch_version(self, session: ArknightsSession) -> Tuple[str, str]:
        """Return (resource, client) version tuple for the region."""
        data = await session._fetch_json(VERSION_URLS[self._region])
        resource = data["resVersion"]
        client = data["clientVersion"]
        return resource, client

    async def _fetch_asset_list(self, session: ArknightsSession, resource: str) -> List[Dict]:
        url = f"{ASSET_BASE_URLS[self._region]}/assets/{resource}/hot_update_list.json"
        log.debug(f"Hot Update List acquired: {url}")
        data = await session._fetch_json(url)
        return data.get("abInfos", [])

    def _transform_asset_path(self, path: str) -> str:
        return (
            path.replace(".ab", "").replace(".bin", "").replace(".mp4", "")
            .replace("/", "_")
            .replace("#", "__")
            + ".dat"
        )

    async def _download_one(self, session: ArknightsSession, resource: str, asset_path: str, asset_hash: str, base_out_dir: Path) -> Optional[int]:
        """Download one asset, extract, update cache. Returns bytes written or None if skipped/failed."""
        async with self._semaphore:
            if not self._is_path_whitelisted(asset_path):
                return None

            asset_cache = self._cache_mgr.get_assets()
            if not asset_cache.is_hash_changed(self._region, asset_path, asset_hash):
                return None

            transformed = self._transform_asset_path(asset_path)
            url = f"{ASSET_BASE_URLS[self._region]}/assets/{resource}/{transformed}"

            # Use internal session for HTTP
            if not session._session:
                raise RuntimeError("ArknightsSession must be used as an async context manager")

            try:
                async with session._session.get(url) as resp:
                    resp.raise_for_status()
                    blob = await resp.read()
            except Exception:
                log.exception(f"Failed to download {asset_path} from {self._region.value}")
                return None

            # Extract zip payload to correct path
            bytes_written: int = 0
            try:
                with ZipFile(BytesIO(blob)) as zf:
                    # Force the zip entry name to original asset path for extraction layout
                    for info in zf.infolist():
                        info.filename = asset_path
                        # Ensure parent folder exists
                        dest_path = base_out_dir / info.filename
                        dest_path.parent.mkdir(parents=True, exist_ok=True)
                        with zf.open(info) as src, open(dest_path, "wb") as dst:
                            data = src.read()
                            dst.write(data)
                            bytes_written += len(data)
            except Exception:
                log.exception(f"Failed to extract {asset_path}")
                return None

            # Update asset cache
            asset_cache.set_hash(self._region, asset_path, asset_hash)
            return bytes_written

    async def download(self, show_progress: bool = True) -> Dict[str, int]:
        """
        Download all assets for the region.
        Returns folder->size(bytes) mapping for this run to be merged into version cache.
        """
        server_dir = self._config.output_dir / self._region.value.lower()
        server_dir.mkdir(parents=True, exist_ok=True)

        async with ArknightsSession(self._config) as session:
            resource, client = await self._fetch_version(session)

            versions = self._cache_mgr.get_versions()
            # Ensure entry exists
            versions.set_version(self._region, resource=resource, client=client)
            self._cache_mgr.save_versions(versions)

            assets = await self._fetch_asset_list(session, resource)

            # Prepare tasks
            tasks: List[asyncio.Task] = []
            for entry in assets:
                if not isinstance(entry, dict):
                    continue
                name = entry.get("name")
                hash_value = entry.get("hash") or entry.get("md5")
                if not name or not hash_value:
                    continue
                tasks.append(
                    asyncio.create_task(
                        self._download_one(session, resource, name, hash_value, server_dir)
                    )
                )

            # Rich progress (optional external control)
            if show_progress:
                from rich.progress import Progress, TimeRemainingColumn, BarColumn, SpinnerColumn, TaskProgressColumn

                with Progress(
                    SpinnerColumn(),
                    f"Downloading ({self._region.value})",
                    BarColumn(),
                    TaskProgressColumn(),
                    TimeRemainingColumn(),
                    transient=False,
                ) as progress:
                    task_id = progress.add_task(f"{self._region.value}", total=len(tasks))

                    for coro in asyncio.as_completed(tasks):
                        _ = await coro
                        progress.advance(task_id, 1)

            # If no progress UI, still await all
            if not show_progress:
                await asyncio.gather(*tasks)

            # Persist asset cache at end
            self._cache_mgr.save_assets()



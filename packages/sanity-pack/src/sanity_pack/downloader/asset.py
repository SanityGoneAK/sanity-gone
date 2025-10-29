from __future__ import annotations

import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from io import BytesIO
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
from zipfile import ZipFile

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
        self._semaphore = threading.Semaphore(self._concurrency)
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

    def _fetch_version(self, session: ArknightsSession) -> Tuple[str, str]:
        """Return (resource, client) version tuple for the region."""
        data = session.fetch_json(VERSION_URLS[self._region])
        resource = data["resVersion"]
        client = data["clientVersion"]
        return resource, client

    def _fetch_asset_list(self, session: ArknightsSession, resource: str) -> List[Dict]:
        url = f"{ASSET_BASE_URLS[self._region]}/assets/{resource}/hot_update_list.json"
        log.info(f"Hot Update List acquired: {url}")
        data = session.fetch_json(url)
        return data.get("abInfos", [])

    def _transform_asset_path(self, path: str) -> str:
        return (
            path.replace(".ab", "").replace(".bin", "").replace(".mp4", "")
            .replace("/", "_")
            .replace("#", "__")
            + ".dat"
        )

    def _download_one(self, session: ArknightsSession, resource: str, asset_path: str, asset_hash: str, base_out_dir: Path) -> Optional[int]:
        """Download one asset, extract, update cache. Returns bytes written or None if skipped/failed."""
        with self._semaphore:
            if not self._is_path_whitelisted(asset_path):
                return None

            asset_cache = self._cache_mgr.get_assets()
            if not asset_cache.is_hash_changed(self._region, asset_path, asset_hash):
                return None

            transformed = self._transform_asset_path(asset_path)
            url = f"{ASSET_BASE_URLS[self._region]}/assets/{resource}/{transformed}"

            # Use internal session for HTTP
            if not session._session:
                raise RuntimeError("ArknightsSession must be used as a context manager")

            log.info(f"Downloading asset: {url}")

            try:
                resp = session._session.get(url, timeout=60)
                resp.raise_for_status()
                blob = resp.content
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

    def download(self) -> None:
        """
        Download all assets for the region.
        """
        server_dir = self._config.output_dir / self._region.value.lower()
        server_dir.mkdir(parents=True, exist_ok=True)
        log.info(f"Downloading assets for region {self._region.value}")

        with ArknightsSession(self._config) as session:
            resource, client = self._fetch_version(session)

            versions = self._cache_mgr.get_versions()
            # Ensure entry exists
            versions.set_version(self._region, resource=resource, client=client)
            self._cache_mgr.save_versions(versions)

            assets = self._fetch_asset_list(session, resource)

            # Prepare download tasks
            download_tasks = []
            for entry in assets:
                if not isinstance(entry, dict):
                    continue
                name = entry.get("name")
                hash_value = entry.get("hash") or entry.get("md5")
                if not name or not hash_value:
                    continue
                download_tasks.append((session, resource, name, hash_value, server_dir))

            # Execute downloads in thread pool
            with ThreadPoolExecutor(max_workers=self._concurrency) as executor:
                futures = [
                    executor.submit(self._download_one, *task)
                    for task in download_tasks
                ]
                
                # Wait for all downloads to complete
                for future in as_completed(futures):
                    try:
                        future.result()
                    except Exception as e:
                        log.exception(f"Download task failed: {e}")

            # Persist asset cache at end
            self._cache_mgr.save_assets()



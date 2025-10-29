from __future__ import annotations

import threading
from typing import Dict, Any, Optional
import requests
from tenacity import retry, stop_after_attempt, wait_exponential

from sanity_pack.config import Config, ServerRegion
from sanity_pack.cache import get_cache_manager
from sanity_pack.utils.logger import log

VERSION_URLS: dict[ServerRegion, str] = {
    ServerRegion.CN: "https://ak-conf.hypergryph.com/config/prod/official/Android/version",
    ServerRegion.TW: "https://ak-conf-tw.gryphline.com/config/prod/official/Android/version",
    ServerRegion.EN: "https://ark-us-static-online.yo-star.com/assetbundle/official/Android/version",
    ServerRegion.JP: "https://ark-jp-static-online.yo-star.com/assetbundle/official/Android/version",
    ServerRegion.KR: "https://ark-kr-static-online-1300509597.yo-star.com/assetbundle/official/Android/version",
}

ASSET_BASE_URLS: dict[ServerRegion, str] = {
    ServerRegion.CN: "https://ak.hycdn.cn/assetbundle/official/Android",
    ServerRegion.TW: "https://ak-tw.hg-cdn.com/assetbundle/official/Android",
    ServerRegion.EN: "https://ark-us-static-online.yo-star.com/assetbundle/official/Android",
    ServerRegion.JP: "https://ark-jp-static-online.yo-star.com/assetbundle/official/Android",
    ServerRegion.KR: "https://ark-kr-static-online-1300509597.yo-star.com/assetbundle/official/Android",
}

USER_AGENT: str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"

class ArknightsSession:
    _session: requests.Session | None = None

    def __init__(self, config: Config, session: requests.Session | None = None):
        self.session = session
        self._config = config
        self._cache = get_cache_manager(config.cache_dir)
        self._semaphore = threading.Semaphore(200) 
    
    def __enter__(self):
        """Set up context."""
        self._session = requests.Session()
        self._session.headers.update({
            "User-Agent": USER_AGENT
        })
        # Configure connection pooling and timeout
        adapter = requests.adapters.HTTPAdapter(
            pool_connections=100,
            pool_maxsize=200,
            max_retries=0
        )
        self._session.mount('http://', adapter)
        self._session.mount('https://', adapter)
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Clean up context."""
        if self._session:
            self._session.close()
            self._session = None
            
    @retry(stop=stop_after_attempt(5), wait=wait_exponential(multiplier=1, min=4, max=20))
    def fetch_json(self, url: str) -> Dict:
        """Fetch and parse JSON from a URL with retry logic."""
        
        if not self._session:
            raise RuntimeError("Session must be run as a context manager")
        
        try:
            response = self._session.get(url, timeout=60)
            response.raise_for_status()
            text = response.text
            
            try:
                return response.json()
            except Exception as e:
                log.exception(f"Failed to parse JSON directly")
                import json
                return json.loads(text)
                
        except requests.RequestException as e:
            log.exception(f"HTTP error for {url}")
            raise
        except Exception as e:
            log.exception(f"Unexpected error for {url}")
            raise
        
        

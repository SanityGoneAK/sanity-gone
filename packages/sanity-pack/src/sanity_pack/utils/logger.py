import logging
from logging import Formatter
from datetime import datetime
from rich.console import Console
from rich.logging import RichHandler
from pathlib import Path

from logging.handlers import  RotatingFileHandler
LOGFORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
LOGFORMAT_RICH = '%(message)s'

error_console = Console(stderr=True)

rh = RichHandler(console=error_console, markup=True)

rh.setFormatter(Formatter(LOGFORMAT_RICH))

log_dir = Path(".logs")
log_dir.mkdir(exist_ok=True)
timestamp = datetime.now().strftime("%Y%m%d")
log_file = log_dir / f"{timestamp}.log"

logging.basicConfig(
    level=logging.INFO,
    format=LOGFORMAT,
    handlers=[
        rh,
        RotatingFileHandler(log_file,
                            maxBytes=1024 * 1024 * 20,  # 10Mb
                            backupCount=10)
    ]
    )
log = logging.getLogger('sanity_pack')
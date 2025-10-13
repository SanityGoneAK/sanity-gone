import typer
from rich.console import Console
from rich.table import Table
from typing import Optional
from pathlib import Path
from sanity_pack.config import (
    get_config,
    get_config_manager,
    ServerRegion,
)
from sanity_pack.config import app as config_command
from sanity_pack.cache import app as cache_command
from sanity_pack.utils.logger import log
from sanity_pack.downloader.asset import ArknightsAssets
import asyncio

app = typer.Typer(help="Sanity Pack CLI")
app.add_typer(config_command, name="config")
app.add_typer(cache_command, name="cache")
console = Console()


@app.command()
def download(
    region: Optional[ServerRegion] = typer.Option(
        None,
        "--region", "-r",
        help="Server region to download from (if not specified, downloads all enabled)"
    ),
    config_file: Optional[Path] = typer.Option(
        None,
        "--config", "-c",
        help="Path to config file"
    ),
    concurrency: int = typer.Option(
        64,
        "--concurrency",
        help="Max concurrent downloads",
    ),
    no_progress: bool = typer.Option(
        False,
        "--no-progress",
        help="Disable progress bars",
    ),
):
    """Download latest game data via hot update"""
    config = get_config(config_file)

    regions = [region] if region else config.get_enabled_servers()

    log.info(f"[bold green]Downloading from regions: {', '.join(r.value for r in regions)}[/bold green]")
    log.info(f"Output directory: {config.output_dir}")

    async def _run():
        tasks = [
            ArknightsAssets(config=config, region=r, concurrency=concurrency).download(show_progress=not no_progress)
            for r in regions
        ]
        results = await asyncio.gather(*tasks)
        return dict(zip([r.value for r in regions], results))

    asyncio.run(_run())
    
    log.info(f"[green]✓ Completed Asset Download[/green]")

@app.command()
def unpack():
    """Unpack Unity assets"""
    typer.echo("Unpacking assets...")

@app.command()
def process():
    """Process images and audio for web use"""
    typer.echo("Processing assets...")

def main():
    app()

if __name__ == "__main__":
    app()
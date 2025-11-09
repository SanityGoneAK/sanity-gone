import typer
from rich.console import Console
from typing import Optional
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

from sanity_pack.config import (
    get_config,
    ServerRegion,
    UnpackMode,
)
from sanity_pack.config import app as config_command
from sanity_pack.fbs import app as arknights_fbs_command
from sanity_pack.cache import app as cache_command, get_cache_manager
from sanity_pack.utils.logger import log
from sanity_pack.downloader.asset import ArknightsAssets
from sanity_pack.utils.unpacker import get_unpacker
from sanity_pack.pipelines import PipelineManager

app = typer.Typer(help="Sanity Pack CLI")
app.add_typer(config_command, name="config")
app.add_typer(cache_command, name="cache")
app.add_typer(arknights_fbs_command, name="fbs")
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
        16,
        "--concurrency",
        help="Max concurrent downloads",
    ),
):
    """Download latest game data via hot update"""
    config = get_config(config_file)
    cache_mgr = get_cache_manager(config.cache_dir)

    regions = [region] if region else config.get_enabled_servers()

    log.info(f"[bold green]Downloading from regions: {', '.join(r.value for r in regions)}[/bold green]")
    log.info(f"Output directory: {config.output_dir}")

    asset_cache = cache_mgr.get_assets()
    for region in regions:
        if region not in asset_cache.assets:
            asset_cache.assets[region] = {}

    # Execute downloads in parallel threads
    with ThreadPoolExecutor(max_workers=len(regions)) as executor:
        futures = {
            executor.submit(
                ArknightsAssets(config=config, region=r, concurrency=concurrency).download
            ): r.value
            for r in regions
        }
        
        results = {}
        for future in as_completed(futures):
            region_name = futures[future]
            try:
                results[region_name] = future.result()
            except Exception as e:
                log.exception(f"Failed to download from region {region_name}: {e}")
    
    log.info(f"[green]✓ Completed Asset Download[/green]")

@app.command()
def unpack(
    region: Optional[ServerRegion] = typer.Option(
        None,
        "--region", "-r",
        help="Server region to unpack (if not specified, unpacks all enabled)"
    ),
    config_file: Optional[Path] = typer.Option(
        None,
        "--config", "-c",
        help="Path to config file"
    ),
    concurrency: int = typer.Option(
        16,
        "--concurrency",
        help="Max concurrent extractions",
    ),
):
    """Unpack Unity assets from downloaded files"""
    config = get_config(config_file)
    
    regions = [region] if region else config.get_enabled_servers()
    
    log.info(f"[bold green]Unpacking assets for regions: {', '.join(r.value for r in regions)}[/bold green]")
    log.info(f"Unpack mode: {config.unpack_mode.value}")
    log.info(f"Output directory: {config.output_dir}")

    # Execute unpacking in parallel threads
    with ThreadPoolExecutor(max_workers=len(regions)) as executor:
        futures = {
            executor.submit(
                get_unpacker(config, r, concurrency).unpack
            ): r.value
            for r in regions
        }
        
        results = {}
        for future in as_completed(futures):
            region_name = futures[future]
            try:
                results[region_name] = future.result()
            except Exception as e:
                log.exception(f"Failed to unpack region {region_name}: {e}")

    log.info(f"[green]✓ Completed Asset Unpacking[/green]")

@app.command()
def pipeline(
    region: Optional[ServerRegion] = typer.Option(
        None,
        "--region", "-r",
        help="Server region to process (if not specified, processes all enabled)"
    ),
    config_file: Optional[Path] = typer.Option(
        None,
        "--config", "-c",
        help="Path to config file"
    ),
):
    """Run post-processing pipeline on unpacked assets"""
    config = get_config(config_file)
    
    regions = [region] if region else config.get_enabled_servers()
    
    log.info(f"[bold green]Running pipeline for regions: {', '.join(r.value for r in regions)}[/bold green]")
    log.info(f"Unpack mode: {config.unpack_mode.value}")
    log.info(f"Output directory: {config.output_dir}")
    
    # Execute pipeline for each region sequentially
    for r in regions:
        try:
            manager = PipelineManager(config=config, region=r)
            manager.run()
        except Exception as e:
            log.exception(f"Failed to run pipeline for region {r.value}: {e}")
    
    log.info(f"[green]✓ Completed Pipeline Processing[/green]")

def main():
    app()

if __name__ == "__main__":
    app()
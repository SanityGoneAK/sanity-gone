import logging

import typer
from typing import Optional
from pathlib import Path
import subprocess

from sanity_pack.utils.logger import log
from sanity_pack.config import get_config, ServerRegion
from sanity_pack.fbs.arknights.manager import FlatBuffersSchemaManager

app = typer.Typer(help="Arknights Flat Buffer management commands")

@app.command()
def download():
    """Download the FBS resources."""
    cwd = Path.cwd()

    oafbs_dir = cwd / "OpenArknightsFBS"
    if not oafbs_dir.exists():
        log.info("Cloning OpenArknightsFBS repository...")
        subprocess.run(
            f"git clone https://github.com/MooncellWiki/OpenArknightsFBS {oafbs_dir}",
            shell=True,
            cwd=cwd,
            capture_output=False,
            text=True,
            check=True
        )
    else:
        log.info("Updating OpenArknightsFBS repository...")
        subprocess.run(
            "git pull",
            shell=True,
            cwd=oafbs_dir,
            capture_output=False,
            text=True,
            check=True
        )

@app.command()
def decode(
    region: Optional[ServerRegion] = typer.Option(
        None,
        "--region", "-r",
        help="Server region to decode (if not specified, decodes all enabled)"
    ),
    config_file: Optional[Path] = typer.Option(
        None,
        "--config", "-c",
        help="Path to config file (defaults to config-fbs.json)"
    ),
):
    """Decode FlatBuffers binary files to JSON"""
    # Default to config-fbs.json if no config specified
    if config_file is None:
        config_file = Path("config-fbs.json")
    
    config = get_config(config_file)
    
    regions = [region] if region else config.get_enabled_servers()
    
    log.info(f"[bold green]Decoding FlatBuffers for regions: {', '.join(r.value for r in regions)}[/bold green]")
    log.info(f"Config file: {config_file}")
    log.info(f"Output directory: {config.output_dir}")
    log.info(f"FBS directory: {config.fbs_dir}")
    
    # Execute decoding for each region
    for r in regions:
        try:
            manager = FlatBuffersSchemaManager(config=config, region=r)
            manager.decode_all()
        except Exception as e:
            log.exception(f"Failed to decode FlatBuffers for region {r.value}: {e}")
    
    log.info(f"[green]✓ Completed FlatBuffers Decoding[/green]")


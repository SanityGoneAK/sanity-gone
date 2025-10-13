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
):
    """Download latest game data via hot update"""
    config = get_config(config_file)
    
    # Determine which regions to download
    if region:
        regions = [region]
    else:
        regions = config.get_enabled_servers()
    
    console.print(f"[bold green]Downloading from regions: {', '.join(r.value for r in regions)}[/bold green]")
    console.print(f"Output directory: {config.output_dir}")
    
    for r in regions:
        server_config = config.servers.get(r)
        if server_config:
            console.print(f"\n[cyan]{r.value}[/cyan]: {len(server_config.path_whitelist)} paths whitelisted")

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
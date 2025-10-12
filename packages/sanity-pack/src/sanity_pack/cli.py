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

app = typer.Typer(help="Sanity Pack CLI")
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
def config_show(
    config_file: Optional[Path] = typer.Option(
        None,
        "--config", "-c",
        help="Path to config file"
    ),
):
    """Show current configuration"""
    config = get_config(config_file)
    
    console.print("\n[bold]Configuration:[/bold]")
    console.print(f"Output dir: {config.output_dir}")
    console.print(f"Cache dir:  {config.cache_dir}")
    
    # Create table for server configs
    table = Table(title="\nServer Configurations")
    table.add_column("Region", style="cyan")
    table.add_column("Enabled", style="green")
    table.add_column("Whitelisted Paths", style="yellow")
    
    for region, server_config in config.servers.items():
        table.add_row(
            region.value,
            "✓" if server_config.enabled else "✗",
            str(len(server_config.path_whitelist))
        )
    
    console.print(table)

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
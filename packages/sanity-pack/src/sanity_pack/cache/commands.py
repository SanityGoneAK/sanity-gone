"""Additional CLI commands for cache management."""

import typer
from rich.console import Console
from rich.table import Table
from pathlib import Path
from typing import Optional

from sanity_pack.cache import get_cache_manager
from sanity_pack.config import get_config, ServerRegion

app = typer.Typer(help="Cache management commands")
console = Console()


@app.command()
def show(
    config_file: Optional[Path] = typer.Option(
        None,
        "--config", "-c",
        help="Path to config file"
    ),
):
    """Show cache statistics and contents"""
    config = get_config(config_file)
    cache_mgr = get_cache_manager(config.cache_dir)
    
    # Get stats
    stats = cache_mgr.get_stats()
    
    console.print("\n[bold]Cache Statistics:[/bold]")
    console.print(f"Cache directory: {cache_mgr.cache_dir}")
    console.print(f"Version cache exists: {'✓' if stats['version_cache_exists'] else '✗'}")
    console.print(f"Asset cache exists: {'✓' if stats['asset_cache_exists'] else '✗'}")
    console.print(f"Tracked servers: {stats['tracked_servers']}")
    console.print(f"Cached assets: {stats['cached_assets']}")
    
    # Show assets per region
    if 'assets_per_region' in stats:
        console.print("\n[bold]Assets per Region:[/bold]")
        for region, count in stats['assets_per_region'].items():
            console.print(f"  {region}: {count} assets")
    
    # Show version cache
    version_cache = cache_mgr.get_versions()
    if version_cache.versions:
        table = Table(title="\nServer Versions")
        table.add_column("Region", style="cyan")
        table.add_column("Resource Version", style="green")
        table.add_column("Client Version", style="yellow")
        
        for region, version in version_cache.versions.items():
            table.add_row(
                region.value,
                version.resource,
                version.client
            )
        
        console.print(table)


@app.command()
def clear_versions(
    config_file: Optional[Path] = typer.Option(
        None,
        "--config", "-c",
        help="Path to config file"
    ),
    force: bool = typer.Option(
        False,
        "--force", "-f",
        help="Skip confirmation"
    ),
):
    """Clear version cache"""
    if not force:
        confirm = typer.confirm("Are you sure you want to clear version cache?")
        if not confirm:
            raise typer.Abort()
    
    config = get_config(config_file)
    cache_mgr = get_cache_manager(config.cache_dir)
    
    version_cache = cache_mgr.get_versions()
    version_cache.versions.clear()
    cache_mgr.save_versions()
    
    console.print("[green]Version cache cleared[/green]")


@app.command()
def clear_assets(
    config_file: Optional[Path] = typer.Option(
        None,
        "--config", "-c",
        help="Path to config file"
    ),
    region: Optional[ServerRegion] = typer.Option(
        None,
        "--region", "-r",
        help="Clear assets for specific region only"
    ),
    force: bool = typer.Option(
        False,
        "--force", "-f",
        help="Skip confirmation"
    ),
):
    """Clear asset cache"""
    if not force:
        region_text = f" for {region.value}" if region else ""
        confirm = typer.confirm(f"Are you sure you want to clear asset cache{region_text}?")
        if not confirm:
            raise typer.Abort()
    
    config = get_config(config_file)
    cache_mgr = get_cache_manager(config.cache_dir)
    
    asset_cache = cache_mgr.get_assets()
    asset_cache.clear(region)
    
    cache_mgr.save_assets()
    
    region_text = f" for {region.value}" if region else ""
    console.print(f"[green]Asset cache cleared{region_text}[/green]")


@app.command()
def clear_all(
    config_file: Optional[Path] = typer.Option(
        None,
        "--config", "-c",
        help="Path to config file"
    ),
    force: bool = typer.Option(
        False,
        "--force", "-f",
        help="Skip confirmation"
    ),
):
    """Clear all caches"""
    if not force:
        confirm = typer.confirm("Are you sure you want to clear ALL caches?")
        if not confirm:
            raise typer.Abort()
    
    config = get_config(config_file)
    cache_mgr = get_cache_manager(config.cache_dir)
    
    asset_cache = cache_mgr.get_assets()
    asset_cache.clear()
    cache_mgr.save_assets()
    
    version_cache = cache_mgr.get_versions()
    version_cache.versions.clear()
    cache_mgr.save_versions()
    
    console.print("[green]All caches cleared[/green]")


@app.command()
def check_asset(
    path: str = typer.Argument(..., help="Asset path to check"),
    region: ServerRegion = typer.Argument(..., help="Server region to check"),
    config_file: Optional[Path] = typer.Option(
        None,
        "--config", "-c",
        help="Path to config file"
    ),
):
    """Check if an asset is cached and show its hash"""
    config = get_config(config_file)
    cache_mgr = get_cache_manager(config.cache_dir)
    asset_cache = cache_mgr.get_assets()
    
    if asset_cache.has_asset(region, path):
        hash_value = asset_cache.get_hash(region, path)
        console.print(f"[green]✓ Asset is cached[/green]")
        console.print(f"Region: {region.value}")
        console.print(f"Path: {path}")
        console.print(f"Hash: {hash_value}")
    else:
        console.print(f"[yellow]✗ Asset not found in cache[/yellow]")
        console.print(f"Region: {region.value}")
        console.print(f"Path: {path}")

if __name__ == "__main__":
    app()
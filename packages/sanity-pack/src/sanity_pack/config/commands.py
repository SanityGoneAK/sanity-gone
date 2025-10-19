import typer
from typing import Optional
from pathlib import Path
from sanity_pack.config import get_config, get_config_manager
from rich.console import Console
from rich.table import Table

app = typer.Typer(help="Config management commands")
console = Console()

@app.command()
def show(
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
    console.print(f"Unpack Mode:  {config.unpack_mode}")

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
def init(
    output_path: Optional[Path] = typer.Option(
        None,
        "--output", "-o",
        help="Output path for config file"
    ),
    force: bool = typer.Option(
        False,
        "--force", "-f",
        help="Overwrite existing config"
    ),
):
    """Initialize a new configuration file"""
    manager = get_config_manager(output_path)
    
    if manager.config_path.exists() and not force:
        console.print(f"[yellow]Config already exists at {manager.config_path}[/yellow]")
        console.print("[yellow]Use --force to overwrite[/yellow]")
        raise typer.Exit(1)
    
    config = manager.create_default()
    manager.save(config)
    console.print(f"[green]Created config at {manager.config_path}[/green]")


@app.command()
def validate(
    config_file: Optional[Path] = typer.Option(
        None,
        "--config", "-c",
        help="Path to config file to validate"
    ),
):
    """Validate configuration file"""
    try:
        config = get_config(config_file)
        console.print("[green]✓ Configuration is valid[/green]")
        console.print(f"  Enabled servers: {len(config.get_enabled_servers())}")
        console.print(f"  Output dir: {config.output_dir}")
        console.print(f"  Cache dir: {config.cache_dir}")
        console.print(f"  Cache dir: {config.unpack_mode}")
    except Exception as e:
        console.print(f"[red]✗ Configuration is invalid: {e}[/red]")
        raise typer.Exit(1)
    
if __name__ == "__main__":
    app()
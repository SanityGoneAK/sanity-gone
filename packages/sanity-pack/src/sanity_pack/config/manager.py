"""Configuration manager for Sanity Pack."""

import json
from pathlib import Path
from typing import Optional
from rich.console import Console

from sanity_pack.utils.logger import log
from sanity_pack.config.models import Config, ServerConfig, ServerRegion, UnpackMode

console = Console()


class ConfigManager:
    """Manages configuration loading, saving, and defaults."""

    DEFAULT_CONFIG_NAME = "config.json"

    def __init__(self, config_path: Optional[Path] = None):
        """
        Initialize the config manager.

        Args:
            config_path: Path to config file. If None, uses ./config.json
        """
        if config_path is None:
            # Default to project root config.json
            config_path = Path.cwd() / self.DEFAULT_CONFIG_NAME

        self.config_path = Path(config_path).resolve()
        self._config: Optional[Config] = None

    def load(self) -> Config:
        """
        Load configuration from file.

        Returns:
            Config object

        Raises:
            FileNotFoundError: If config file doesn't exist
            ValueError: If config file is invalid
        """
        if not self.config_path.exists():
            log.warning(
                f"[yellow]Config file not found at {self.config_path}[/yellow]"
            )
            log.warning("[yellow]Creating default configuration...[/yellow]")
            self._config = self.create_default()
            self.save(self._config)
            return self._config

        try:
            with open(self.config_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            self._config = Config.model_validate(data)
            return self._config
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON in config file: {e}")
        except Exception as e:
            raise ValueError(f"Failed to load config: {e}")

    def save(self, config: Config) -> None:
        """
        Save configuration to file.

        Args:
            config: Config object to save
        """
        self.config_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(self.config_path, "w", encoding="utf-8") as f:
            # Convert to dict, handling Path objects
            data = json.loads(config.model_dump_json())
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        log.info(f"[green]Config saved to {self.config_path}[/green]")

    def create_default(self) -> Config:
        """
        Create default configuration.

        Returns:
            Default Config object
        """
        return Config(
            output_dir=Path("./assets"),
            cache_dir=Path("./cache"),
            fbs_dir=Path("./fbs"),
            flatc_path="flatc",
            unpack_mode=UnpackMode.ARKNIGHTS_STUDIO,
            servers={
                ServerRegion.CN: ServerConfig(
                    enabled=True,
                    path_whitelist=[],
                ),
                ServerRegion.EN: ServerConfig(
                    enabled=False,
                    path_whitelist=[],
                ),
                ServerRegion.JP: ServerConfig(
                    enabled=False,
                    path_whitelist=[],
                ),
                ServerRegion.KR: ServerConfig(
                    enabled=False,
                    path_whitelist=[],
                ),
            },
        )

    def get(self) -> Config:
        """
        Get current configuration, loading if necessary.

        Returns:
            Config object
        """
        if self._config is None:
            self._config = self.load()
        return self._config

    def reload(self) -> Config:
        """
        Force reload configuration from file.

        Returns:
            Reloaded Config object
        """
        self._config = None
        return self.load()

    def update(self, **kwargs) -> Config:
        """
        Update configuration with new values and save.

        Args:
            **kwargs: Configuration values to update

        Returns:
            Updated Config object
        """
        config = self.get()
        updated_data = config.model_dump()
        updated_data.update(kwargs)
        
        new_config = Config.model_validate(updated_data)
        self.save(new_config)
        self._config = new_config
        
        return new_config


# Global config manager instance
_config_manager: Optional[ConfigManager] = None


def get_config_manager(config_path: Optional[Path] = None) -> ConfigManager:
    """
    Get the global config manager instance.

    Args:
        config_path: Path to config file (only used on first call)

    Returns:
        ConfigManager instance
    """
    global _config_manager
    if _config_manager is None:
        _config_manager = ConfigManager(config_path)
    return _config_manager


def get_config(config_path: Optional[Path] = None) -> Config:
    """
    Convenience function to get the current configuration.

    Args:
        config_path: Path to config file (only used on first call)

    Returns:
        Config object
    """
    return get_config_manager(config_path).get()
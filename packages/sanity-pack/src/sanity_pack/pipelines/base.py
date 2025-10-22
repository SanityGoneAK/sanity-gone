"""Base interface for asset processing pipeline steps."""

from abc import ABC, abstractmethod
from pathlib import Path
from typing import Optional, Set
from sanity_pack.config.models import Config, ServerRegion, UnpackMode
from sanity_pack.utils.logger import log


class PipelineStep(ABC):
    """Abstract base class for pipeline processing steps.
    
    Each step processes assets from a region's output directory.
    Steps can be configured to run only for specific unpack modes.
    """
    
    def __init__(self, config: Config, region: ServerRegion):
        """Initialize the pipeline step.
        
        Args:
            config: Configuration object containing paths and settings
            region: Server region being processed
        """
        self.config = config
        self.region = region
        self._output_dir = config.output_dir / region.value.lower()
    
    @property
    @abstractmethod
    def name(self) -> str:
        """Human-readable name of this pipeline step."""
        pass
    
    @property
    def required_modes(self) -> Optional[Set[UnpackMode]]:
        """Set of unpack modes required for this step to run.
        
        Returns:
            Set of UnpackMode values, or None if step runs for all modes
        """
        return None
    
    def should_run(self) -> bool:
        """Check if this step should run based on current configuration.
        
        Returns:
            True if step should run, False otherwise
        """
        if self.required_modes is None:
            return True
        return self.config.unpack_mode in self.required_modes
    
    @abstractmethod
    def process(self) -> None:
        """Process assets for the configured region.
        
        This method should:
        1. Find relevant files in the output directory
        2. Process each file according to step's purpose
        3. Handle errors gracefully with logging
        """
        pass
    
    def run(self) -> bool:
        """Execute the pipeline step if it should run.
        
        Returns:
            True if step was executed successfully, False if skipped or failed
        """
        if not self.should_run():
            log.info(f"[yellow]⊘ Skipping {self.name} (unpack mode: {self.config.unpack_mode.value})[/yellow]")
            return False
        
        try:
            log.info(f"[cyan]▶ Running {self.name}...[/cyan]")
            self.process()
            log.info(f"[green]✓ Completed {self.name}[/green]")
            return True
        except Exception as e:
            log.exception(f"[red]✗ Failed {self.name}: {e}[/red]")
            return False

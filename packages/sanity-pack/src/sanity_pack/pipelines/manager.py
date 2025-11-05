"""Pipeline manager for orchestrating asset processing steps."""

from typing import List, Type
from sanity_pack.config.models import Config, ServerRegion
from sanity_pack.pipelines.base import PipelineStep
from sanity_pack.pipelines.steps.process_portraits import ProcessPortraitsStep
from sanity_pack.pipelines.steps.convert_wav_to_mp3 import ConvertWavToMp3Step
from sanity_pack.pipelines.steps.process_alpha_images import ProcessAlphaImagesStep
from sanity_pack.pipelines.steps.decode_text_assets import DecodeTextAssetsStep
from sanity_pack.pipelines.steps.cleanup import CleanupStep
from sanity_pack.utils.logger import log


class PipelineManager:
    """Manages the execution of processing pipeline steps.
    
    The pipeline runs steps in order, with each step processing the
    output directory for a specific region.
    """
    
    # Define the default pipeline steps in execution order
    DEFAULT_PIPELINE: List[Type[PipelineStep]] = [
        ProcessPortraitsStep,
        ConvertWavToMp3Step,
        ProcessAlphaImagesStep,
        DecodeTextAssetsStep,
        # CleanupStep,  # Always run cleanup last
    ]
    
    def __init__(
        self,
        config: Config,
        region: ServerRegion,
        steps: List[Type[PipelineStep]] = None
    ):
        """Initialize the pipeline manager.
        
        Args:
            config: Configuration object
            region: Server region to process
            steps: Optional list of step classes to run (defaults to DEFAULT_PIPELINE)
        """
        self.config = config
        self.region = region
        self.step_classes = steps or self.DEFAULT_PIPELINE
    
    def run(self) -> None:
        """Run all pipeline steps in sequence.
        
        Each step is instantiated and executed. Steps may be skipped
        based on their required_modes configuration.
        """
        log.info(f"[bold blue]═══ Starting Pipeline for {self.region.value} ═══[/bold blue]")
        log.info(f"Output directory: {self.config.output_dir / self.region.value}")
        log.info(f"Unpack mode: {self.config.unpack_mode.value}")
        
        executed_count = 0
        skipped_count = 0
        failed_count = 0
        
        for step_class in self.step_classes:
            step = step_class(config=self.config, region=self.region)
            
            if not step.should_run():
                skipped_count += 1
                log.info(f"[yellow]⊘ Skipping {step.name}[/yellow]")
                continue
            
            try:
                log.info(f"[cyan]▶ Running {step.name}...[/cyan]")
                step.process()
                log.info(f"[green]✓ Completed {step.name}[/green]")
                executed_count += 1
            except Exception as e:
                log.exception(f"[red]✗ Failed {step.name}: {e}[/red]")
                failed_count += 1
        
        # Summary
        log.info(f"[bold blue]═══ Pipeline Summary ═══[/bold blue]")
        log.info(f"[green]Executed: {executed_count}[/green]")
        log.info(f"[yellow]Skipped: {skipped_count}[/yellow]")
        log.info(f"[red]Failed: {failed_count}[/red]")
        
        if failed_count > 0:
            log.warning(f"[bold yellow]⚠ Pipeline completed with {failed_count} failure(s)[/bold yellow]")
        else:
            log.info(f"[bold green]✓ Pipeline completed successfully[/bold green]")
    
    def add_step(self, step_class: Type[PipelineStep]) -> None:
        """Add a custom step to the pipeline.
        
        Args:
            step_class: PipelineStep class to add
        """
        self.step_classes.append(step_class)
    
    def remove_step(self, step_class: Type[PipelineStep]) -> None:
        """Remove a step from the pipeline.
        
        Args:
            step_class: PipelineStep class to remove
        """
        if step_class in self.step_classes:
            self.step_classes.remove(step_class)

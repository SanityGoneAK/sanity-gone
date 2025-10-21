"""Process portrait images pipeline step."""

from typing import Optional, Set
from sanity_pack.config.models import UnpackMode
from sanity_pack.pipelines.base import PipelineStep
from sanity_pack.utils.logger import log


class ProcessPortraitsStep(PipelineStep):
    """Process portrait images (Unity Py mode only)."""
    
    @property
    def name(self) -> str:
        return "Process Portraits"
    
    @property
    def required_modes(self) -> Optional[Set[UnpackMode]]:
        return {UnpackMode.UNITY_PY}
    
    def process(self) -> None:
        """Process portrait images from unpacked assets.
        
        TODO: Implement portrait processing logic:
        - Find portrait image files
        - Apply any necessary transformations
        - Save processed portraits
        """
        log.info(f"Processing portraits in {self._output_dir}")
        # Implementation goes here
        pass

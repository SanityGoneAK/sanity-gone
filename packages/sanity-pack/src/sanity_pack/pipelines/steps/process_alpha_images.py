"""Process alpha images pipeline step."""

from typing import Optional, Set
from sanity_pack.config.models import UnpackMode
from sanity_pack.pipelines.base import PipelineStep
from sanity_pack.utils.logger import log


class ProcessAlphaImagesStep(PipelineStep):
    """Process images with alpha channels (Unity Py mode only)."""
    
    @property
    def name(self) -> str:
        return "Process Alpha Images"
    
    @property
    def required_modes(self) -> Optional[Set[UnpackMode]]:
        return {UnpackMode.UNITY_PY}
    
    def process(self) -> None:
        """Process images with alpha channels.
        
        TODO: Implement alpha image processing:
        - Find images with alpha channels
        - Apply alpha channel processing/optimization
        - Save processed images
        """
        log.info(f"Processing alpha images in {self._output_dir}")
        # Implementation goes here
        pass

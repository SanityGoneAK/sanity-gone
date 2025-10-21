"""Decode text assets pipeline step."""

from sanity_pack.pipelines.base import PipelineStep
from sanity_pack.utils.logger import log


class DecodeTextAssetsStep(PipelineStep):
    """Decode and process text assets."""
    
    @property
    def name(self) -> str:
        return "Decode Text Assets"
    
    def process(self) -> None:
        """Decode text assets from unpacked files.
        
        TODO: Implement text asset decoding:
        - Find encoded text asset files
        - Decode to readable format
        - Save decoded text files
        """
        log.info(f"Decoding text assets in {self._output_dir}")
        # Implementation goes here
        pass

"""Decode text assets pipeline step."""

import os
import json
import re
from pathlib import Path
from typing import Optional
import bson

from sanity_pack.pipelines.base import PipelineStep
from sanity_pack.pipelines.steps.decode_strategies import AESDecodeStrategy, FBSDecodeStrategy
from sanity_pack.utils.logger import log

# Known file extensions to skip
_EXT_KNOWN = (
    ".atlas",
    ".skel",
    ".wav",
    ".mp3",
    ".m4a",
    ".mp4",
    ".avi",
    ".mov",
    ".mkv",
    ".flv",
    ".png",
    ".webp",
    ".DS_Store"
)

_EXT_AB = (".ab", ".bin")


class DecodeTextAssetsStep(PipelineStep):
    """Decode and process text assets."""
    
    @property
    def name(self) -> str:
        return "Decode Text Assets"
    
    def __init__(self, config, region):
        """Initialize the decode step."""
        super().__init__(config, region)
        try:
            self.aes_strategy = AESDecodeStrategy()
        except ImportError as e:
            log.warning(f"AES decoding not available: {e}")
            self.aes_strategy = None
        self.fbs_strategy = FBSDecodeStrategy(config.fbs_dir, region, config.flatc_path)
    
    def is_binary_file(self, path: Path) -> bool:
        """Check if a file is binary.
        
        Args:
            path: Path to check
            
        Returns:
            True if file appears to be binary
        """
        try:
            with open(path, 'rb') as f:
                chunk = f.read(1024)
                return b'\0' in chunk
        except Exception:
            return False
    
    def should_process_file(self, path: Path) -> bool:
        """Determine if a file should be processed.
        
        Args:
            path: Path to check
            
        Returns:
            True if file should be processed
        """
        if not path.is_file():
            return False
        
        ext = path.suffix.lower()
        if ext in _EXT_KNOWN:
            return False
        
        if ext in _EXT_AB:
            return False
        
        if self.is_binary_file(path):
            return True
        
        return False

    def load_json_or_bson(self, data: bytes):
        """Load json or possibly bson."""
        if b"\x00" in data[:256]:
            return bson.decode(data)

        return json.loads(data)

    def normalize_json(self, data: bytes, *, indent: int = 4, lenient: bool = True) -> bytes:
        """Normalize a json format."""
        if lenient and b"\x00" not in data[:256]:
            return data

        json_data = self.load_json_or_bson(data)
        return json.dumps(json_data, indent=indent, ensure_ascii=False).encode("utf-8")

    def _save_result(self, output_path: Path, result: bytes) -> None:
        """Save decoded result to file.
        
        Args:
            output_path: Path to save the result
            result: Data to save
        """
        try:
            output_path.parent.mkdir(parents=True, exist_ok=True)
            output_path.write_bytes(result)
            log.debug(f"Saved decoded file: {output_path}")
        except Exception as e:
            log.error(f'Failed to save result for "{output_path}": {str(e)}', exc_info=True)
    
    def process_file(self, file_path: Path) -> None:
        """Process a single file.
        
        Args:
            file_path: Path to the file to process
        """
        try:
            path_str = str(file_path)
            relative_path = file_path.relative_to(self._output_dir)
            
            # Handle already normalized JSON files
            if match := re.search(r"((gamedata/)?.+?\.json)", path_str):
                with open(file_path, "rb") as f:
                    data = f.read()
                output_path = self._output_dir / match.group(1)
                log.info(f"Decoding file: {path_str}")
                self._save_result(output_path, self.normalize_json(data))
                return
            
            # Handle Lua files
            if match := re.search(r"(gamedata/.+?)\.lua\.bytes", path_str):
                if self.aes_strategy:
                    result = self.aes_strategy.decode(file_path)
                    if result:
                        output_path = file_path.parent / (match.group(1) + '.lua')
                        self._save_result(output_path, result)
                        file_path.unlink()
                else:
                    log.warning(f"AES decoding not available, skipping {file_path}")
                return
            
            # Handle level files
            if match := re.search(r"(gamedata/levels/(?:obt|activities)/.+?)\.bytes", path_str):
                try:
                    with open(file_path, "rb") as f:
                        data = f.read()
                    text = self.normalize_json(data[128:])
                    self._save_result(file_path.with_suffix('.json'), text)
                    file_path.unlink()
                except Exception:
                    # Fall back to FlatBuffers decoding
                    result = self.fbs_strategy.decode(file_path)
                    if result:
                        output_path = file_path.parent / f"{Path(match.group(1)).stem}.json"
                        self._save_result(output_path, result)
                        file_path.unlink()
                return
            
            # Handle buff_template_data
            if "gamedata/battle/buff_template_data.bytes" in path_str:
                with open(file_path, "rb") as f:
                    data = f.read()
                self._save_result(
                    file_path.with_suffix('.json'),
                    self.normalize_json(data)
                )
                file_path.unlink()
                return
            
            # Try FlatBuffers first, then AES for generic .bytes files
            if match := re.search(r"(gamedata/.+?)(?:[a-fA-F0-9]{6})?\.bytes", path_str):
                # Try FlatBuffers decoding first
                result = self.fbs_strategy.decode(file_path)
                if result:
                    output_path = file_path.parent / f"{Path(match.group(1)).stem}.json"
                    self._save_result(output_path, result)
                    file_path.unlink()
                    return
                
                # Fall back to AES decoding
                if self.aes_strategy:
                    result = self.aes_strategy.decode(file_path)
                    if result:
                        output_path = file_path.with_suffix('.json')
                        self._save_result(output_path, result)
                        file_path.unlink()
                else:
                    log.warning(f"AES decoding not available, skipping {file_path}")
                return
            
            log.warning(f"Unrecognized file type: {file_path}")
            
        except Exception as e:
            log.error(f'Failed to process file "{file_path}": {str(e)}', exc_info=True)
    
    def process(self) -> None:
        """Decode text assets from unpacked files."""
        log.info(f"Decoding text assets in {self._output_dir}")
        
        if not self._output_dir.exists():
            log.warning(f"Output directory does not exist: {self._output_dir}")
            return
        
        processed_count = 0
        skipped_count = 0
        
        # Walk through the output directory and process files
        for root, dirs, files in os.walk(self._output_dir):
            for file in files:
                file_path = Path(root) / file
                
                if self.should_process_file(file_path):
                    self.process_file(file_path)
                    processed_count += 1
                else:
                    skipped_count += 1
        
        log.info(
            f"Decoding complete: {processed_count} processed, "
            f"{skipped_count} skipped"
        )

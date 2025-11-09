"""FlatBuffers decoding strategy for text assets."""

import json
import re
import shlex
import subprocess
import tempfile
from pathlib import Path
from typing import Optional, Any
import typing

from sanity_pack.config.models import ServerRegion
from sanity_pack.utils.logger import log


class FBSDecodeStrategy:
    """Strategy for decoding FlatBuffers files."""
    
    def __init__(self, fbs_dir: Path, region: ServerRegion, flatc_path: str = "flatc"):
        """Initialize FBS decode strategy.
        
        Args:
            fbs_dir: Base directory containing FBS schemas
            region: Server region being processed
            flatc_path: Path to flatc executable (can be a command name or full path)
        """
        self.fbs_dir = Path(fbs_dir)
        self.region = region
        self.flatc_path = flatc_path
        
        # Determine server type for schema directory
        # Use region's lowercase value (e.g., 'cn', 'jp', 'tw', 'en', 'kr')
        # This matches the FBS directory structure
        self.server_type = 'jp' # We use JP for YoStar related paths
        match self.region:
            case ServerRegion.CN:
                self.server_type = 'cn'
            case ServerRegion.TW:
                self.server_type = 'tw'
        
        self.schema_dir = self.fbs_dir / "raw" / self.server_type
    
    def _guess_table_name(self, file_path: Path) -> Optional[str]:
        """Guess the table name from file path.
        
        Args:
            file_path: Path to the FlatBuffers file
            
        Returns:
            Table name if found, None otherwise
        """
        # Extract table name from path (e.g., "buff_table1fc1b5" -> "buff_table")
        if match := re.search(r"(\w+_(?:table|data|const|database|text))[0-9a-fA-F]{6}", file_path.name):
            return match.group(1)

        if match := re.search(r"(gamedata/levels/(?:obt|activities)/.+?)\.bytes", str(file_path)):
            # Override for levels to use the same fbs file
            return 'prts___levels'

        return None
    
    def _get_schema_path(self, table_name: str) -> Optional[Path]:
        """Get the schema path for a table name.

        Args:
            table_name: Name of the table
            
        Returns:
            Path to schema file if found, None otherwise
        """
        schema_path = self.schema_dir / f"{table_name}.fbs"
        if schema_path.exists():
            return schema_path

        return None
    
    def run_flatbuffers(
        self,
        fbs_path: Path,
        fbs_schema_path: Path,
        output_directory: Path,
    ) -> Path:
        """Run the flatbuffers CLI tool.
        
        Args:
            fbs_path: Path to the binary FlatBuffers file
            fbs_schema_path: Path to the schema file
            output_directory: Directory for output JSON
            
        Returns:
            Path to the generated JSON file
            
        Raises:
            ValueError: If flatc fails
        """
        args = [
            self.flatc_path,
            "-o",
            str(output_directory),
            str(fbs_schema_path),
            "--",
            str(fbs_path),
            "--json",
            "--strict-json",
            "--natural-utf8",
            "--defaults-json",
            "--unknown-json",
            "--raw-binary",
            "--no-warnings",
            "--force-empty",
        ]
        result = subprocess.run(
            args,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False
        )
        
        if result.returncode != 0:
            log_file = Path(tempfile.mktemp(
                ".log",
                dir=Path(tempfile.gettempdir()) / "flatbufferlogs"
            ))
            log_file.parent.mkdir(parents=True, exist_ok=True)
            log_file.write_bytes(result.stdout + b"\n\n\n\n" + result.stderr)
            raise ValueError(
                f"flatc failed with code {result.returncode}: {log_file} "
                f"`{shlex.join(args)}` "
                "(random exit code likely means a faulty FBS file was provided)"
            )
        
        return Path(output_directory) / (Path(fbs_path).stem + ".json")
    
    def recursively_collapse_keys(self, obj: Any) -> Any:
        """Recursively collapse Arknights FlatBuffers key-value pairs.
        
        Arknights FlatBuffers often use {"key": ..., "value": ...} pairs.
        This method collapses them into a regular dictionary.
        
        Args:
            obj: Object to collapse (dict, list, or primitive)
            
        Returns:
            Collapsed object
        """
        if isinstance(obj, list):
            obj = typing.cast("typing.Any", obj)
            # Check if all items are key-value pairs
            if all(
                isinstance(item, dict) and item.keys() == {"key", "value"}
                for item in obj
            ):
                return {
                    item["key"]: self.recursively_collapse_keys(item["value"])
                    for item in obj
                }
            return [self.recursively_collapse_keys(item) for item in obj]
        
        if isinstance(obj, dict):
            obj = typing.cast("typing.Any", obj)
            return {k: self.recursively_collapse_keys(v) for k, v in obj.items()}
        
        return obj
    
    def decode(self, file_path: Path, has_rsa: bool = True) -> Optional[bytes]:
        """Decode a FlatBuffers file.
        
        Args:
            file_path: Path to the FlatBuffers file
            has_rsa: Whether the file has an RSA header (128 bytes) to skip
            
        Returns:
            Decoded JSON data as bytes, or None if decoding failed
        """
        try:
            # Extract table name from path
            table_name = self._guess_table_name(file_path)
            if not table_name:
                log.debug(f"Could not guess table name for {file_path}")
                return None
            
            # Get schema path
            schema_path = self._get_schema_path(table_name)
            if not schema_path:
                log.warning(f"Schema file not found for {table_name}")
                return None
            
            # Create temporary directory for flatc output
            temp_dir = Path(tempfile.mkdtemp())
            try:
                # Read and process the input file
                with open(file_path, "rb") as f:
                    data = f.read()
                
                # Remove RSA header if needed
                if has_rsa:
                    data = data[128:]
                
                # Create a temporary file with the processed data
                temp_input = temp_dir / "input.bytes"
                temp_input.write_bytes(data)
                
                # Run flatc
                output_path = self.run_flatbuffers(temp_input, schema_path, temp_dir)
                
                # Process the output
                parsed_data = json.loads(output_path.read_text(encoding="utf-8"))
                # parsed_data = self.recursively_collapse_keys(parsed_data)
                
                # If the result is a single-key dict, extract the value
                if isinstance(parsed_data, dict) and len(parsed_data) == 1:
                    parsed_data = next(iter(parsed_data.values()))
                
                return json.dumps(
                    parsed_data,
                    indent=4,
                    ensure_ascii=False
                ).encode("utf-8")
                
            finally:
                # Clean up temporary directory
                for file in temp_dir.glob("*"):
                    file.unlink()
                temp_dir.rmdir()
                
        except Exception as e:
            log.error(
                f'Failed to decode FlatBuffer file "{file_path}": {str(e)}',
                exc_info=True
            )
            return None


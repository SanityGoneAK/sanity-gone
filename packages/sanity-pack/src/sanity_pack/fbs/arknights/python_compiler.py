"""Python compiler for FlatBuffers schemas. Based on Harry Huang's method"""

import os
import re
import shutil
import subprocess
from pathlib import Path
from typing import Optional

from sanity_pack.config import Config, ServerRegion
from sanity_pack.utils.logger import log


class FlatBuffersPythonCompiler:
    """Handles compilation of FlatBuffers schema files (.fbs) to Python scripts."""

    def __init__(self, config: Config, region: ServerRegion, output_dir: Optional[Path] = None):
        self.config = config
        self.region = region
        self.fbs_base_dir = Path(config.fbs_dir)
        self.fbs_dir = self.fbs_base_dir / "raw" / region.value.lower()
        
        if output_dir:
            self.output_dir = Path(output_dir) / region.value.lower()
        else:
            self.output_dir = self.fbs_base_dir / "python" / region.value.lower()

    @staticmethod
    def _get_root_type_name(fbs_file: Path) -> str:
        with open(fbs_file, encoding='UTF-8') as f:
            content = f.readlines()
            for line in content:
                match = re.match(r'root_type\s(.+);', line)
                if match:
                    return match.group(1)
        return ""

    def compile_all(self) -> int:
        if not self.fbs_dir.exists():
            log.warning(f"[yellow]FBS directory for region {self.region.value} not found: {self.fbs_dir}[/yellow]")
            return 0

        log.info(f"[cyan]Processing region {self.region.value}...[/cyan]")
        log.info(f"  Source: {self.fbs_dir}")
        log.info(f"  Output: {self.output_dir}")

        # Remove existing output directory
        if self.output_dir.exists():
            log.info(f"  Removing existing output directory...")
            shutil.rmtree(self.output_dir)

        # Create output directory
        self.output_dir.mkdir(parents=True, exist_ok=True)

        # Process all .fbs files
        count = 0
        for root, _, files in os.walk(self.fbs_dir):
            for file in files:
                if file.endswith(".fbs"):
                    fbs_file = Path(root) / file
                    if self._compile_file(fbs_file):
                        count += 1

        log.info(f"  [green]✓ Region {self.region.value}: {count} files compiled[/green]")
        return count

    def _compile_file(self, fbs_file: Path) -> bool:
        pure_name = os.path.splitext(fbs_file.name)[0]
        
        log.info(f"  Compiling: {fbs_file.relative_to(self.fbs_base_dir)}")

        # Compile FBS to Python
        result = subprocess.run(
            [self.config.flatc_path, '--python', '--gen-onefile', '-o', str(self.output_dir), str(fbs_file)],
            capture_output=True,
            text=True,
            check=False
        )

        if result.returncode != 0:
            log.error(f"    [red]Failed to compile {fbs_file}: {result.stderr}[/red]")
            return False

        # Modify the generated Python file
        generated_py = self.output_dir / f'{pure_name}_generated.py'
        if not generated_py.exists():
            log.warning(f"    [yellow]Generated file not found: {generated_py}[/yellow]")
            return False

        # Read and modify content
        with open(generated_py, encoding='UTF-8') as rf:
            content = rf.readlines()

        # Determine line separator
        if content and content[0].endswith('\r\n'):
            linesep = '\r\n'
        else:
            linesep = '\n'

        # Remove trailing empty lines
        while content and content[-1] == linesep:
            content.pop()

        # Get root type name and add it
        root_type_name = self._get_root_type_name(fbs_file)
        if root_type_name:
            content.extend([linesep, f'ROOT_TYPE = {root_type_name}', linesep])

        # Write to new file with clean name
        final_py = self.output_dir / f'{pure_name}.py'
        with open(final_py, 'w', encoding='UTF-8') as wf:
            wf.writelines(content)

        # Remove generated file
        generated_py.unlink()
        return True

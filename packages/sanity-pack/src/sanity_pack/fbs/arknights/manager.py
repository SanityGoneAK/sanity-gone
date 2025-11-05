import random
import shlex
from typing import Dict, List, Optional
from pathlib import Path
import json
import subprocess
import tempfile

from sanity_pack.config import Config, ServerRegion
from sanity_pack.cache import get_flatbuffers_cache
from sanity_pack.utils.logger import log


class FlatBuffersSchemaManager:
    """
    Handles FlatBuffers schema downloading and decoding
    Assumes assets are already downloaded and extracted.
    """

    FLATBUFFER_LIST = [
        "activity_table",
        "audio_data",
        "battle_equip_table",
        "buff_table",
        "building_data",
        "campaign_table",
        "chapter_table",
        "char_master_table",
        "char_meta_table",
        "char_patch_table",
        "character_table",
        "charm_table",
        "charword_table",
        "checkin_table",
        "climb_tower_table",
        "clue_data",
        "crisis_table",
        "crisis_v2_table",
        "display_meta_table",
        "enemy_database",
        "enemy_handbook_table",
        "favor_table",
        "gacha_table",
        "gamedata_const",
        "handbook_info_table",
        "handbook_team_table",
        "hotupdate_meta_table",
        "init_text",
        "item_table",
        "level_script_table",
        "main_text",
        "medal_table",
        "meta_ui_table",
        "mission_table",
        "open_server_table",
        "replicate_table",
        "retro_table",
        "roguelike_topic_table",
        "sandbox_perm_table",
        "shop_client_table",
        "skill_table",
        "skin_table",
        "special_operator_table",
        "stage_table",
        "story_review_meta_table",
        "story_review_table",
        "story_table",
        "tip_table",
        "token_table",
        "uniequip_table",
        "zone_table",
        "cooperate_battle_table",
        "ep_breakbuff_table",
        "extra_battlelog_table",
        "legion_mode_buff_table",
        "building_local_data",
    ]

    FLATBUFFER_MAPPINGS = {
        "level_": "prts___levels",
    }

    def __init__(self, config: Config, region: ServerRegion):
        """"""
        self.config = config
        self.region = region
        self._output_dir = config.output_dir / region.value.lower()
        self._fbs_dir = config.fbs_dir
        self._git_repo_dir = Path("OpenArknightsFBS")  # Local git repository

    def get_flatbuffer_name(self, path: Path) -> str | None:
        base = path.stem
        
        # Try exact match
        if base in self.FLATBUFFER_LIST:
            return base
            
        # Try truncated (remove last 6 chars)
        if len(base) > 6 and base[:-6] in self.FLATBUFFER_LIST:
            return base[:-6]
            
        # Try mappings (e.g., "level_" -> "prts___levels")
        for prefix, schema in self.FLATBUFFER_MAPPINGS.items():
            if prefix in base:
                return schema
                
        return None

    def get_binary_files(self) -> Dict[str, List[Path]]:
        files_by_schema = {}
        
        # Look for .bytes files in the region output directory
        if not self._output_dir.exists():
            log.warning(f"[yellow]Output directory not found: {self._output_dir}[/yellow]")
            return files_by_schema
        log.info(self._output_dir)

        for path in self._output_dir.rglob("*.bytes"):
            schema = self.get_flatbuffer_name(path)
            if schema:
                if schema not in files_by_schema:
                    files_by_schema[schema] = []
                files_by_schema[schema].append(path)
            else:
                log.info(f"[dim]Unknown schema for file: {path}[/dim]")
                    
        return files_by_schema

    def get_latest_commit(self) -> str | None:
        """Return the latest (HEAD) commit SHA from the main branch."""
        try:
            result = subprocess.run(
                ["git", "rev-parse", "HEAD"],
                cwd=self._git_repo_dir,
                capture_output=True,
                text=True,
                check=True
            )
            return result.stdout.strip()
        except subprocess.CalledProcessError as e:
            log.error(f"Error getting latest commit: {e}")
            return None

    def get_parent_commit(self, commit_sha: str) -> str | None:
        """Return the parent commit SHA of a given commit, or None if it's the first commit."""
        try:
            result = subprocess.run(
                ["git", "rev-parse", f"{commit_sha}^"],
                cwd=self._git_repo_dir,
                capture_output=True,
                text=True,
                check=True
            )
            return result.stdout.strip()
        except subprocess.CalledProcessError:
            # This means there's no parent (first commit)
            log.debug(f"[dim]{commit_sha} has no parent (probably the first commit)[/dim]")
            return None

    def get_schema(self, schema: str, commit: str) -> Path:
        """Extract a FlatBuffers schema file from the local git repository."""
        schema_file = f"{schema}.fbs"
        schema_path = self._fbs_dir / "raw" / self.region.lower() / schema_file
        
        # Ensure fbs directory exists
        self._fbs_dir.mkdir(parents=True, exist_ok=True)
        schema_path.parent.mkdir(parents=True, exist_ok=True)
        
        try:
            # Use git show to extract the file content from the specific commit
            result = subprocess.run(
                ["git", "show", f"{commit}:FBS/{schema_file}"],
                cwd=self._git_repo_dir,
                capture_output=True,
                text=True,
                check=True
            )
            
            # Write the content to the schema file
            with open(schema_path, "w", encoding="utf-8") as f:
                f.write(result.stdout)
                
            return schema_path
        except subprocess.CalledProcessError as e:
            log.error(f"[red]Error extracting schema {schema_file} from commit {commit}: {e}[/red]")
            raise


    def run_flatbuffers(
        self,
        fbs_path: Path,
        fbs_schema_path: Path,
        output_directory: Path,
    ) -> Path:
        """Run the flatbuffers cli. Returns the output filename."""
        args = [
            self.config.flatc_path,
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
        result = subprocess.run(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
        if result.returncode != 0:
            file = Path(tempfile.mktemp(".log", dir=Path(tempfile.gettempdir()) / "flatbufferlogs"))
            file.parent.mkdir(parents=True, exist_ok=True)
            file.write_bytes(result.stdout + b"\n\n\n\n" + result.stderr)
            raise ValueError(
                f"flatc failed with code {result.returncode}: {file} `{shlex.join(args)}` (random exit code likely means a faulty FBS file was provided)",
            )

        return Path(output_directory) / (Path(fbs_path).stem + ".json")

    def process_schema(self, schema: str, files: List[Path]) -> bool:
        """Process a schema by brute-forcing through commit history."""
        cache = get_flatbuffers_cache()
        
        # Start with cached commit or latest commit
        current_commit = cache.get_commit(self.region, schema)
        if not current_commit:
            current_commit = self.get_latest_commit()
            if not current_commit:
                log.error(f"[red]Failed to get latest commit for {schema}[/red]")
                return False
            log.info(f"[cyan]No cached commit for {schema}, starting from latest: {current_commit[:8]}[/cyan]")
        
        success_count = 0
        
        while current_commit:
            log.info(f"[dim]Trying {schema} with commit {current_commit[:8]}[/dim]")
            
            try:
                # Get schema for this commit
                schema_path = self.get_schema(schema, current_commit)
                schema_success = True
                # Like Ashlen's approach, get 20 random files when it comes to prts__level fbs, we can probably run this in multiple threads but there is no reason to for now...
                files = random.sample(files, min(len(files), 20))

                for binary_file in files:
                    temp_dir = Path(tempfile.mkdtemp())
                    try:
                        # Read and process the input file
                        with open(binary_file, "rb") as f:
                            data = f.read()

                        # Remove RSA header if needed, I haven't seen a case where it is not needed.
                        data = data[128:]

                        # Create a temporary file with the processed data
                        temp_input = temp_dir / "input.bytes"
                        temp_input.write_bytes(data)

                        # Run flatc
                        output_path = self.run_flatbuffers(temp_input, schema_path, temp_dir)

                        # Process the output
                        parsed_data = output_path.read_text(encoding="utf-8")
                        success_count += 1
                    except Exception as e:
                        schema_success = False
                        log.exception(f"[red]Failed to extract schema for {schema}[/red]")
                    finally:
                        # Clean up temporary directory
                        for file in temp_dir.glob("*"):
                            file.unlink()
                        temp_dir.rmdir()
                
                # If all files succeeded with this schema, cache it and return
                if schema_success and success_count > 0:
                    cache.set_commit(self.region, schema, current_commit)
                    log.info(f"[green]✓ Cached working commit for {schema}: {current_commit[:8]}[/green]")
                    return True
                    
            except Exception as e:
                log.debug(f"[dim]Failed to process {schema} with commit {current_commit[:8]}: {e}[/dim]")
            
            # Move to parent commit
            current_commit = self.get_parent_commit(current_commit)
            if not current_commit:
                log.warning(f"[yellow]Exhausted commit history for {schema}[/yellow]")
                break
        
        return success_count > 0


    def decode_all(self) -> None:
        log.info(f"[bold blue]═══ Starting FlatBuffers Decoding for {self.region.value} ═══[/bold blue]")
        log.info(f"Output directory: {self._output_dir}")
        log.info(f"FBS directory: {self._fbs_dir}")
        
        # Load cache
        cache = get_flatbuffers_cache()
        
        # Find all binary files
        files_by_schema = self.get_binary_files()
        
        if not files_by_schema:
            log.warning(f"[yellow]No FlatBuffers files found in {self._output_dir}[/yellow]")
            return
        
        log.info(f"[cyan]Found {len(files_by_schema)} schemas to process[/cyan]")
        
        # Process each schema
        success_count = 0
        failed_count = 0
        
        for schema, files in files_by_schema.items():
            log.info(f"[cyan]Processing {schema} ({len(files)} files)...[/cyan]")
            
            try:
                if self.process_schema(schema, files):
                    success_count += 1
                    log.info(f"[green]✓ Successfully processed {schema}[/green]")
                else:
                    failed_count += 1
                    log.warning(f"[yellow]⚠ Failed to process {schema}[/yellow]")
            except Exception as e:
                failed_count += 1
                log.exception(f"[red]✗ Error processing {schema}: {e}[/red]")
        
        # Save cache
        try:
            from sanity_pack.cache import get_cache_manager
            cache_manager = get_cache_manager()
            cache_manager.save_flatbuffers(cache)
            log.info(f"[green]✓ Cache saved[/green]")
        except Exception as e:
            log.error(f"[red]Failed to save cache: {e}[/red]")
        
        # Summary
        log.info(f"[bold blue]═══ FlatBuffers Decoding Summary ═══[/bold blue]")
        log.info(f"[green]Successful: {success_count}[/green]")
        log.info(f"[red]Failed: {failed_count}[/red]")
        
        if failed_count > 0:
            log.warning(f"[bold yellow]⚠ Decoding completed with {failed_count} failure(s)[/bold yellow]")
        else:
            log.info(f"[bold green]✓ All schemas decoded successfully[/bold green]")
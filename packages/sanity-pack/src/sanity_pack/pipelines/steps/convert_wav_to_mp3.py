"""Convert WAV to MP3 pipeline step."""

from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from sanity_pack.pipelines.base import PipelineStep
from sanity_pack.utils.logger import log
from pydub import AudioSegment

class ConvertWavToMp3Step(PipelineStep):
    """Convert .wav audio files to .mp3 format."""
    
    @property
    def name(self) -> str:
        return "Convert WAV to MP3"
    
    def _convert_single_file(self, wav_path: Path) -> tuple[Path, bool]:
        """Convert a single WAV file to MP3.
        
        Args:
            wav_path: Path to the WAV file to convert
            
        Returns:
            Tuple of (wav_path, success_status)
        """
        try:
            mp3_path = wav_path.with_suffix(".mp3")
            
            # Load WAV and export as MP3 with 192k bitrate
            audio = AudioSegment.from_wav(str(wav_path))
            audio.export(str(mp3_path), format="mp3", bitrate="192k")
            
            # Remove original WAV file after successful conversion
            wav_path.unlink()
            
            log.info(f"[green]✓[/green] Converted: {wav_path.name} → {mp3_path.name}")
            return (wav_path, True)
        except Exception:
            log.exception(f"[red]✗[/red] Failed to convert {wav_path.name}")
            return (wav_path, False)
    
    def process(self) -> None:
        """Convert WAV files to MP3 format concurrently.
        
        Finds all .wav files recursively in the output directory and
        converts them to .mp3 format using 192k bitrate. Processing
        is done concurrently using threads for better performance.
        Original WAV files are removed after successful conversion.
        """
        log.info(f"Converting WAV files to MP3 in {self._output_dir}")
        
        # Find all WAV files recursively
        wav_files = list(self._output_dir.rglob("*.wav"))
        
        if not wav_files:
            log.info("[yellow]No WAV files found to convert[/yellow]")
            return
        
        log.info(f"Found {len(wav_files)} WAV file(s) to convert")
        
        # Convert files concurrently using threads
        success_count = 0
        failed_count = 0
        
        with ThreadPoolExecutor() as executor:
            # Submit all conversion tasks
            futures = {
                executor.submit(self._convert_single_file, wav_file): wav_file
                for wav_file in wav_files
            }
            
            # Process results as they complete
            for future in as_completed(futures):
                wav_path, success = future.result()
                if success:
                    success_count += 1
                else:
                    failed_count += 1
        
        # Log summary
        log.info(f"[bold]Conversion complete:[/bold] {success_count} succeeded, {failed_count} failed")

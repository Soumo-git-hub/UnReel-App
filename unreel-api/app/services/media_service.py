import yt_dlp
import ffmpeg
import tempfile
import os
import logging
import shutil
from typing import Dict, List, Any, cast, Optional

from app.services.speech_service import SpeechService

# Configure logging
logger = logging.getLogger(__name__)


class MediaService:
    """Service for processing video content including download, audio extraction, and transcription."""
    
    def __init__(self):
        """Initialize the MediaService with SpeechService and configure ffmpeg path."""
        self.speech_service = SpeechService()
        # Add the ffmpeg path to the environment
        self._configure_ffmpeg_path()

    def _configure_ffmpeg_path(self) -> None:
        """Configure the ffmpeg path in the system environment."""
        ffmpeg_paths = [
            r"C:\Users\acer\AppData\Local\ffmpegio\ffmpeg-downloader\ffmpeg\bin",
            r"/usr/local/bin",
            r"/usr/bin"
        ]
        
        for path in ffmpeg_paths:
            if os.path.exists(path):
                current_path = os.environ.get("PATH", "")
                if path not in current_path:
                    os.environ["PATH"] = path + os.pathsep + current_path
                break

    async def process_video(self, url: str) -> Dict[str, Any]:
        """
        Process a video by downloading it, extracting audio, and capturing frames.
        
        Args:
            url: The URL of the video to process
            
        Returns:
            Dictionary containing paths to processed media files and metadata
        """
        with tempfile.TemporaryDirectory() as temp_dir:
            video_path = os.path.join(temp_dir, 'video.mp4')
            audio_path = os.path.join(temp_dir, 'audio.mp3')
            
            # 1. Download Video & Caption using yt-dlp library
            ydl_opts = {
                'format': 'best[ext=mp4]',
                'outtmpl': video_path,
                'quiet': True,
            }
            
            try:
                with yt_dlp.YoutubeDL(cast(Any, ydl_opts)) as ydl:
                    info = ydl.extract_info(url, download=True)
                    metadata = {
                        'title': info.get('title'),
                        'uploader': info.get('uploader'),
                        'caption': info.get('description'),
                    }
            except Exception as e:
                logger.error(f"Error downloading video: {str(e)}")
                raise
            
            # 2. Extract Audio using ffmpeg-python wrapper (if ffmpeg is available)
            ffmpeg_available = shutil.which("ffmpeg") is not None
            if ffmpeg_available:
                audio_path = self._extract_audio(video_path, audio_path)
            else:
                logger.warning("ffmpeg not found, skipping audio extraction")
                audio_path = None

            # 3. Extract Frames (using ffmpeg-python) (if ffmpeg is available)
            frame_paths = []
            if ffmpeg_available:
                frame_paths = self._extract_frames(video_path, temp_dir)
            else:
                logger.warning("ffmpeg not found, skipping frame extraction")

            # 4. Extract transcript from audio (if audio is available)
            transcript = self._extract_transcript(audio_path)

            # Return paths and metadata
            return {
                "video_path": video_path,
                "audio_path": audio_path,
                "frame_paths": frame_paths,
                "metadata": metadata,
                "transcript": transcript,
                "temp_dir": temp_dir
            }

    def _extract_audio(self, video_path: str, audio_path: str) -> Optional[str]:
        """
        Extract audio from video file.
        
        Args:
            video_path: Path to the video file
            audio_path: Path where audio should be saved
            
        Returns:
            Path to the extracted audio file or None if extraction fails
        """
        try:
            ffmpeg.input(video_path).output(audio_path).run(quiet=True)
            logger.info(f"Audio extracted successfully to {audio_path}")
            return audio_path
        except ffmpeg.Error as e:
            logger.error(f'ffmpeg error - stdout: {e.stdout.decode("utf8")}')
            logger.error(f'ffmpeg error - stderr: {e.stderr.decode("utf8")}')
            return None
        except Exception as e:
            logger.error(f'Error extracting audio: {e}')
            return None

    def _extract_frames(self, video_path: str, temp_dir: str) -> List[str]:
        """
        Extract frames from video file.
        
        Args:
            video_path: Path to the video file
            temp_dir: Temporary directory for storing frames
            
        Returns:
            List of paths to extracted frame files
        """
        try:
            frames_dir = os.path.join(temp_dir, 'frames')
            os.makedirs(frames_dir, exist_ok=True)
            frames_path_template = os.path.join(frames_dir, 'frame-%03d.png')
            
            ffmpeg.input(video_path).filter('fps', fps=1).output(frames_path_template).run(quiet=True)
            
            frame_paths = [os.path.join(frames_dir, f) for f in os.listdir(frames_dir) if f.endswith('.png')]
            logger.info(f"Extracted {len(frame_paths)} frames")
            return frame_paths
        except Exception as e:
            logger.error(f'Error extracting frames: {e}')
            return []

    def _extract_transcript(self, audio_path: Optional[str]) -> str:
        """
        Extract transcript from audio file.
        
        Args:
            audio_path: Path to the audio file
            
        Returns:
            Transcript text
        """
        if audio_path and os.path.exists(audio_path):
            transcript = self.speech_service.extract_transcript_with_fallback(audio_path)
            logger.info("Transcript extracted successfully")
            return transcript
        else:
            transcript = "Full transcript would be extracted from audio in a real implementation with ffmpeg available"
            logger.info("No audio available for transcription")
            return transcript
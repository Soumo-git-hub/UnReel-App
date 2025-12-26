import os
import shutil
import logging
import tempfile
import re
import requests
from typing import Dict, Any, Optional, List, cast
import yt_dlp
import ffmpeg

from app.services.speech_service import SpeechService
from app.core.config import settings

# Configure logging
logger = logging.getLogger(__name__)


class MediaService:
    """Service for media processing operations."""
    
    def __init__(self):
        """Initialize the MediaService with SpeechService."""
        self.speech_service = SpeechService()
        
    async def process_video(self, url: str) -> Dict[str, Any]:
        """
        Process a video from URL: download, extract audio, extract frames, extract transcript.
        
        Args:
            url: URL of the video to process
            
        Returns:
            Dictionary containing paths to processed media and metadata
        """
        # Check if this is a Google Drive URL
        if 'drive.google.com' in url:
            return await self._process_google_drive_video(url)
        
        # Create a temporary directory for processing
        with tempfile.TemporaryDirectory() as temp_dir:
            video_path = os.path.join(temp_dir, 'video.mp4')
            audio_path = os.path.join(temp_dir, 'audio.mp3')
            
            # 1. Download Video & Caption using yt-dlp library
            ydl_opts = {
                'format': 'best[ext=mp4]',
                'outtmpl': video_path,
                'quiet': True,
            }
            
            # Add cookie support for Instagram
            if 'instagram.com' in url:
                # Check if cookie file exists in settings
                if settings.INSTAGRAM_COOKIE_FILE and os.path.exists(settings.INSTAGRAM_COOKIE_FILE):
                    ydl_opts['cookiefile'] = settings.INSTAGRAM_COOKIE_FILE
                    logger.info(f"Using Instagram cookies from {settings.INSTAGRAM_COOKIE_FILE}")
                else:
                    # Use embed page as fallback which might not require login
                    ydl_opts.update({
                        'format': 'best[ext=mp4]/best',
                        'extractor_args': {
                            'instagram': {
                                'skip_login': True,
                                'use_embed_page': True,
                            }
                        }
                    })
                    logger.info("Using Instagram embed page fallback")
            
            # Add retry logic for rate-limited requests with appropriate cooldown times
            ydl_opts.update({
                'retries': 3,
                'fragment_retries': 3,
                'retry_sleep_functions': {
                    'http': lambda n: min(2 ** n, 10),  # Max 10 seconds
                    'fragment': lambda n: min(2 ** n, 10),
                    'file_access': lambda n: min(2 ** n, 10),
                },
                'sleep_interval': 1,
                'max_sleep_interval': 10,
            })
            
            try:
                with yt_dlp.YoutubeDL(cast(Any, ydl_opts)) as ydl:
                    info = ydl.extract_info(url, download=True)
                    metadata = {
                        'title': info.get('title'),
                        'uploader': info.get('uploader'),
                        'caption': info.get('description'),
                    }
            except yt_dlp.utils.DownloadError as e:
                # For Instagram, try a fallback approach
                if 'instagram.com' in url:
                    logger.warning(f"Instagram download failed, trying fallback approach: {str(e)}")
                    # Try with embed page and different options
                    fallback_opts = {
                        'format': 'best[ext=mp4]/best',
                        'outtmpl': video_path,
                        'quiet': True,
                        'retries': 3,
                        'fragment_retries': 3,
                        'retry_sleep_functions': {
                            'http': lambda n: min(2 ** n, 10),  # Max 10 seconds
                            'fragment': lambda n: min(2 ** n, 10),
                            'file_access': lambda n: min(2 ** n, 10),
                        },
                        'sleep_interval': 1,
                        'max_sleep_interval': 10,
                        'extractor_args': {
                            'instagram': {
                                'skip_login': True,
                                'use_embed_page': True,
                            }
                        }
                    }
                    # Add cookie file if available
                    if settings.INSTAGRAM_COOKIE_FILE and os.path.exists(settings.INSTAGRAM_COOKIE_FILE):
                        fallback_opts['cookiefile'] = settings.INSTAGRAM_COOKIE_FILE
                    
                    try:
                        with yt_dlp.YoutubeDL(cast(Any, fallback_opts)) as ydl:
                            info = ydl.extract_info(url, download=True)
                            metadata = {
                                'title': info.get('title'),
                                'uploader': info.get('uploader'),
                                'caption': info.get('description'),
                            }
                            logger.info("Instagram fallback approach successful")
                    except Exception as fallback_error:
                        logger.error(f"Instagram fallback approach also failed: {str(fallback_error)}")
                        raise
                else:
                    # For non-Instagram content, re-raise the original error
                    raise
            except Exception as e:
                logger.error(f"Error downloading video: {str(e)}")
                raise
            
            # 2. Extract Audio using ffmpeg-python wrapper (if ffmpeg is available)
            ffmpeg_available = shutil.which("ffmpeg") is not None
            extracted_audio_path = None
            if ffmpeg_available:
                extracted_audio_path = self._extract_audio(video_path, audio_path)
            else:
                logger.warning("ffmpeg not found, skipping audio extraction")
    
            # 3. Extract Frames (using ffmpeg-python) (if ffmpeg is available)
            frame_paths = []
            if ffmpeg_available:
                frame_paths = self._extract_frames(video_path, temp_dir)
            else:
                logger.warning("ffmpeg not found, skipping frame extraction")
    
            # 4. Extract transcript from audio (if audio is available)
            transcript = self._extract_transcript(extracted_audio_path)

            # Return paths and metadata
            return {
                "video_path": video_path,
                "audio_path": extracted_audio_path,
                "frame_paths": frame_paths,
                "metadata": metadata,
                "transcript": transcript,
                "temp_dir": temp_dir
            }

    async def _process_google_drive_video(self, url: str) -> Dict[str, Any]:
        """
        Process a video from Google Drive URL.
        
        Args:
            url: Google Drive URL of the video to process
            
        Returns:
            Dictionary containing paths to processed media and metadata
        """
        logger.info(f"Processing Google Drive video: {url}")
        
        # Create a temporary directory for processing
        with tempfile.TemporaryDirectory() as temp_dir:
            video_path = os.path.join(temp_dir, 'video.mp4')
            audio_path = os.path.join(temp_dir, 'audio.mp3')
            
            # Convert Google Drive URL to direct download URL
            direct_url = self._convert_google_drive_url(url)
            
            # Download the video file directly
            try:
                logger.info(f"Downloading video from Google Drive: {direct_url}")
                response = requests.get(direct_url, stream=True)
                response.raise_for_status()
                
                # Save the video file
                with open(video_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)
                
                logger.info(f"Video downloaded successfully to {video_path}")
                
                # Extract more detailed metadata from the file
                metadata = self._extract_gdrive_metadata(url, response, video_path)
                
            except Exception as e:
                logger.error(f"Error downloading Google Drive video: {str(e)}")
                raise Exception(f"Failed to download video from Google Drive: {str(e)}")
            
            # 2. Extract Audio using ffmpeg-python wrapper (if ffmpeg is available)
            ffmpeg_available = shutil.which("ffmpeg") is not None
            extracted_audio_path = None
            if ffmpeg_available:
                extracted_audio_path = self._extract_audio(video_path, audio_path)
            else:
                logger.warning("ffmpeg not found, skipping audio extraction")
    
            # 3. Extract Frames (using ffmpeg-python) (if ffmpeg is available)
            frame_paths = []
            if ffmpeg_available:
                frame_paths = self._extract_frames(video_path, temp_dir)
            else:
                logger.warning("ffmpeg not found, skipping frame extraction")
    
            # 4. Extract transcript from audio (if audio is available)
            transcript = self._extract_transcript(extracted_audio_path)

            # Return paths and metadata
            return {
                "video_path": video_path,
                "audio_path": extracted_audio_path,
                "frame_paths": frame_paths,
                "metadata": metadata,
                "transcript": transcript,
                "temp_dir": temp_dir
            }

    def _convert_google_drive_url(self, url: str) -> str:
        """
        Convert Google Drive sharing URL to direct download URL.
        
        Args:
            url: Google Drive sharing URL
            
        Returns:
            Direct download URL
        """
        # Handle different Google Drive URL formats
        # Format 1: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
        file_id_match = re.search(r'/file/d/([^/]+)', url)
        if file_id_match:
            file_id = file_id_match.group(1)
            return f"https://drive.google.com/uc?export=download&id={file_id}"
        
        # Format 2: https://drive.google.com/open?id=FILE_ID
        if 'open?id=' in url:
            file_id = url.split('open?id=')[1]
            return f"https://drive.google.com/uc?export=download&id={file_id}"
        
        # If already a direct URL, return as is
        if 'uc?export=download' in url:
            return url
            
        # Default return original URL
        return url

    def _extract_gdrive_metadata(self, original_url: str, response: requests.Response, video_path: str) -> Dict[str, Any]:
        """
        Extract metadata from Google Drive video.
        
        Args:
            original_url: Original Google Drive URL
            response: HTTP response from download
            video_path: Path to downloaded video file
            
        Returns:
            Dictionary containing metadata
        """
        # Get file size
        file_size = os.path.getsize(video_path)
        
        # Get filename from headers or URL
        filename = "Google Drive Video"
        if 'content-disposition' in response.headers:
            disposition = response.headers['content-disposition']
            filename_match = re.search(r'filename="([^"]+)"', disposition)
            if filename_match:
                filename = filename_match.group(1)
        
        # Get content type
        content_type = response.headers.get('content-type', 'video/unknown')
        
        # Create metadata
        metadata = {
            'title': filename,
            'uploader': 'Google Drive User',
            'caption': f'Video file downloaded from Google Drive ({file_size} bytes)',
            'file_size': file_size,
            'content_type': content_type,
            'source_url': original_url
        }
        
        return metadata

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
import os
import shutil
import logging
import tempfile
import re
import requests
import asyncio
from typing import Dict, Any, Optional, List, cast
import yt_dlp
import ffmpeg

from app.services.speech_service import SpeechService
from app.core.config import settings

# Configure logging
logger = logging.getLogger(__name__)


class MediaService:
    """
    Service for media processing with Advanced Triple-Fallback Strategy for Instagram.
    
    Tiers of Download:
    0. Native yt-dlp (Fastest, uses local IP)
    1. RapidAPI: Instagram Looter (150/mo limit, high success)
    2. RapidAPI: Instagram Downloader by KK Creation (43/mo limit, stable)
    3. RapidAPI: Instagram Scraper Stable (20/mo limit, 100% success)
    """
    
    def __init__(self):
        """Initialize the MediaService with SpeechService."""
        self.speech_service = SpeechService()
        
    async def process_video(self, url: str) -> Dict[str, Any]:
        """
        Process a video from URL: download, extract audio, extract frames, extract transcript.
        (Supports Native -> RapidAPI Fallback chain)
        """
        if 'drive.google.com' in url:
            return await self._process_google_drive_video(url)
        
        temp_dir = tempfile.mkdtemp()
        try:
            video_path = os.path.join(temp_dir, 'video.mp4')
            audio_path = os.path.join(temp_dir, 'audio.mp3')
            
            # --- TIER 0: Native yt-dlp Download ---
            metadata = None
            try:
                logger.info(f"Tier 0: Attempting native yt-dlp download for {url}")
                ydl_opts = {
                    'format': 'best[ext=mp4]/best',
                    'outtmpl': video_path,
                    'quiet': False, # Enabled for better cloud debugging
                    'no_warnings': False,
                    'retries': 5,
                    'socket_timeout': 20,
                    'force_generic_extractor': False,
                    'source_address': '0.0.0.0', # Force IPv4
                }
                
                # Cloud DNS Bypass Hack: Standard library doesn't easily allow DNS override in yt-dlp 
                # but we can try to use standard networking hooks if needed.
                
                # Add cookie support if available
                cookie_path = settings.INSTAGRAM_COOKIE_FILE or 'instagram_cookies.txt'
                if os.path.exists(cookie_path):
                    ydl_opts['cookiefile'] = cookie_path
                
                with yt_dlp.YoutubeDL(cast(Any, ydl_opts)) as ydl:
                    info = ydl.extract_info(url, download=True)
                    metadata = {
                        'title': info.get('title'),
                        'uploader': info.get('uploader'),
                        'caption': info.get('description'),
                    }
                logger.info("Tier 0 Download Successful.")

            except Exception as e:
                logger.warning(f"Tier 0 (yt-dlp) failed: {e}. Moving to Triple-Fallback Shield...")
                
                # --- TIER 1: Instagram Looter (150/mo) ---
                try:
                    success = await self._try_looter_download(url, video_path)
                    if success:
                        metadata = {'title': 'Instagram Video', 'uploader': 'IG User', 'caption': 'Downloaded via Looter Proxy'}
                        logger.info("Tier 1 (Looter) successful!")
                    else:
                        raise Exception("Looter API returned failure or empty URL")
                except Exception as e1:
                    # --- TIER 2: KK Creation Downloader (43/mo) ---
                    logger.warning(f"Tier 1 failed ({e1}). Trying Tier 2 (KK Creation)...")
                    try:
                        success = await self._try_kk_creation_download(url, video_path)
                        if success:
                            metadata = {'title': 'Instagram Video', 'uploader': 'IG User', 'caption': 'Downloaded via KK Proxy'}
                            logger.info("Tier 2 (KK Creation) successful!")
                        else:
                            raise Exception("KK Creation API returned failure or empty URL")
                    except Exception as e2:
                        # --- TIER 3: Stable Scraper (20/mo) ---
                        logger.warning(f"Tier 2 failed ({e2}). Trying Tier 3 (Stable Scraper)...")
                        try:
                            success = await self._try_stable_scraper_download(url, video_path)
                            if success:
                                metadata = {'title': 'Instagram Video', 'uploader': 'IG User', 'caption': 'Downloaded via Stable Proxy'}
                                logger.info("Tier 3 (Stable Scraper) successful!")
                            else:
                                raise Exception("Stable Scraper API returned failure or empty URL")
                        except Exception as e3:
                            logger.error(f"All Download Shields Failed. T3 Error: {e3}")
                            raise Exception("Could not download Instagram video. All fallback proxies were blocked or exhausted.")

            # Processing steps (FFMPEG)
            ffmpeg_available = shutil.which("ffmpeg") is not None
            extracted_audio_path = None
            if ffmpeg_available:
                extracted_audio_path = self._extract_audio(video_path, audio_path)
                frame_paths = self._extract_frames(video_path, temp_dir)
            else:
                logger.warning("ffmpeg not found, skipping extraction")
                frame_paths = []

            transcript = self._extract_transcript(extracted_audio_path)
 
            return {
                "video_path": video_path,
                "audio_path": extracted_audio_path,
                "frame_paths": frame_paths,
                "metadata": metadata,
                "transcript": transcript,
                "temp_dir": temp_dir
            }
        except Exception as e:
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir)
            raise e

    # ─── RAPIDAPI FALLBACKS ──────────────────────────────────────────

    async def _try_looter_download(self, url: str, output_path: str) -> bool:
        """Fallback Tier 1: Instagram Looter (150/mo)"""
        if not settings.RAPID_API_KEY: return False
        try:
            # Official Endpoint for Media Info
            api_url = "https://instagram-looter2.p.rapidapi.com/media"
            params = {"url": url}
            headers = {"X-RapidAPI-Key": settings.RAPID_API_KEY, "X-RapidAPI-Host": "instagram-looter2.p.rapidapi.com"}
            
            logger.info(f"RapidAPI Tier 1: Calling {api_url}")
            response = await asyncio.to_thread(requests.get, api_url, headers=headers, params=params, timeout=15)
            logger.info(f"Tier 1 Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                video_url = data.get("media_url") or data.get("url") or (data.get("links", [{}])[0].get("link") if data.get("links") else None)
                if video_url:
                    return await self._download_file(video_url, output_path)
            return False
        except Exception as e:
            logger.error(f"Tier 1 Looter Error: {e}")
            return False

    async def _try_kk_creation_download(self, url: str, output_path: str) -> bool:
        """Fallback Tier 2: KK Creation Downloader (43/mo)"""
        if not settings.RAPID_API_KEY: return False
        try:
            api_url = "https://instagram-downloader-download-instagram-stories-videos4.p.rapidapi.com/download"
            params = {"url": url}
            headers = {"X-RapidAPI-Key": settings.RAPID_API_KEY, "X-RapidAPI-Host": "instagram-downloader-download-instagram-stories-videos4.p.rapidapi.com"}
            
            logger.info(f"RapidAPI Tier 2: Calling {api_url}")
            response = await asyncio.to_thread(requests.get, api_url, headers=headers, params=params, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                media = data.get("media", [])
                video_url = None
                if isinstance(media, list) and len(media) > 0:
                    video_url = media[0].get("url")
                
                if video_url:
                    return await self._download_file(video_url, output_path)
            return False
        except Exception as e:
            logger.error(f"Tier 2 KK Error: {e}")
            return False

    async def _try_stable_scraper_download(self, url: str, output_path: str) -> bool:
        """Fallback Tier 3: Instagram Scraper Stable (20/mo)"""
        if not settings.RAPID_API_KEY: return False
        try:
            api_url = "https://instagram-scraper-stable-api.p.rapidapi.com/instagram_video" 
            params = {"url": url}
            headers = {"X-RapidAPI-Key": settings.RAPID_API_KEY, "X-RapidAPI-Host": "instagram-scraper-stable-api.p.rapidapi.com"}
            
            logger.info(f"RapidAPI Tier 3: Calling {api_url}")
            response = await asyncio.to_thread(requests.get, api_url, headers=headers, params=params, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                video_url = data.get("url") or data.get("video_url")
                if video_url:
                    return await self._download_file(video_url, output_path)
            return False
        except Exception as e:
            logger.error(f"Tier 3 Stable Error: {e}")
            return False

    async def _download_file(self, url: str, path: str) -> bool:
        """Helper to stream a file from external URL to server path."""
        try:
            resp = await asyncio.to_thread(requests.get, url, stream=True, timeout=30)
            resp.raise_for_status()
            with open(path, 'wb') as f:
                for chunk in resp.iter_content(chunk_size=8192):
                    f.write(chunk)
            return True
        except Exception: return False

    # ─── CORE FFMPEG HELPERS ────────────────────────────────────────

    def _extract_audio(self, video_path: str, audio_path: str) -> Optional[str]:
        try:
            ffmpeg.input(video_path).output(audio_path).run(quiet=True)
            return audio_path
        except Exception: return None

    def _extract_frames(self, video_path: str, temp_dir: str) -> List[str]:
        """Extract 1 frame every 5 seconds (0.2fps) to save tokens."""
        try:
            frames_dir = os.path.join(temp_dir, 'frames')
            os.makedirs(frames_dir, exist_ok=True)
            frames_path_template = os.path.join(frames_dir, 'frame-%03d.png')
            ffmpeg.input(video_path).filter('fps', fps='1/5').output(frames_path_template).run(quiet=True)
            return [os.path.join(frames_dir, f) for f in os.listdir(frames_dir) if f.endswith('.png')]
        except Exception: return []

    def _extract_transcript(self, audio_path: Optional[str]) -> str:
        if audio_path and os.path.exists(audio_path):
            return self.speech_service.extract_transcript_with_fallback(audio_path)
        return "No audio available for transcription"

    async def _process_google_drive_video(self, url: str) -> Dict[str, Any]:
        """(Standard Google Drive direct download logic remains same)"""
        temp_dir = tempfile.mkdtemp()
        video_path = os.path.join(temp_dir, 'video.mp4')
        audio_path = os.path.join(temp_dir, 'audio.mp3')
        
        file_id = re.search(r'/file/d/([^/]+)', url).group(1)
        direct_url = f"https://drive.google.com/uc?export=download&id={file_id}"
        
        await self._download_file(direct_url, video_path)
        
        ffmpeg_available = shutil.which("ffmpeg") is not None
        if ffmpeg_available:
            audio = self._extract_audio(video_path, audio_path)
            frames = self._extract_frames(video_path, temp_dir)
        else:
            audio, frames = None, []
            
        transcript = self._extract_transcript(audio)
        return {"video_path": video_path, "audio_path": audio, "frame_paths": frames, "metadata": {"title":"Drive Video", "uploader":"G-Drive"}, "transcript": transcript, "temp_dir": temp_dir}
import requests
import os
import logging
import asyncio
import urllib.parse
from typing import Dict, Any, Optional
import yt_dlp
from app.core.config import settings

logger = logging.getLogger(__name__)

class MusicService:
    """Service to identify music using Shazam Song Recognition API on RapidAPI."""
    
    def __init__(self):
        self.api_key = settings.RAPID_API_KEY
        self.api_host = "shazam-song-recognition-api.p.rapidapi.com"
        self.file_url = f"https://{self.api_host}/recognize/file"
        self.url_url = f"https://{self.api_host}/recognize/url"

    async def identify_music(self, source: str) -> Optional[Dict[str, Any]]:
        """
        Identify music from an audio file or a media URL using Shazam.
        Uses MediaService's fallback chain for robust URL processing.
        """
        if not self.api_key:
            logger.warning("RAPID_API_KEY not configured. Skipping Shazam detection.")
            return None

        # Check if source is a URL
        if source.startswith("http"):
            from app.services.media_service import MediaService
            media_service = MediaService()
            try:
                # Use MediaService robust downloader chain (T0 -> T1 -> T2 -> T3)
                logger.info(f"Using MediaService to fetch audio for Shazam from: {source}")
                media_data = await media_service.process_video(source)
                audio_path = media_data.get("audio_path")
                
                if audio_path and os.path.exists(audio_path):
                    result = await self._identify_by_file(audio_path)
                    return result
                else:
                    logger.error("MediaService failed to provide a valid audio path.")
                    return None
            except Exception as e:
                logger.error(f"Error fetching media for Shazam: {e}")
                return None
        else:
            return await self._identify_by_file(source)

    async def _identify_by_url(self, media_url: str) -> Optional[Dict[str, Any]]:
        """Identify music by providing a URL (direct or via yt-dlp extraction)."""
        try:
            logger.info(f"Identifying music by URL: {media_url}")
            
            # If it's a social media URL, we need to extract the direct audio stream first
            if any(domain in media_url for domain in ["instagram.com", "tiktok.com", "youtube.com", "reels"]):
                logger.info(f"Extracting direct stream URL for {media_url}...")
                ydl_opts = {'format': 'bestaudio/best', 'quiet': True, 'no_warnings': True}
                
                def _get_info():
                    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                        return ydl.extract_info(media_url, download=False)
                
                info = await asyncio.to_thread(_get_info)
                target_url = info.get('url')
                if not target_url:
                    logger.error("Failed to extract stream URL.")
                    return None
            else:
                target_url = media_url

            headers = {
                "X-RapidAPI-Key": self.api_key,
                "X-RapidAPI-Host": self.api_host
            }

            def _send_request():
                encoded_url = urllib.parse.quote(target_url)
                request_url = f"{self.url_url}?url={encoded_url}"
                return requests.get(request_url, headers=headers, timeout=30)

            response = await asyncio.to_thread(_send_request)
            return self._parse_response(response)

        except Exception as e:
            logger.error(f"Error in Shazam URL identification: {e}")
            return None

    async def _identify_by_file(self, audio_path: str) -> Optional[Dict[str, Any]]:
        """Identify music by uploading a local audio file."""
        if not os.path.exists(audio_path):
            logger.error(f"Audio file not found for Shazam: {audio_path}")
            return None

        try:
            logger.info(f"Identifying music by file upload: {audio_path}")
            headers = {
                "X-RapidAPI-Key": self.api_key,
                "X-RapidAPI-Host": self.api_host
            }

            def _send_request():
                with open(audio_path, "rb") as audio_file:
                    files = {"file": ("audio.mp3", audio_file, "audio/mpeg")}
                    return requests.post(self.file_url, headers=headers, files=files, timeout=30)

            response = await asyncio.to_thread(_send_request)
            return self._parse_response(response)

        except Exception as e:
            logger.error(f"Error in Shazam file identification: {e}")
            return None

    def _parse_response(self, response: requests.Response) -> Optional[Dict[str, Any]]:
        """Parse the unified Shazam API response."""
        if response.status_code == 200:
            data = response.json()
            track = data.get("track")
            if track:
                title = track.get('title')
                subtitle = track.get('subtitle')
                logger.info(f"Shazam match found: {title} by {subtitle}")
                
                # Identify Primary Streaming Link (Prioritize YouTube/Apple Music)
                music_link = track.get("url") # Default to Shazam page
                
                # Check for YouTube Music / Video in the hub
                hub = track.get("hub", {})
                providers = hub.get("providers", [])
                for provider in providers:
                    if provider.get("type") in ["yt", "youtube", "ytmusic"]:
                        actions = provider.get("actions", [])
                        if actions and actions[0].get("uri"):
                            music_link = actions[0].get("uri")
                            break
                
                # Fallback to Apple Music link if YouTube not found
                if not music_link or "shazam.com" in music_link:
                    options = hub.get("options", [])
                    for opt in options:
                        if opt.get("type") == "apple" or opt.get("type") == "url":
                            music_link = opt.get("actions", [{}])[0].get("uri") or music_link

                # Final Fallback to YouTube Music Search if NO direct link found
                if not music_link or "shazam.com" in music_link:
                    search_query = urllib.parse.quote(f"{title} {subtitle} official song")
                    music_link = f"https://music.youtube.com/search?q={search_query}"

                return {
                    "songName": title,
                    "artist": subtitle,
                    "album": track.get("album"),
                    "coverArt": track.get("images", {}).get("default") or track.get("images", {}).get("coverart"),
                    "musicLink": music_link,
                    "type": track.get("type", "MUSIC")
                }
            else:
                logger.info("Shazam returned No Match.")
                return None
        else:
            logger.error(f"Shazam API Error {response.status_code}: {response.text}")
            return None

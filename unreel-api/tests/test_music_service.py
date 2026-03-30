import asyncio
import os
import sys
import logging

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.media_service import MediaService
from app.services.music_service import MusicService

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def test_shazam_integration():
    reel_url = "https://www.instagram.com/reel/DWc3Ur1kbln/"
    
    music_service = MusicService()
    
    print(f"\n--- TESTING SHAZAM INTEGRATION FOR REEL: {reel_url} ---")
    
    try:
        # Step 1: Run Shazam Identification (By URL)
        print(f"1. Running Shazam identification for URL: {reel_url}...")
        
        # Test stream extraction manually here too
        import yt_dlp
        ydl_opts = {'format': 'bestaudio', 'quiet': True}
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(reel_url, download=False)
            stream_url = info['url']
            print(f"   Extracted stream URL: {stream_url[:100]}...")
            
        shazam_result = await music_service.identify_music(reel_url)
        
        if shazam_result:
            print("\n✅ SHAZAM MATCH FOUND (via URL):")
            print(f"   - Song: {shazam_result.get('songName')}")
        else:
            print("\n❌ SHAZAM: No Match Found via URL.")
            
    except Exception as e:
        print(f"\n❌ TEST ERROR: {str(e)}")


    finally:
        # Cleanup
        if 'paths' in locals() and 'temp_dir' in paths:
            import shutil
            # shutil.rmtree(paths['temp_dir'], ignore_errors=True)
            print(f"\nNote: Temp files kept at {paths['temp_dir']} for inspection.")

if __name__ == "__main__":
    asyncio.run(test_shazam_integration())

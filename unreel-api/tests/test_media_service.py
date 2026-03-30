import asyncio
import sys
import os

# Add the root directory to path to import app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.media_service import MediaService

async def test_media_service_tiered_download():
    """Test the media service with both YouTube and Instagram URLs with Fallback Chain"""
    media_service = MediaService()
    
    # Using an Instagram Reel URL to test the RapidAPI Fallback chain
    ig_test_url = "https://www.instagram.com/reel/DQmoVSeCWl8/" 
    
    try:
        print(f"=== Testing Tiered Media Processing: {ig_test_url} ===")
        print(f"Expect: Primary (Native) -> Fallback 1 (Looter) -> Fallback 2 (KK)...")
        
        # Test tiered download
        result = await media_service.process_video(ig_test_url)
        print("Media processing completed successfully!")
        print(f"Result keys: {result.keys()}")
        print(f"Metadata Source: {result.get('metadata')}")
        
        # Verify frame extraction (New FPS rule)
        frame_paths = result.get('frame_paths', [])
        print(f"Number of frames extracted (0.2 FPS): {len(frame_paths)}")
        
        if len(frame_paths) > 0:
            print(f"Frame 0 exists: {os.path.exists(frame_paths[0])} at {frame_paths[0]}")
        
        return result
        
    except Exception as e:
        print(f"Error processing video: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    asyncio.run(test_media_service_tiered_download())
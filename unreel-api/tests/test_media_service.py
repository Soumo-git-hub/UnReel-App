import asyncio
import sys
import os

# Add the unreel-api directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'unreel-api'))

from app.services.media_service import MediaService

async def test_media_service():
    """Test the media service with a YouTube Shorts URL"""
    media_service = MediaService()
    
    # Using a different YouTube video that might work better for testing
    test_url = "https://www.youtube.com/watch?v=jNQXAC9IVRw"  # First YouTube video
    
    try:
        print(f"Processing video: {test_url}")
        result = await media_service.process_video(test_url)
        print("Video processing completed successfully!")
        print(f"Result keys: {result.keys()}")
        print(f"Temp directory: {result.get('temp_dir')}")
        frame_paths = result.get('frame_paths', [])
        print(f"Number of frames extracted: {len(frame_paths)}")
        for i, p in enumerate(frame_paths[:5]):
            print(f"Frame {i} exists: {os.path.exists(p)} at {p}")
        return result
    except Exception as e:
        print(f"Error processing video: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    asyncio.run(test_media_service())
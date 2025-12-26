import asyncio
import sys
import os

# Add the unreel-api directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.services.analysis_service import AnalysisService
from app.services.media_service import MediaService
from app.services.ai_service import AiService

async def test_full_analysis():
    """Test the full analysis workflow"""
    print("Testing full analysis workflow...")
    
    # Create service instances
    media_service = MediaService()
    ai_service = AiService()
    analysis_service = AnalysisService()
    
    # Test URL
    test_url = "https://www.youtube.com/watch?v=jNQXAC9IVRw"  # First YouTube video
    
    try:
        print(f"Processing video: {test_url}")
        
        # Test media service
        media_data = await media_service.process_video(test_url)
        print("Media processing completed!")
        print(f"Media data keys: {media_data.keys()}")
        print(f"Audio path: {media_data['audio_path']}")
        print(f"Frame paths: {media_data['frame_paths']}")
        print(f"Metadata: {media_data['metadata']}")
        
        # Test AI service with the media data
        audio_path = media_data["audio_path"]
        frame_paths = media_data["frame_paths"]
        metadata = media_data["metadata"]
        caption = metadata.get("caption", "")
        transcript = media_data.get("transcript", "")  # Added missing transcript parameter
        
        print("\nTesting AI analysis...")
        ai_result = await ai_service.get_analysis(audio_path, frame_paths, caption, transcript, metadata)  # Added transcript parameter
        print("AI analysis completed!")
        print(f"AI result: {ai_result}")
        
    except Exception as e:
        print(f"Error in full analysis: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_full_analysis())
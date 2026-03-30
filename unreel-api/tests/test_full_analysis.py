import asyncio
import sys
import os

# Add the root directory to path to import app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.analysis_service import AnalysisService
from app.services.media_service import MediaService
from app.services.ai_service import AiService

async def test_full_analysis_with_all_lenses():
    """Test the complete multi-lens analysis workflow"""
    print("=== Testing FULL Multi-Lens Analysis Workflow ===")
    
    # Create service instances
    media_service = MediaService()
    ai_service = AiService()
    
    # Test URL: The first YouTube video (Me at the zoo)
    test_url = "https://www.youtube.com/watch?v=jNQXAC9IVRw"
    
    # AUTHENTIC CAPTION (No injected test data)
    original_caption = "The first video on YouTube. Maybe it's time to go back to the zoo?"
    
    try:
        print(f"STEP 1: Processing video (Native -> Fallback chain): {test_url}")
        
        # Test media service (Tiered download)
        media_data = await media_service.process_video(test_url)
        print("Media processing completed!")
        print(f"Metadata: {media_data['metadata']}")
        print(f"Frame Count: {len(media_data['frame_paths'])}")
        
        # Test AI service with all lenses enabled
        print("\nSTEP 2: Testing AI analysis with Educational & Shopping Lenses...")
        
        audio_path = media_data["audio_path"]
        frame_paths = media_data["frame_paths"]
        metadata = media_data["metadata"]
        caption = original_caption
        transcript = media_data.get("transcript", "")
        
        # Note the extra lens toggles at the end
        ai_result = await ai_service.get_analysis(
            audio_path, frame_paths, caption, transcript, metadata,
            focus_educational=True,
            focus_shopping=True,
            focus_location=True,
            focus_fact_check=True,
            focus_resource=True,
            focus_music=True
        )
        
        print("AI analysis completed!")
        print(f"Summary: {ai_result.get('summary')}")
        print(f"Music Detection: {ai_result.get('musicContext')}")
        print(f"Educational Insights: {ai_result.get('educationalInsights', 'None')}")
        print(f"Shopping Items: {len(ai_result.get('shoppingItems', []))} found")
        print(f"Fact-Check: {len(ai_result.get('factCheck', []))} claims extracted")
        print(f"Available Features: {ai_result.get('availableFeatures')}")
        
        return ai_result
        
    except Exception as e:
        print(f"Error in full analysis: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    asyncio.run(test_full_analysis_with_all_lenses())
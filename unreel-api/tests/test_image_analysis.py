import asyncio
import os
import sys
import tempfile
import shutil
import google.generativeai as genai

# Add project root to sys.path
sys.path.append(os.getcwd())

from app.services.media_service import MediaService
from app.services.ai_service import AiService
from app.core.config import settings

# Configure Gemini for this test
genai.configure(api_key=settings.GEMINI_API_KEY)

async def test_image_analysis():
    """
    Standalone script to test image extraction and Gemini analysis.
    """
    print("=" * 60)
    print("Standalone Image Analysis Test")
    print("=" * 60)
    
    media_service = MediaService()
    ai_service = AiService()
    
    # Using an Instagram Reel URL for testing
    video_url = "https://www.instagram.com/reel/DQmoVSeCWl8/"  
    
    print(f"1. Processing video for frames: {video_url}")
    
    try:
        # Step 1: Process video
        media_data = await media_service.process_video(video_url)
        
        temp_dir = media_data.get("temp_dir")
        frame_paths = media_data.get("frame_paths", [])
        
        print(f"   - Temp directory: {temp_dir}")
        print(f"   - Number of frames extracted: {len(frame_paths)}")
        
        if not frame_paths:
            print("   - Error: No frames were extracted!")
            return
            
        # Step 2: Verify frames exist
        print(f"2. Verifying frames on disk:")
        for i, p in enumerate(frame_paths[:3]):
            exists = os.path.exists(p)
            print(f"   - Frame {i} exists: {exists} at {p}")
            if not exists:
                print("   - Error: Frame file missing!")
                return
        
        # Step 3: Run Gemini Analysis SPECIFICALLY for images
        print("3. Sending frames to Gemini for visual analysis...")
        
        # We'll use a custom prompt for this test to prove it sees the images
        contents = [
            "Analyze these images. What's the main subject?"
        ]
        
        # Upload frames to Gemini
        gemini_files = []
        for p in frame_paths[:5]:
            print(f"   - Uploading {os.path.basename(p)} to Gemini...")
            f = await asyncio.to_thread(genai.upload_file, path=p)
            gemini_files.append(f)
            
        contents.extend(gemini_files)
        
        # Generate response
        print("4. Generating AI response...")
        response = await ai_service.model.generate_content_async(contents)
        
        print("\n" + "=" * 60)
        print("AI VISUAL ANALYSIS RESULT:")
        print("=" * 60)
        print(response.text)
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error during test: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        # Step 4: Cleanup
        if 'media_data' in locals() and media_data and 'temp_dir' in media_data:
            temp_dir = media_data["temp_dir"]
            if os.path.exists(temp_dir):
                print(f"5. Cleaning up {temp_dir}...")
                shutil.rmtree(temp_dir)
                print("   - Done.")

if __name__ == "__main__":
    asyncio.run(test_image_analysis())

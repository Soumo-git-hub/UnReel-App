import sys
import os

# Add the unreel-api directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'unreel-api'))

from app.services.speech_service import SpeechService

def test_speech_service():
    """Test the speech service"""
    print("Testing speech service...")
    
    # Create service instance
    speech_service = SpeechService()
    
    print(f"Speech service available: {speech_service.available}")
    
    if speech_service.available:
        print("Speech service is properly configured!")
    else:
        print("Speech service is not available (missing credentials)")
        print("To enable speech-to-text, set GOOGLE_APPLICATION_CREDENTIALS environment variable")
        print("pointing to your Google Cloud service account key file")

if __name__ == "__main__":
    test_speech_service()
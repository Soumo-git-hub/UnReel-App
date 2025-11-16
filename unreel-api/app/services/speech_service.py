import os
import logging
from typing import Optional
import whisper
import warnings

# Configure logging
logger = logging.getLogger(__name__)


class SpeechService:
    """Service for speech-to-text transcription using OpenAI Whisper."""
    
    def __init__(self):
        """
        Initialize the SpeechService with OpenAI Whisper.
        """
        try:
            # Suppress warnings from Whisper
            warnings.filterwarnings("ignore")
            
            # Initialize the Whisper model
            # Using 'base' model for balance of speed and accuracy
            # Options: 'tiny', 'base', 'small', 'medium', 'large'
            self.model = whisper.load_model("base")
            self.available = True
            logger.info("Whisper speech service initialized successfully")
        except Exception as e:
            logger.error(f"Speech service not available: {str(e)}")
            self.available = False
            self.model = None

    def extract_transcript(self, audio_file_path: str) -> Optional[str]:
        """
        Extract transcript from an audio file using OpenAI Whisper.
        
        Args:
            audio_file_path: Path to the audio file
            
        Returns:
            Transcript text or None if transcription fails
        """
        if not self.available or not self.model:
            logger.warning("Speech service not available, returning placeholder")
            return None
            
        if not os.path.exists(audio_file_path):
            logger.warning(f"Audio file not found: {audio_file_path}")
            return None
            
        try:
            # Transcribe the audio file
            result = self.model.transcribe(audio_file_path)
            # Ensure we always return a string
            return str(result["text"])
            
        except Exception as e:
            logger.error(f"Error in speech transcription: {str(e)}", exc_info=True)
            return None

    def extract_transcript_with_fallback(self, audio_file_path: str) -> str:
        """
        Extract transcript with fallback to placeholder if service is not available.
        
        Args:
            audio_file_path: Path to the audio file
            
        Returns:
            Transcript text or placeholder
        """
        transcript = self.extract_transcript(audio_file_path)
        if transcript is None:
            return "Full transcript would be extracted from audio in a real implementation with Whisper model"
        return transcript
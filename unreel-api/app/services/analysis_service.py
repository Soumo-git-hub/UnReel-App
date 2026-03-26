import logging
import os
import shutil
from typing import Dict, Any

from sqlalchemy.orm import Session

from app.services.media_service import MediaService
from app.services.ai_service import AiService
from app.services.translation_service import TranslationService
from app.models import Analysis, ChatMessage

# Configure logging
logger = logging.getLogger(__name__)

# Global service instances (Singleton pattern)
_media_service = None
_ai_service = None
_translation_service = None

class AnalysisService:
    """Service for orchestrating video analysis workflow."""
    
    def __init__(self):
        """Initialize the AnalysisService with required services (cached)."""
        global _media_service, _ai_service, _translation_service
        
        if _media_service is None:
            _media_service = MediaService()
        if _ai_service is None:
            _ai_service = AiService()
        if _translation_service is None:
            _translation_service = TranslationService()
            
        self.media_service = _media_service
        self.ai_service = _ai_service
        self.translation_service = _translation_service

    async def create_analysis(self, db: Session, url: str, user_id: str = None) -> Dict[str, Any]:
        """
        Create a new video analysis.
        
        Args:
            db: Database session
            url: URL of the video to analyze
            user_id: ID of the user requesting analysis
            
        Returns:
            Dictionary containing analysis results
            
        Raises:
            Exception: If analysis fails
        """
        # Create initial analysis record
        analysis = Analysis(
            originalUrl=url,
            userId=user_id,
            status="processing"
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        
        media_data = None
        try:
            # Process video using media service
            media_data = await self.media_service.process_video(url)
            
            # Extract data from media processing
            audio_path = media_data["audio_path"]
            frame_paths = media_data["frame_paths"]
            metadata = media_data["metadata"]
            caption = metadata.get("caption", "")
            transcript = media_data.get("transcript", "Full transcript would be extracted from audio in a real implementation")
            
            logger.info("Media processing completed successfully")
            logger.debug(f"Audio path: {audio_path}")
            logger.debug(f"Frame paths: {frame_paths}")
            logger.debug(f"Metadata: {metadata}")
            
            # Detect language of the transcript
            detected_language = self.translation_service.detect_language(transcript)
            logger.info(f"Detected transcript language: {detected_language}")
            
            # Analyze content with AI
            ai_result = await self.ai_service.get_analysis(
                audio_path, 
                frame_paths, 
                caption, 
                transcript,
                metadata,
                detected_language
            )
            
            # Update analysis with results
            analysis.status = "completed"
            analysis.title = metadata.get("title")
            analysis.uploader = metadata.get("uploader")
            analysis.caption = caption
            analysis.summary = ai_result["summary"]
            analysis.translation = ai_result["translation"]
            analysis.keyTopics = ai_result["keyTopics"]
            analysis.mentionedResources = ai_result["mentionedResources"]
            analysis.fullTranscript = transcript  # Use the actual transcript
            analysis.detectedLanguage = detected_language  # Store detected language
            
            db.commit()
            db.refresh(analysis)
            
            # Save initial summary as first chat message
            chat_message = ChatMessage(
                analysisId=analysis.id,
                message="Initial analysis summary",
                reply=ai_result["summary"]
            )
            db.add(chat_message)
            db.commit()
            
            # Return the response in the exact format specified
            return {
                "analysisId": analysis.id,
                "originalUrl": analysis.originalUrl,
                "status": analysis.status,
                "metadata": {
                    "title": analysis.title,
                    "uploader": analysis.uploader,
                    "caption": analysis.caption
                },
                "content": {
                    "summary": analysis.summary,
                    "translation": analysis.translation,
                    "keyTopics": analysis.keyTopics,
                    "mentionedResources": analysis.mentionedResources
                },
                "fullTranscript": analysis.fullTranscript,
                "detectedLanguage": analysis.detectedLanguage,
                "supportedLanguages": self.translation_service.get_supported_languages(),
                "createdAt": analysis.createdAt
            }
            
        except Exception as e:
            # Update analysis status to failed
            analysis.status = "failed"
            db.commit()
            
            logger.error(f"Analysis failed: {str(e)}", exc_info=True)
            # Re-raise the exception
            raise
        finally:
            # Clean up temporary directory if it exists
            if media_data and "temp_dir" in media_data:
                temp_dir = media_data["temp_dir"]
                if os.path.exists(temp_dir):
                    try:
                        shutil.rmtree(temp_dir)
                        logger.info(f"Cleaned up temporary directory: {temp_dir}")
                    except Exception as cleanup_error:
                        logger.error(f"Error cleaning up temporary directory {temp_dir}: {str(cleanup_error)}")
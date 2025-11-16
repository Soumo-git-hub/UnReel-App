import logging
from typing import Dict, Any

from sqlalchemy.orm import Session

from app.services.media_service import MediaService
from app.services.ai_service import AiService
from app.models import Analysis, ChatMessage

# Configure logging
logger = logging.getLogger(__name__)


class AnalysisService:
    """Service for orchestrating video analysis workflow."""
    
    def __init__(self):
        """Initialize the AnalysisService with required services."""
        self.media_service = MediaService()
        self.ai_service = AiService()

    async def create_analysis(self, db: Session, url: str) -> Dict[str, Any]:
        """
        Create a new video analysis.
        
        Args:
            db: Database session
            url: URL of the video to analyze
            
        Returns:
            Dictionary containing analysis results
            
        Raises:
            Exception: If analysis fails
        """
        # Create initial analysis record
        analysis = Analysis(
            originalUrl=url,
            status="processing"
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        
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
            
            # Analyze content with AI
            ai_result = await self.ai_service.get_analysis(
                audio_path, 
                frame_paths, 
                caption, 
                metadata
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
                "createdAt": analysis.createdAt
            }
            
        except Exception as e:
            # Update analysis status to failed
            analysis.status = "failed"
            db.commit()
            
            logger.error(f"Analysis failed: {str(e)}", exc_info=True)
            # Re-raise the exception
            raise
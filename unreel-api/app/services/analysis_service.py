import logging
import os
import shutil
import asyncio
from typing import Dict, Any

from sqlalchemy.orm import Session

from app.services.media_service import MediaService
from app.services.ai_service import AiService
from app.services.translation_service import TranslationService
from app.services.search_service import SearchService
from app.models import Analysis, ChatMessage

# Configure logging
logger = logging.getLogger(__name__)

# Global service instances (Singleton pattern)
_media_service = None
_ai_service = None
_translation_service = None
_search_service = None

class AnalysisService:
    """Service for orchestrating video analysis workflow."""
    
    def __init__(self):
        """Initialize the AnalysisService with required services (cached)."""
        global _media_service, _ai_service, _translation_service, _search_service
        
        if _media_service is None:
            _media_service = MediaService()
        if _ai_service is None:
            _ai_service = AiService()
        if _translation_service is None:
            _translation_service = TranslationService()
        if _search_service is None:
            _search_service = SearchService()
            
        self.media_service = _media_service
        self.ai_service = _ai_service
        self.translation_service = _translation_service
        self.search_service = _search_service

    async def create_analysis(self, db: Session, url: str, user_id: str = None,
                              focus_location: bool = True,
                              focus_educational: bool = False,
                              focus_shopping: bool = False,
                              focus_fact_check: bool = False,
                              focus_resource: bool = False,
                              focus_music: bool = False) -> Dict[str, Any]:
        """
        Create a new video analysis with Multi-Lens support.
        
        Args:
            db: Database session
            url: URL of the video to analyze
            user_id: ID of the user requesting analysis
            focus_location: Enable Location Lens
            focus_educational: Enable Educational Lens
            focus_shopping: Enable Shopping Lens
            focus_fact_check: Enable Fact-Check Lens
            focus_resource: Enable Link-Detective Lens
            
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
            
            # Analyze content with AI (pass lens toggles)
            ai_result = await self.ai_service.get_analysis(
                audio_path, 
                frame_paths, 
                caption, 
                transcript,
                metadata,
                detected_language,
                focus_location=focus_location,
                focus_educational=focus_educational,
                focus_shopping=focus_shopping,
                focus_fact_check=focus_fact_check,
                focus_resource=focus_resource,
                focus_music=focus_music
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
            analysis.locationContext = ai_result.get("locationContext")
            analysis.educationalInsights = ai_result.get("educationalInsights")
            analysis.shoppingItems = ai_result.get("shoppingItems")
            analysis.factCheck = ai_result.get("factCheck")
            analysis.enhancedResources = ai_result.get("enhancedResources")
            analysis.musicContext = ai_result.get("musicContext")
            analysis.availableFeatures = ai_result.get("availableFeatures")
            analysis.fullTranscript = transcript
            analysis.detectedLanguage = detected_language
            
            # ─── RAG ENRICHMENT PASS (CONCURRENT) ──────────────────────
            # Run all RAG passes in parallel for maximum throughput
            logger.info("Starting RAG enrichment pass...")
            
            rag_tasks = {}
            
            if focus_fact_check and analysis.factCheck:
                logger.info(f"RAG: Verifying {len(analysis.factCheck)} claims with Google Search...")
                rag_tasks["factCheck"] = self.search_service.verify_claims(analysis.factCheck)
            
            if focus_resource and analysis.enhancedResources:
                logger.info(f"RAG: Finding URLs for {len(analysis.enhancedResources)} resources...")
                rag_tasks["resources"] = self.search_service.find_resource_urls(analysis.enhancedResources)
            
            if focus_shopping and analysis.shoppingItems:
                logger.info(f"RAG: Finding purchase links for {len(analysis.shoppingItems)} items...")
                rag_tasks["shopping"] = self.search_service.find_product_urls(analysis.shoppingItems)
            
            if rag_tasks:
                keys = list(rag_tasks.keys())
                results = await asyncio.gather(*rag_tasks.values(), return_exceptions=True)
                rag_results = dict(zip(keys, results))
                
                # Apply fact-check results (needs a second AI refinement pass)
                if "factCheck" in rag_results and not isinstance(rag_results["factCheck"], Exception):
                    refined_claims = await self.ai_service.refine_with_evidence(rag_results["factCheck"])
                    analysis.factCheck = refined_claims
                    logger.info("RAG: Fact-check claims refined with live evidence.")
                
                if "resources" in rag_results and not isinstance(rag_results["resources"], Exception):
                    analysis.enhancedResources = rag_results["resources"]
                    logger.info("RAG: Resource URLs resolved.")
                
                if "shopping" in rag_results and not isinstance(rag_results["shopping"], Exception):
                    analysis.shoppingItems = rag_results["shopping"]
                    logger.info("RAG: Shopping URLs resolved.")
            
            
            # ─── END RAG ENRICHMENT ─────────────────────────────────────
            
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
                    "mentionedResources": analysis.mentionedResources,
                    "locationContext": analysis.locationContext,
                    "educationalInsights": analysis.educationalInsights,
                    "shoppingItems": analysis.shoppingItems,
                    "factCheck": analysis.factCheck,
                    "enhancedResources": analysis.enhancedResources,
                    "musicContext": analysis.musicContext,
                },
                "availableFeatures": analysis.availableFeatures,
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
import logging
from typing import Any, Dict
import yt_dlp

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import schemas
from app.services.analysis_service import AnalysisService
from app.services.translation_service import TranslationService
from app.database import get_db

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/analyze", tags=["analysis"])


@router.post("/", response_model=schemas.AnalysisResponse)
async def create_analysis(
    request: schemas.AnalysisRequest,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Create a new video analysis.
    
    Args:
        request: Analysis request containing the video URL
        db: Database session
        
    Returns:
        Analysis response with results
        
    Raises:
        HTTPException: If analysis fails
    """
    try:
        logger.info(f"Starting analysis for URL: {request.url}")
        
        # Create analysis service
        analysis_service = AnalysisService()
        
        # Process the analysis
        analysis = await analysis_service.create_analysis(db=db, url=request.url)
        
        logger.info(f"Analysis completed successfully for URL: {request.url}")
        return analysis
        
    except yt_dlp.utils.DownloadError as e:
        error_msg = str(e)
        # Handle specific Instagram errors
        if "inappropriate" in error_msg.lower() or "unavailable for certain audiences" in error_msg.lower():
            logger.warning(f"Content unavailable for URL {request.url}: {error_msg}")
            raise HTTPException(
                status_code=400, 
                detail="This video content is unavailable or restricted. It may be inappropriate or unavailable for certain audiences. Please try a different video."
            )
        elif "login required" in error_msg.lower() or "rate-limit" in error_msg.lower():
            logger.warning(f"Instagram login required or rate-limited for URL {request.url}: {error_msg}")
            raise HTTPException(
                status_code=400, 
                detail="Instagram content requires login or is rate-limited. Please try again later or use a different video platform."
            )
        else:
            logger.error(f"Download error for URL {request.url}: {error_msg}")
            raise HTTPException(
                status_code=400, 
                detail="Unable to download the video. Please check the URL and try again."
            )
    except Exception as e:
        error_msg = f"Analysis failed: {str(e)}"
        logger.error(error_msg, exc_info=True)
        raise HTTPException(status_code=500, detail="An unexpected error occurred. Please try again later.")


@router.post("/{analysis_id}/translate")
async def translate_transcript(
    analysis_id: str,
    request: schemas.TranslationRequest,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Translate the transcript of an analysis to a target language.
    
    Args:
        analysis_id: ID of the analysis
        request: Translation request containing target language
        db: Database session
        
    Returns:
        Translation response with translated text
        
    Raises:
        HTTPException: If translation fails
    """
    try:
        logger.info(f"Translating transcript for analysis {analysis_id} to {request.target_language}")
        
        # Get the analysis from database
        from app.models import Analysis
        analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
        
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
            
        if not analysis.fullTranscript:
            raise HTTPException(status_code=400, detail="No transcript available for translation")
        
        # Create translation service
        translation_service = TranslationService()
        
        # Check if target language is supported
        supported_languages = translation_service.get_supported_languages()
        if request.target_language not in supported_languages:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported language. Supported languages are: {', '.join(supported_languages.keys())}"
            )
        
        # Translate the transcript
        translated_text = translation_service.translate_text(
            analysis.fullTranscript, 
            request.target_language
        )
        
        if not translated_text:
            raise HTTPException(status_code=500, detail="Translation failed")
        
        logger.info(f"Transcript translation completed successfully for analysis {analysis_id}")
        
        return {
            "analysisId": analysis_id,
            "originalText": analysis.fullTranscript,
            "translatedText": translated_text,
            "sourceLanguage": analysis.detectedLanguage,
            "targetLanguage": request.target_language,
            "supportedLanguages": supported_languages,
            "translationType": "transcript",  # Indicates this is a transcript translation, not summary
            "summary": analysis.summary  # Include the original English summary for reference
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        error_msg = f"Transcript translation failed: {str(e)}"
        logger.error(error_msg, exc_info=True)
        raise HTTPException(status_code=500, detail="An unexpected error occurred during transcript translation. Please try again later.")

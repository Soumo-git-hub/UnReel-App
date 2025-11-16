import json
import logging
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import schemas
from app.services.ai_service import AiService
from app.models import Analysis
from app.database import get_db

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/chat", tags=["chat"])


@router.post("/", response_model=schemas.ChatResponse)
async def chat_with_video(
    request: schemas.ChatRequest,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Chat with the AI about a previously analyzed video.
    
    Args:
        request: Chat request containing analysis ID and message
        db: Database session
        
    Returns:
        Chat response with AI reply
        
    Raises:
        HTTPException: If chat fails or analysis not found
    """
    try:
        logger.info(f"Chat request for analysis ID: {request.analysisId}")
        
        # Get the analysis record
        analysis = db.query(Analysis).filter(Analysis.id == request.analysisId).first()
        if not analysis:
            error_msg = "Analysis not found"
            logger.warning(error_msg)
            raise HTTPException(status_code=404, detail=error_msg)
        
        # Prepare context from analysis
        context = _prepare_analysis_context(analysis)
        
        # Create AI service
        ai_service = AiService()
        
        # Get AI response
        reply = await ai_service.chat_with_video(context, request.message)
        
        logger.info(f"Chat response generated successfully for analysis ID: {request.analysisId}")
        return {"reply": reply}
        
    except Exception as e:
        error_msg = f"Chat failed: {str(e)}"
        logger.error(error_msg, exc_info=True)
        raise HTTPException(status_code=500, detail=error_msg)


def _prepare_analysis_context(analysis: Analysis) -> str:
    """
    Prepare context string from analysis data.
    
    Args:
        analysis: Analysis model instance
        
    Returns:
        Formatted context string
    """
    # Safely access attributes
    summary = getattr(analysis, 'summary', None) or 'None'
    
    # Handle JSON columns
    key_topics = getattr(analysis, 'keyTopics', None) or []
    mentioned_resources = getattr(analysis, 'mentionedResources', None) or []
    
    # Convert key topics to strings
    try:
        if isinstance(key_topics, list) and key_topics:
            topics_str = ', '.join(str(topic) for topic in key_topics)
        else:
            topics_str = 'None'
    except Exception as e:
        logger.warning(f"Error converting key topics to string: {e}")
        topics_str = str(key_topics) if key_topics else 'None'
        
    # Convert mentioned resources to strings
    try:
        if isinstance(mentioned_resources, list) and mentioned_resources:
            resources_str = ', '.join(str(resource) for resource in mentioned_resources)
        else:
            resources_str = 'None'
    except Exception as e:
        logger.warning(f"Error converting mentioned resources to string: {e}")
        resources_str = str(mentioned_resources) if mentioned_resources else 'None'
    
    context = f"""
    Video Summary: {summary}
    Video Topics: {topics_str}
    Video Resources: {resources_str}
    """
    
    return context
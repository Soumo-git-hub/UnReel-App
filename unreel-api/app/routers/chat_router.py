import logging
from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import schemas
from app.services.analysis_service import AnalysisService
from app.models import Analysis, ChatMessage
from app.database import get_db
from app.auth import get_current_user

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/chat", tags=["chat"])

@router.post("", response_model=schemas.ChatResponse)
async def chat_with_video(
    request: schemas.ChatRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    try:
        logger.info(f"Chat request for analysis ID: {request.analysisId}")
        
        analysis = db.query(Analysis).filter(Analysis.id == request.analysisId).first()
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        context = _prepare_analysis_context(analysis)
        analysis_svc = AnalysisService()
        reply = await analysis_svc.ai_service.chat_with_video(context, request.message, request.persona)
        
        # Save to database
        chat_msg = ChatMessage(
            analysisId=request.analysisId,
            message=request.message,
            reply=reply
        )
        db.add(chat_msg)
        db.commit()
        
        return {"reply": reply}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chat failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="An error occurred while processing your chat request. Please try again.")

@router.get("/{analysis_id}")
async def get_chat_history(
    analysis_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        messages = db.query(ChatMessage).filter(ChatMessage.analysisId == analysis_id).order_by(ChatMessage.createdAt.asc()).all()
        return {"messages": messages}
    except Exception as e:
        logger.error(f"Failed to fetch chat history: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch chat history.")


def _prepare_analysis_context(analysis: Analysis) -> str:
    """
    Prepare context string from analysis data.
    
    Args:
        analysis: Analysis model instance
        
    Returns:
        Formatted context string
    """
    # Safely access attributes
    title = getattr(analysis, 'title', None) or 'Unknown Title'
    uploader = getattr(analysis, 'uploader', None) or 'Unknown Uploader'
    summary = getattr(analysis, 'summary', None) or 'No summary available'
    transcript = getattr(analysis, 'fullTranscript', None) or 'No transcript available'
    
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
    Video Title: {title}
    Video Uploader: {uploader}
    
    Video Summary: 
    {summary}
    
    Video Topics: {topics_str}
    
    Video Resources Mentioned: {resources_str}
    
    Full Video Transcript:
    {transcript}
    """
    
    return context
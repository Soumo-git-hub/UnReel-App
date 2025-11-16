import logging
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import schemas
from app.services.analysis_service import AnalysisService
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
        
    except Exception as e:
        error_msg = f"Analysis failed: {str(e)}"
        logger.error(error_msg, exc_info=True)
        raise HTTPException(status_code=500, detail=error_msg)
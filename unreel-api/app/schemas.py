from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional, Dict, Any


# --- Analysis ---
class AnalysisRequest(BaseModel):
    url: str = Field(..., description="URL of the video to analyze")


class Resource(BaseModel):
    type: str = Field(..., description="Type of the resource")
    name: str = Field(..., description="Name of the resource")


class AnalysisMetadata(BaseModel):
    title: Optional[str] = Field(None, description="Title of the video")
    uploader: Optional[str] = Field(None, description="Uploader of the video")
    caption: Optional[str] = Field(None, description="Caption of the video")


class AnalysisContent(BaseModel):
    summary: Optional[str] = Field(None, description="Summary of the video content")
    translation: Optional[str] = Field(None, description="Translation of the video content")
    keyTopics: Optional[List[str]] = Field(None, description="Key topics in the video")
    mentionedResources: Optional[List[Resource]] = Field(None, description="Resources mentioned in the video")


class AnalysisResponse(BaseModel):
    analysisId: str = Field(..., description="Unique identifier for the analysis")
    originalUrl: str = Field(..., description="Original URL of the video")
    status: str = Field(..., description="Status of the analysis")
    metadata: Optional[AnalysisMetadata] = Field(None, description="Metadata of the video")
    content: Optional[AnalysisContent] = Field(None, description="Content analysis of the video")
    fullTranscript: Optional[str] = Field(None, description="Full transcript of the video")
    createdAt: datetime = Field(..., description="Timestamp when the analysis was created")

    class Config:
        from_attributes = True  # For compatibility with SQLAlchemy models


# --- Chat ---
class ChatRequest(BaseModel):
    analysisId: str = Field(..., description="ID of the analysis to chat about")
    message: str = Field(..., description="Message to send to the AI")


class ChatResponse(BaseModel):
    reply: str = Field(..., description="AI's reply to the chat message")
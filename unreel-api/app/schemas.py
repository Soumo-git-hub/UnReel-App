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
    summary: Optional[str] = Field(None, description="Summary of the video content in English")
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
    detectedLanguage: Optional[str] = Field(None, description="Detected language of the transcript")
    supportedLanguages: Optional[Dict[str, str]] = Field(None, description="Supported languages for translation")
    createdAt: datetime = Field(..., description="Timestamp when the analysis was created")

    class Config:
        from_attributes = True  # For compatibility with SQLAlchemy models


# --- Translation ---
class TranslationRequest(BaseModel):
    target_language: str = Field(..., description="Target language code for translation")


class TranslationResponse(BaseModel):
    analysisId: str = Field(..., description="ID of the analysis")
    originalText: str = Field(..., description="Original text that was translated")
    translatedText: str = Field(..., description="Translated transcript")
    sourceLanguage: Optional[str] = Field(None, description="Source language of the transcript")
    targetLanguage: str = Field(..., description="Target language of the translation")
    supportedLanguages: Dict[str, str] = Field(..., description="Supported languages for translation")
    translationType: str = Field(..., description="Type of translation (transcript)")
    summary: Optional[str] = Field(None, description="Original English summary for reference")

# --- Chat ---
class ChatRequest(BaseModel):
    analysisId: str = Field(..., description="ID of the analysis to chat about")
    message: str = Field(..., description="Message to send to the AI")


class ChatResponse(BaseModel):
    reply: str = Field(..., description="AI's reply to the chat message")
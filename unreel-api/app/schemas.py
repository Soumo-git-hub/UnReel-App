from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional, Dict, Any


# --- Multi-Lens Objects ---
class LocationContext(BaseModel):
    sceneType: str = Field(..., description="General setting or environment type")
    landmark: Optional[str] = Field(None, description="Specific landmark name if detected with high confidence")
    confidence: float = Field(..., description="Confidence score for the location inference")

class ShoppingItem(BaseModel):
    name: str = Field(..., description="Name of the product or item")
    description: str = Field(..., description="Brief description of the item")
    potentialUrl: Optional[str] = Field(None, description="Potential URL or search query to find the item")
    resolvedUrl: Optional[str] = Field(None, description="Actual purchase URL found by RAG search")
    searchResults: Optional[List[Dict[str, Any]]] = Field(None, description="Raw search results from RAG")

class FactCheckClaim(BaseModel):
    claim: str = Field(..., description="The verifiable factual claim extracted from the video")
    verdict: str = Field(..., description="Verdict: Supported, Contradicted, or Inconclusive")
    confidence: float = Field(..., description="Confidence score for the verdict")
    explanation: str = Field(..., description="Explanation for why this verdict was chosen")
    sources: Optional[List[str]] = Field(None, description="Source URLs from RAG evidence")

class EnhancedResource(BaseModel):
    name: str = Field(..., description="Name of the resource (product, template, tool, link)")
    type: str = Field(..., description="Type of the resource")
    urlSuggestion: Optional[str] = Field(None, description="Suggested search query or direct URL")
    detectiveLogic: str = Field(..., description="Why this resource was flagged (e.g., 'Link in bio mentioned')")
    resolvedUrl: Optional[str] = Field(None, description="Actual URL found by RAG search")
    searchResults: Optional[List[Dict[str, Any]]] = Field(None, description="Raw search results from RAG")

class MusicContext(BaseModel):
    songName: str = Field(..., description="Title of the detected background song")
    artist: str = Field(..., description="Artist or creator of the detected song")
    musicLink: Optional[str] = Field(None, description="Verified Spotify or Apple Music URL found by RAG search")
    isTrending: Optional[bool] = Field(None, description="Whether the song is currently trending on social media")


# --- Analysis ---
class AnalysisRequest(BaseModel):
    url: str = Field(..., description="URL of the video to analyze")
    focusEducational: bool = Field(False, description="Extract step-by-step tutorials or mini-courses")
    focusShopping: bool = Field(False, description="Identify products, outfits, or gear")
    focusLocation: bool = Field(True, description="Identify situational context and landmarks")
    focusFactCheck: bool = Field(False, description="Verify factual claims against knowledge")
    focusResource: bool = Field(False, description="Un-gatekeep links mentioned by the creator")
    focusMusic: bool = Field(False, description="Identify background music and find streaming links")


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
    locationContext: Optional[LocationContext] = Field(None, description="Situational context and landmarks")
    educationalInsights: Optional[List[str]] = Field(None, description="Step-by-step instructions or key takeaways")
    shoppingItems: Optional[List[ShoppingItem]] = Field(None, description="Shopping products identified in the video")
    factCheck: Optional[List[FactCheckClaim]] = Field(None, description="Fact-checking results for claims")
    enhancedResources: Optional[List[EnhancedResource]] = Field(None, description="Advanced 'Link-Detective' resources")
    musicContext: Optional[MusicContext] = Field(None, description="Background music details and verified links")


class AnalysisResponse(BaseModel):
    analysisId: str = Field(..., description="Unique identifier for the analysis")
    originalUrl: str = Field(..., description="Original URL of the video")
    status: str = Field(..., description="Status of the analysis")
    metadata: Optional[AnalysisMetadata] = Field(None, description="Metadata of the video")
    content: Optional[AnalysisContent] = Field(None, description="Content analysis of the video")
    availableFeatures: Optional[Dict[str, bool]] = Field(None, description="Flags for which lenses successfully found data")
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
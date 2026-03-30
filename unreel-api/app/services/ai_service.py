import json
import logging
import asyncio
import os
from typing import List, Dict, Any, Optional

import google.generativeai as genai

from app.core.config import settings

from app.services.music_service import MusicService

# Configure logging
logger = logging.getLogger(__name__)

# Configure the Google Generative AI client
genai.configure(api_key=settings.GEMINI_API_KEY)


class AiService:
    """Service for AI-powered video analysis using Google Gemini with Multi-Lens support."""
    
    def __init__(self):
        """Initialize the AiService with dual models for efficiency and depth."""
        self.model = genai.GenerativeModel('gemini-flash-latest')
        self.music_service = MusicService()

    def _build_base_prompt(self, caption: str, transcript: str, 
                           metadata: Dict[str, Any], detected_language: Optional[str]) -> str:
        """Build the base analysis prompt that always runs."""
        return f"""You are an expert video analyst for a tool called "UnReel." Your job is to analyze short-form video content (Reels, TikToks, YouTube Shorts) and return a structured JSON response.

CRITICAL RULES:
- ALWAYS return valid JSON. No markdown, no code fences, just raw JSON.
- Be honest. If you are unsure about something, say so with lower confidence scores.
- If a lens finds no relevant data, set its value to null or an empty list AND set its "available" flag to false.

--- SOURCE DATA ---
Source Language Detection: {detected_language if detected_language else 'Auto-detect'}
Video Caption: {caption}
Video Transcript: {transcript if transcript else 'No transcript available'}
Video Metadata: {json.dumps(metadata)}
--- END SOURCE DATA ---

--- BASE ANALYSIS (ALWAYS REQUIRED) ---
You MUST always return these fields:
1. "summary": A comprehensive 2-3 sentence summary of the video content in ENGLISH. Combine information from transcript, caption, and visual context.
2. "translation": If the source language is not English, translate the core message. Otherwise, return the same as summary.
3. "keyTopics": An array of 3-7 key topic strings identified from the video.
4. "mentionedResources": An array of objects with "type" (string) and "name" (string) for any products, songs, locations, or tools mentioned. Return an empty array if none found.
"""

    def _build_location_prompt(self) -> str:
        """Build the Location Lens prompt section."""
        return """
--- LOCATION LENS (ACTIVE) ---
Analyze the visual frames to determine WHERE this video takes place.
Return a "locationContext" object with:
- "sceneType" (string, REQUIRED): General setting, e.g., "Indoor Studio", "Urban Street", "Beach", "Kitchen", "Office", "Mountain Trail".
- "landmark" (string or null): ONLY provide a specific landmark name (e.g., "Eiffel Tower", "Times Square", "Senso-ji Temple") if you are highly confident (>= 0.75). Otherwise, set to null.
- "confidence" (float, 0.0-1.0): Your confidence in this identification.

IMPORTANT: It is better to return a general "sceneType" with high confidence than to guess a wrong landmark. Never hallucinate a location.
"""

    def _build_educational_prompt(self) -> str:
        """Build the Educational Lens prompt section."""
        return """
--- EDUCATIONAL LENS (ACTIVE) ---
Determine if this video contains educational or tutorial content.
If it does, return "educationalInsights" as an array of strings, where each string is a clear step, tip, or key takeaway. Example: ["Step 1: Preheat oven to 350°F", "Step 2: Mix dry ingredients", "Tip: Use room-temperature butter for best results"].
If the video is NOT educational (e.g., entertainment, memes, vlogs), return "educationalInsights" as an empty array [].
"""

    def _build_shopping_prompt(self) -> str:
        """Build the Shopping Lens prompt section."""
        return """
--- SHOPPING LENS (ACTIVE) ---
Identify any products, outfits, gadgets, tools, or purchasable items shown or mentioned in the video.
Return "shoppingItems" as an array of objects, each with:
- "name" (string): The product name or description (e.g., "White Nike Air Force 1", "Stanley Tumbler").
- "description" (string): A brief description of the item seen or mentioned.
- "potentialUrl" (string or null): A suggested Google search query to find this product (e.g., "Nike Air Force 1 white low"). Set to null if you can't determine the product clearly.

If no identifiable products are found, return "shoppingItems" as an empty array [].
"""

    def _build_factcheck_prompt(self) -> str:
        """Build the Fact-Check Lens prompt section."""
        return """
--- FACT-CHECK LENS (ACTIVE) ---
Identify 1-3 verifiable factual claims made in the video (from transcript or visual text/OCR).
Return "factCheck" as an array of objects, each with:
- "claim" (string): The specific factual claim extracted from the video.
- "verdict" (string): One of "Supported", "Contradicted", or "Inconclusive" based on your internal knowledge.
- "confidence" (float, 0.0-1.0): Your confidence in this verdict.
- "explanation" (string): 1-2 sentence explanation for the verdict.

IMPORTANT: Only flag clearly stated factual claims (statistics, historical facts, scientific statements). Do NOT fact-check opinions or subjective statements.
If no verifiable claims are found, return "factCheck" as an empty array [].
"""

    def _build_resource_prompt(self) -> str:
        """Build the Enhanced Resource / Link-Detective Lens prompt section."""
        return """
--- LINK-DETECTIVE LENS (ACTIVE) ---
The creator may be gatekeeping useful links by saying things like "Comment X for the link", "Link in bio", "DM me for the template", etc.
Your job is to IDENTIFY what resource they are referring to and help the user find it without needing to comment or DM.
Return "enhancedResources" as an array of objects, each with:
- "name" (string): The resource name (e.g., "Notion Budget Template", "Canva Resume Template", "Protein Powder Brand X").
- "type" (string): One of "template", "product", "tool", "website", "app", "course", "book", "other".
- "urlSuggestion" (string or null): A Google search query that could help find this resource (e.g., "Notion budget template free download"). Set to null if unclear.
- "detectiveLogic" (string): Why you flagged this (e.g., "Creator said 'Comment BUDGET for the template link'", "Product shown at timestamp 0:15").

If no gatekept resources are detected, return "enhancedResources" as an empty array [].
"""


    def _build_json_schema_prompt(self, active_lenses: Dict[str, bool]) -> str:
        """Build the final JSON schema instruction."""
        schema = """
--- REQUIRED JSON OUTPUT STRUCTURE ---
Return ONLY a JSON object with these exact keys:
{
  "summary": "string",
  "translation": "string",
  "keyTopics": ["string"],
  "mentionedResources": [{"type": "string", "name": "string"}],"""

        if active_lenses.get("location"):
            schema += '\n  "locationContext": {"sceneType": "string", "landmark": "string|null", "confidence": 0.0},'
        if active_lenses.get("educational"):
            schema += '\n  "educationalInsights": ["string"],'
        if active_lenses.get("shopping"):
            schema += '\n  "shoppingItems": [{"name": "string", "description": "string", "potentialUrl": "string|null"}],'
        if active_lenses.get("factCheck"):
            schema += '\n  "factCheck": [{"claim": "string", "verdict": "string", "confidence": 0.0, "explanation": "string"}],'
        if active_lenses.get("resource"):
            schema += '\n  "enhancedResources": [{"name": "string", "type": "string", "urlSuggestion": "string|null", "detectiveLogic": "string"}],'
        if active_lenses.get("music"):
            schema += '\n  "musicContext": {"songName": "string", "artist": "string", "musicLink": "string|null", "isTrending": true/false},'

        schema += """
  "availableFeatures": {"""
        
        feature_flags = []
        if active_lenses.get("location"):
            feature_flags.append('    "location": true/false')
        if active_lenses.get("educational"):
            feature_flags.append('    "educational": true/false')
        if active_lenses.get("shopping"):
            feature_flags.append('    "shopping": true/false')
        if active_lenses.get("factCheck"):
            feature_flags.append('    "factCheck": true/false')
        if active_lenses.get("resource"):
            feature_flags.append('    "resource": true/false')
        if active_lenses.get("music"):
            feature_flags.append('    "music": true/false')
        
        schema += ",\n".join(feature_flags)
        schema += """
  }
}

Set each "availableFeatures" flag to true ONLY if meaningful data was found for that lens. If the lens was active but found nothing relevant, set it to false.
"""
        return schema

    async def get_analysis(self, audio_path: Optional[str], image_paths: List[str], 
                          caption: str, transcript: str, metadata: Dict[str, Any],
                          detected_language: Optional[str] = None,
                          focus_location: bool = True,
                          focus_educational: bool = False,
                          focus_shopping: bool = False,
                          focus_fact_check: bool = False,
                          focus_resource: bool = False,
                          focus_music: bool = False) -> Dict[str, Any]:
        """
        Analyze video content using Gemini AI with Multi-Lens support.
        
        Args:
            audio_path: Path to the audio file (can be None)
            image_paths: List of paths to image frames
            caption: Video caption text
            transcript: Video transcript text
            metadata: Video metadata
            detected_language: Detected language of the transcript
            focus_location: Enable Location Lens
            focus_educational: Enable Educational Lens
            focus_shopping: Enable Shopping Lens
            focus_fact_check: Enable Fact-Check Lens
            focus_resource: Enable Link-Detective Lens
            focus_music: Enable Music-Detective Lens
            
        Returns:
            Dictionary containing analysis results with lens data
        """
        try:
            # Upload files to Gemini with retry logic for network stability
            async def upload_with_retry(path, max_retries=3):
                for attempt in range(max_retries):
                    try:
                        return await asyncio.to_thread(genai.upload_file, path=path)
                    except Exception as e:
                        if ("DECRYPTION_FAILED" in str(e) or "bad record mac" in str(e)):
                            if attempt < max_retries - 1:
                                wait_time = 2 ** attempt
                                logger.warning(f"SSL upload error, retrying in {wait_time}s... (Attempt {attempt + 1}/{max_retries})")
                                await asyncio.sleep(wait_time)
                                continue
                        raise e

            # Upload audio file if available
            upload_tasks = []
            if audio_path and os.path.exists(audio_path):
                logger.info(f"Uploading audio file: {audio_path}")
                upload_tasks.append(upload_with_retry(audio_path))
            else:
                logger.info("No audio file available for upload")
            
            # Queue image uploads (limit to first 10 frames for 0.2fps coverage)
            valid_image_paths = [p for p in image_paths[:10] if os.path.exists(p)]
            for p in valid_image_paths:
                logger.info(f"Uploading image file: {p}")
                upload_tasks.append(upload_with_retry(p))
            
            # Upload all files concurrently for maximum throughput
            files_to_upload = []
            if upload_tasks:
                uploaded = await asyncio.gather(*upload_tasks, return_exceptions=True)
                for result in uploaded:
                    if isinstance(result, Exception):
                        logger.warning(f"File upload failed: {result}")
                    else:
                        files_to_upload.append(result)
            
            if not files_to_upload:
                logger.info("No media files available for analysis, using metadata and caption only")
            
            # Track which lenses are active
            active_lenses = {
                "location": focus_location,
                "educational": focus_educational,
                "shopping": focus_shopping,
                "factCheck": focus_fact_check,
                "resource": focus_resource,
                "music": focus_music,
            }
            
            # --- TIER 1: CORE ANALYSIS (gemini-flash-latest) ---
            # Remove music from core lenses to keep it focused
            core_lenses = active_lenses.copy()
            core_lenses["music"] = False
            
            prompt_core = self._build_base_prompt(caption, transcript, metadata, detected_language)
            if focus_location: prompt_core += self._build_location_prompt()
            if focus_educational: prompt_core += self._build_educational_prompt()
            if focus_shopping: prompt_core += self._build_shopping_prompt()
            if focus_fact_check: prompt_core += self._build_factcheck_prompt()
            if focus_resource: prompt_core += self._build_resource_prompt()
            prompt_core += self._build_json_schema_prompt(core_lenses)

            response_core = await self.model.generate_content_async(
                [prompt_core] + files_to_upload,
                generation_config={"response_mime_type": "application/json"}
            )
            result = json.loads(response_core.text)
            if isinstance(result, list): result = result[0]

            # --- TIER 2: SPECIALIZED MUSIC ANALYSIS (SHAZAM) ---
            music_context = None
            if focus_music:
                logger.info("Running specialized Music forensic scan with Shazam...")
                # Try to use Shazam for the best music detection (Forensic Level)
                music_result = await self.music_service.identify_music(audio_path)
                if music_result:
                    music_context = music_result
                    
            # --- MERGE RESULTS ---
            normalized = {
                "summary": result.get("summary", ""),
                "translation": result.get("translation", ""),
                "keyTopics": result.get("keyTopics", result.get("key_topics", [])),
                "mentionedResources": result.get("mentionedResources", result.get("mentioned_resources", [])),
                "locationContext": result.get("locationContext") if focus_location else None,
                "educationalInsights": result.get("educationalInsights") if focus_educational else None,
                "shoppingItems": result.get("shoppingItems") if focus_shopping else None,
                "factCheck": result.get("factCheck") if focus_fact_check else None,
                "enhancedResources": result.get("enhancedResources") if focus_resource else None,
                "musicContext": music_context,
                "availableFeatures": result.get("availableFeatures", {}),
            }
            
            # Sync music feature flag
            if music_context:
                normalized["availableFeatures"]["music"] = True
            
            return normalized
            
        except Exception as e:
            logger.error(f"Error in AI analysis: {str(e)}", exc_info=True)
            # Return fallback response
            return {
                "summary": "Video analysis could not be completed by AI. Please try again.",
                "translation": "",
                "keyTopics": ["video", "content"],
                "mentionedResources": [],
                "locationContext": None,
                "educationalInsights": None,
                "shoppingItems": None,
                "factCheck": None,
                "enhancedResources": None,
                "availableFeatures": {},
            }

    async def refine_with_evidence(self, claims: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        RAG Pass 2: Take fact-check claims enriched with search evidence
        and ask Gemini to produce final, grounded verdicts.
        
        Args:
            claims: List of claim dicts, each with 'claim', 'verdict', 'confidence',
                    'explanation', and 'searchEvidence' (list of search results)
                    
        Returns:
            List of refined claim dicts with updated verdicts and explanations
        """
        if not claims:
            return []

        try:
            prompt = f"""You are a fact-checking assistant. You have been given factual claims extracted from a video, 
along with Google Search evidence for each claim. Your job is to update the verdict based on the evidence.

CLAIMS WITH EVIDENCE:
{json.dumps(claims, indent=2)}

For each claim, return a JSON array where each object has:
- "claim": the original claim text
- "verdict": Updated verdict based on evidence. One of "Supported", "Contradicted", or "Inconclusive"
- "confidence": Updated confidence (0.0-1.0) based on evidence quality
- "explanation": 1-2 sentence explanation referencing the evidence found
- "sources": Array of up to 2 source URLs from the evidence that support your verdict

CRITICAL: Base your verdict on the search evidence, not just your internal knowledge. If the evidence is conflicting, say "Inconclusive".
Return ONLY a JSON array."""

            response = await self.model.generate_content_async(
                prompt,
                generation_config={
                    "response_mime_type": "application/json"
                }
            )

            refined = json.loads(response.text)
            if isinstance(refined, list):
                return refined
            elif isinstance(refined, dict) and "claims" in refined:
                return refined["claims"]
            return claims  # fallback to originals

        except Exception as e:
            logger.error(f"Error in RAG refinement: {e}", exc_info=True)
            return claims  # fallback to original unrefined claims

    async def chat_with_video(self, context: str, message: str) -> str:
        """
        Chat with the AI about a video using the provided context.
        
        Args:
            context: Video analysis context
            message: User's chat message
            
        Returns:
            AI's response to the chat message
        """
        try:
            prompt = f"""Based on the following video context, answer the user's question:
            
            Video Context:
            {context}
            
            User Question:
            {message}
            
            Provide a concise and helpful answer:"""

            response = await self.model.generate_content_async(prompt)
            return response.text
            
        except Exception as e:
            logger.error(f"Error in AI chat: {str(e)}", exc_info=True)
            return "I'm sorry, but I'm currently unable to process your request. Please try again later."
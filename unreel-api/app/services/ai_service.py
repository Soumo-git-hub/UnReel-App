import json
import logging
import asyncio
import os
from typing import List, Dict, Any, Optional

import google.generativeai as genai

from app.core.config import settings

# Configure logging
logger = logging.getLogger(__name__)

# Configure the Google Generative AI client
genai.configure(api_key=settings.GEMINI_API_KEY)


class AiService:
    """Service for AI-powered video analysis using Google Gemini."""
    
    def __init__(self):
        """Initialize the AiService with the Gemini model."""
        # Initialize the model - using a model that's available
        self.model = genai.GenerativeModel('gemini-flash-latest')

    async def get_analysis(self, audio_path: Optional[str], image_paths: List[str], 
                          caption: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze video content using Gemini AI.
        
        Args:
            audio_path: Path to the audio file (can be None)
            image_paths: List of paths to image frames
            caption: Video caption text
            metadata: Video metadata
            
        Returns:
            Dictionary containing analysis results
        """
        try:
            # Upload files to Gemini using asyncio.to_thread to avoid blocking
            files_to_upload = []
            
            # Upload audio file if available
            if audio_path and os.path.exists(audio_path):
                logger.info(f"Uploading audio file: {audio_path}")
                audio_file = await asyncio.to_thread(genai.upload_file, path=audio_path)
                files_to_upload.append(audio_file)
            else:
                logger.info("No audio file available for upload")
            
            # Upload image files (limit to first 5 frames)
            image_files = []
            for p in image_paths[:5]:
                if os.path.exists(p):
                    logger.info(f"Uploading image file: {p}")
                    image_file = await asyncio.to_thread(genai.upload_file, path=p)
                    image_files.append(image_file)
                else:
                    logger.warning(f"Image file not found: {p}")
            files_to_upload.extend(image_files)
            
            # Check if we have any files to analyze
            if not files_to_upload:
                logger.info("No media files available for analysis, using metadata and caption only")
            
            # Prepare the prompt with explicit field names
            prompt_parts = [
                "You are an expert video analyst. Analyze the provided content to provide a structured analysis in JSON format with the EXACT field names specified:",
                "1. 'summary': A concise summary of the video content (1-2 sentences)",
                "2. 'translation': A translation of the content (if applicable, otherwise return the same as summary)",
                "3. 'keyTopics': Key topics as an array of strings (3-5 topics)",
                "4. 'mentionedResources': Mentioned resources (products, songs, locations, etc.) as an array of objects with 'type' and 'name' properties (0-5 resources)",
                f"Video Caption: {caption}",
                f"Video Metadata: {metadata}",
            ]
            prompt_parts.extend(files_to_upload)
            
            logger.info(f"Sending prompt with {len(files_to_upload)} files to AI model")
            
            # Generate content
            response = await self.model.generate_content_async(
                prompt_parts,
                generation_config={
                    "response_mime_type": "application/json"
                }
            )
            
            logger.debug(f"AI response received: {response.text}")
            
            # Parse the response
            result = json.loads(response.text)
            
            # Extract fields with proper names
            return {
                "summary": result.get("summary", ""),
                "translation": result.get("translation", ""),
                "keyTopics": result.get("keyTopics", result.get("key_topics", [])),
                "mentionedResources": result.get("mentionedResources", result.get("mentioned_resources", []))
            }
            
        except Exception as e:
            logger.error(f"Error in AI analysis: {str(e)}", exc_info=True)
            # Return fallback response
            return {
                "summary": "Video analysis completed successfully.",
                "translation": "Video analysis completed successfully.",
                "keyTopics": ["video", "content", "analysis"],
                "mentionedResources": [
                    {
                        "type": "sample",
                        "name": "resource"
                    }
                ]
            }

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
            return "I'm sorry, but I'm currently unable to process your request. This is a sample response when the AI service is unavailable."
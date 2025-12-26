import logging
from typing import Optional, Dict, List
from langdetect import detect, DetectorFactory
from langdetect.lang_detect_exception import LangDetectException
from deep_translator import GoogleTranslator

# Configure logging
logger = logging.getLogger(__name__)

# Set seed for consistent language detection results
DetectorFactory.seed = 0

class TranslationService:
    """Service for language detection and translation of video transcripts."""
    
    # Supported languages: 5 Indian languages + 5 international languages
    SUPPORTED_LANGUAGES = {
        'hi': 'Hindi',
        'ta': 'Tamil', 
        'te': 'Telugu',
        'bn': 'Bengali',
        'mr': 'Marathi',
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'zh': 'Chinese'
    }
    
    def __init__(self):
        """Initialize the TranslationService."""
        logger.info("Translation service initialized")
    
    def detect_language(self, text: str) -> Optional[str]:
        """
        Detect the language of the given text.
        
        Args:
            text: Text to detect language for
            
        Returns:
            Detected language code or None if detection fails
        """
        if not text or not text.strip():
            logger.warning("Empty text provided for language detection")
            return None
            
        try:
            detected_lang = detect(text)
            logger.info(f"Detected language: {detected_lang}")
            return detected_lang
        except LangDetectException as e:
            logger.error(f"Language detection failed: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error in language detection: {str(e)}")
            return None
    
    def translate_text(self, text: str, target_language: str) -> Optional[str]:
        """
        Translate text to the target language.
        
        Args:
            text: Text to translate
            target_language: Target language code
            
        Returns:
            Translated text or None if translation fails
        """
        if not text or not text.strip():
            logger.warning("Empty text provided for translation")
            return None
            
        if target_language not in self.SUPPORTED_LANGUAGES:
            logger.error(f"Unsupported target language: {target_language}")
            return None
            
        try:
            translator = GoogleTranslator(source='auto', target=target_language)
            translated_text = translator.translate(text)
            logger.info(f"Translated text to {target_language}")
            return translated_text
        except Exception as e:
            logger.error(f"Translation failed: {str(e)}")
            return None
    
    def get_supported_languages(self) -> Dict[str, str]:
        """
        Get the list of supported languages.
        
        Returns:
            Dictionary of language codes and their names
        """
        return self.SUPPORTED_LANGUAGES.copy()
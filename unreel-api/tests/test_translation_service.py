#!/usr/bin/env python3
"""
Unit tests for the translation service.
"""

import unittest
import sys
import os

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.services.translation_service import TranslationService

class TestTranslationService(unittest.TestCase):
    """Test cases for the TranslationService class."""
    
    def setUp(self):
        """Set up test fixtures before each test method."""
        self.translation_service = TranslationService()
    
    def test_language_detection(self):
        """Test language detection functionality."""
        # Test English text
        english_text = "Hello, how are you today? This is a test of the language detection feature."
        detected_lang = self.translation_service.detect_language(english_text)
        self.assertEqual(detected_lang, "en")
        
        # Test Spanish text
        spanish_text = "Hola, ¿cómo estás hoy? Esta es una prueba de la función de detección de idioma."
        detected_lang = self.translation_service.detect_language(spanish_text)
        self.assertEqual(detected_lang, "es")
        
        # Test empty text
        empty_text = ""
        detected_lang = self.translation_service.detect_language(empty_text)
        self.assertIsNone(detected_lang)
    
    def test_text_translation(self):
        """Test text translation functionality."""
        # Test translation from English to Spanish
        english_text = "Hello, how are you today?"
        translated_text = self.translation_service.translate_text(english_text, "es")
        self.assertIsNotNone(translated_text)
        self.assertIsInstance(translated_text, str)
        self.assertNotEqual(english_text, translated_text)
        
        # Test translation from English to French
        translated_text = self.translation_service.translate_text(english_text, "fr")
        self.assertIsNotNone(translated_text)
        self.assertIsInstance(translated_text, str)
        self.assertNotEqual(english_text, translated_text)
        
        # Test translation with empty text
        empty_text = ""
        translated_text = self.translation_service.translate_text(empty_text, "es")
        self.assertIsNone(translated_text)
        
        # Test translation with unsupported language
        translated_text = self.translation_service.translate_text(english_text, "xx")
        self.assertIsNone(translated_text)
    
    def test_supported_languages(self):
        """Test supported languages functionality."""
        supported_languages = self.translation_service.get_supported_languages()
        self.assertIsInstance(supported_languages, dict)
        self.assertGreater(len(supported_languages), 0)
        
        # Check that our required languages are supported
        required_languages = ["hi", "ta", "te", "bn", "mr", "en", "es", "fr", "de", "zh"]
        for lang_code in required_languages:
            self.assertIn(lang_code, supported_languages)

if __name__ == "__main__":
    unittest.main()
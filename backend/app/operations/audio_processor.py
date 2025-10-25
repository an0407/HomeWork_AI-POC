import os
import tempfile
from pathlib import Path
from typing import Optional
import whisper
from deep_translator import GoogleTranslator
from pydub import AudioSegment

class AudioProcessor:
    """Audio processing for speech-to-text and translation"""

    def __init__(self):
        # Initialize Whisper model (base model for speed, can use 'small' or 'medium' for better accuracy)
        # Model will be downloaded on first use (~150MB for base)
        self.whisper_model = None
        self.translator_hi = GoogleTranslator(source='hi', target='en')
        self.translator_ta = GoogleTranslator(source='ta', target='en')

    def _ensure_whisper_model(self):
        """Lazy load Whisper model"""
        if self.whisper_model is None:
            # Using 'base' model - good balance of speed and accuracy
            # Options: tiny (~75MB), base (~150MB), small (~500MB), medium (~1.5GB), large (~3GB)
            self.whisper_model = whisper.load_model("base")

    @staticmethod
    def convert_to_wav(audio_file_path: str) -> str:
        """
        Convert audio file to WAV format if needed
        Whisper works best with WAV files

        Args:
            audio_file_path: Path to audio file

        Returns:
            Path to WAV file
        """
        file_ext = Path(audio_file_path).suffix.lower()

        # If already WAV, return as-is
        if file_ext == '.wav':
            return audio_file_path

        # Convert to WAV
        try:
            audio = AudioSegment.from_file(audio_file_path)
            wav_path = audio_file_path.replace(file_ext, '.wav')
            audio.export(wav_path, format='wav')
            return wav_path
        except Exception as e:
            raise Exception(f"Error converting audio to WAV: {str(e)}")

    def audio_to_text(
        self,
        audio_file_path: str,
        language_code: str = "en"
    ) -> str:
        """
        Convert audio to text using OpenAI Whisper

        Args:
            audio_file_path: Path to audio file
            language_code: Language code (en, hi, ta)

        Returns:
            Transcribed text
        """
        self._ensure_whisper_model()

        # Map our language codes to Whisper language codes
        whisper_lang_map = {
            "en": "en",
            "ta": "ta",
            "hi": "hi"
        }
        whisper_lang = whisper_lang_map.get(language_code, "en")

        try:
            # Transcribe audio
            # Note: openai-whisper handles various audio formats automatically
            result = self.whisper_model.transcribe(
                audio_file_path,
                language=whisper_lang,
                fp16=False  # Use fp32 for CPU compatibility
            )

            # Extract transcribed text
            transcribed_text = result["text"]

            return transcribed_text.strip()

        except Exception as e:
            raise Exception(f"Error transcribing audio: {str(e)}")

    def translate_to_english(
        self,
        text: str,
        source_language: str
    ) -> str:
        """
        Translate text from Hindi/Tamil to English

        Args:
            text: Text to translate
            source_language: Source language code (hi, ta)

        Returns:
            Translated English text
        """
        if source_language == "en":
            # Already English, no translation needed
            return text

        try:
            if source_language == "hi":
                translated = self.translator_hi.translate(text)
            elif source_language == "ta":
                translated = self.translator_ta.translate(text)
            else:
                raise ValueError(f"Unsupported language for translation: {source_language}")

            return translated

        except Exception as e:
            raise Exception(f"Error translating text: {str(e)}")

    def process_audio_input(
        self,
        audio_file_path: str,
        input_language: str
    ) -> str:
        """
        Complete audio processing pipeline:
        1. Audio → Text (in original language)
        2. Text → English (if not already English)

        Args:
            audio_file_path: Path to audio file
            input_language: Language spoken in audio (en, hi, ta)

        Returns:
            English text ready for AI processing
        """
        # Step 1: Audio to text in original language
        transcribed_text = self.audio_to_text(audio_file_path, input_language)

        # Step 2: Translate to English if needed
        if input_language != "en":
            english_text = self.translate_to_english(transcribed_text, input_language)
            return english_text
        else:
            return transcribed_text

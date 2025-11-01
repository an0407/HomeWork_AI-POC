import os
import tempfile
from pathlib import Path
from typing import Optional
from deep_translator import GoogleTranslator
from pydub import AudioSegment

class AudioProcessor:
    """Audio processing for speech-to-text and translation"""

    def __init__(self):
        # Using SpeechRecognition with Google's free Web Speech API
        # No model downloads needed, no PyTorch dependency
        self.translator_hi = GoogleTranslator(source='hi', target='en')
        self.translator_ta = GoogleTranslator(source='ta', target='en')

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
        Convert audio to text using SpeechRecognition (Google Web Speech API)

        No PyTorch dependency, uses free Google API for transcription

        Args:
            audio_file_path: Path to audio file
            language_code: Language code (en, hi, ta)

        Returns:
            Transcribed text
        """
        import speech_recognition as sr

        # Map language codes to Google Speech Recognition language codes
        language_map = {
            "en": "en-US",
            "hi": "hi-IN",
            "ta": "ta-IN"
        }

        google_lang = language_map.get(language_code, "en-US")

        try:
            # Initialize recognizer
            recognizer = sr.Recognizer()

            # Load audio file and transcribe
            with sr.AudioFile(audio_file_path) as source:
                audio = recognizer.record(source)

            # Use Google Speech Recognition API
            text = recognizer.recognize_google(audio, language=google_lang)
            return text.strip()

        except sr.UnknownValueError:
            raise Exception(f"Could not understand audio in {language_code}")
        except sr.RequestError as e:
            raise Exception(f"Google Speech Recognition service error: {str(e)}")
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

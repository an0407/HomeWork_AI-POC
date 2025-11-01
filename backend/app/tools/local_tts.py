from gtts import gTTS
from pathlib import Path
import uuid
from typing import Dict
from app.config import settings

class LocalTTS:
    """Free Text-to-Speech using Google TTS (gTTS)"""

    def __init__(self):
        self.audio_dir = Path(settings.STORAGE_PATH) / "audio"
        self.audio_dir.mkdir(parents=True, exist_ok=True)

    def generate_audio(
        self,
        solution_data: Dict,
        language: str
    ) -> str:
        """
        Convert solution to audio using gTTS (Free)

        Args:
            solution_data: Solution dictionary with steps
            language: Language code (en/ta/hi)

        Returns:
            Audio file URL path
        """
        # Format solution for speech
        narration = self._format_for_speech(solution_data)

        # Map language codes to gTTS language codes
        gtts_lang_map = {
            "en": "en",
            "ta": "ta",
            "hi": "hi"
        }
        gtts_lang = gtts_lang_map.get(language, "en")

        try:
            # Generate audio using gTTS
            tts = gTTS(text=narration, lang=gtts_lang, slow=False)

            # Save audio file
            audio_filename = f"{uuid.uuid4()}.mp3"
            audio_path = self.audio_dir / audio_filename

            tts.save(str(audio_path))

            return f"/api/solution/audio/{audio_filename}"

        except Exception as e:
            raise Exception(f"Error generating audio with gTTS: {str(e)}")

    def _format_for_speech(self, solution_data: Dict) -> str:
        """Format solution steps into natural speech"""
        narration = "Let me explain this step by step. "

        for step in solution_data.get("solution_steps", []):
            narration += f"Step {step['step_number']}: {step['explanation']}. "

        narration += f"So the final answer is: {solution_data.get('final_answer', '')}."

        return narration

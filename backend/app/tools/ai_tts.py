from openai import OpenAI
from pathlib import Path
import uuid
from typing import Dict
from app.config import settings

class AITTS:
    """AI-powered Text-to-Speech using OpenAI TTS"""

    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.audio_dir = Path(settings.STORAGE_PATH) / "audio"
        self.audio_dir.mkdir(parents=True, exist_ok=True)

    def generate_audio(
        self,
        solution_data: Dict,
        language: str
    ) -> str:
        """
        Convert solution to audio using OpenAI TTS

        Args:
            solution_data: Solution dictionary with steps
            language: Language code (en/ta/hi)

        Returns:
            Audio file URL path
        """
        # Format solution for speech
        narration = self._format_for_speech(solution_data)

        try:
            # Generate audio
            response = self.client.audio.speech.create(
                model="tts-1",
                voice="alloy",  # Child-friendly voice
                input=narration
            )

            # Save audio file
            audio_filename = f"{uuid.uuid4()}.mp3"
            audio_path = self.audio_dir / audio_filename

            response.stream_to_file(str(audio_path))

            return f"/audio/{audio_filename}"

        except Exception as e:
            raise Exception(f"Error generating audio: {str(e)}")

    def _format_for_speech(self, solution_data: Dict) -> str:
        """Format solution steps into natural speech"""
        narration = "Let me explain this step by step. "

        for step in solution_data.get("solution_steps", []):
            narration += f"Step {step['step_number']}: {step['explanation']}. "

        narration += f"So the final answer is: {solution_data.get('final_answer', '')}."

        return narration

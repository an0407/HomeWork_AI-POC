from typing import Dict, Optional
from bson import ObjectId
from app.tools.ai_solver import AISolver
from app.tools.local_tts import LocalTTS
from app.database.mongodb import get_database

class SolutionAgent:
    """Main agent for solution generation"""

    def __init__(self):
        self.ai_solver = AISolver()
        self.tts = LocalTTS()  # Using free gTTS instead of expensive OpenAI TTS

    async def generate_solution(
        self,
        homework_id: str,
        generate_audio: bool,
        output_language: str,
        audio_language: Optional[str] = None
    ) -> Dict:
        """
        Generate solution for homework

        Args:
            homework_id: Homework document ID
            generate_audio: Whether to generate audio
            output_language: Language for solution text
            audio_language: Language for audio (if None, uses output_language)

        Returns:
            Dict with solution data including audio URL if requested
        """
        # Get homework from database
        db = get_database()
        try:
            object_id = ObjectId(homework_id)
        except Exception:
            raise ValueError("Invalid homework ID format")

        homework = await db.homework_submissions.find_one({"_id": object_id})

        if not homework:
            raise ValueError("Homework not found")

        # Generate solution using AI
        solution_data = self.ai_solver.generate_solution(
            question=homework["extracted_text"],
            subject=homework["subject"],
            output_language=output_language,
            grade_level=5
        )

        # Generate audio if requested
        audio_url = None
        if generate_audio:
            # Use audio_language if provided, otherwise fall back to output_language
            audio_lang = audio_language if audio_language else output_language
            audio_url = self.tts.generate_audio(
                solution_data,
                audio_lang
            )

        return {
            "question": homework["extracted_text"],
            "subject": homework["subject"],
            "solution_steps": solution_data["solution_steps"],
            "final_answer": solution_data["final_answer"],
            "concepts_covered": solution_data["concepts_covered"],
            "audio_url": audio_url,
            "output_language": output_language
        }

    async def regenerate_audio(
        self,
        solution_id: str,
        language: str
    ) -> str:
        """
        Regenerate audio for existing solution in different language

        Args:
            solution_id: Solution document ID
            language: New language for audio

        Returns:
            New audio URL
        """
        # Get solution from database
        db = get_database()
        try:
            object_id = ObjectId(solution_id)
        except Exception:
            raise ValueError("Invalid solution ID format")

        solution = await db.solutions.find_one({"_id": object_id})

        if not solution:
            raise ValueError("Solution not found")

        # Generate new audio
        audio_url = self.tts.generate_audio(solution, language)

        # Update solution in database (only update audio_url, not output_language)
        await db.solutions.update_one(
            {"_id": object_id},
            {"$set": {"audio_url": audio_url}}
        )

        return audio_url

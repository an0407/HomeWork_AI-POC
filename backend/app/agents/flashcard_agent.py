from typing import Dict
from datetime import datetime
from app.tools.ai_flashcard_gen import AIFlashcardGenerator
from app.database.mongodb import get_database

class FlashcardAgent:
    """Main agent for flashcard operations"""

    def __init__(self):
        self.ai_generator = AIFlashcardGenerator()

    async def generate_flashcards(
        self,
        homework_id: str,
        output_language: str
    ) -> Dict:
        """Generate flashcards from homework solution"""

        # Get solution
        db = get_database()
        solution = await db.solutions.find_one({"homework_id": homework_id})

        if not solution:
            raise ValueError("Solution not found for this homework")

        # Generate flashcards
        cards = self.ai_generator.generate_flashcards(
            question=solution["question"],
            solution_data=solution,
            subject=solution["subject"],
            output_language=output_language
        )

        # Create title
        title = f"Flashcards: {solution['question'][:50]}..."

        return {
            "homework_id": homework_id,
            "title": title,
            "subject": solution["subject"],
            "output_language": output_language,
            "cards": cards,
            "total_cards": len(cards)
        }

    async def track_review(
        self,
        set_id: str,
        card_id: str,
        confidence_level: int,
        time_taken_seconds: int
    ) -> None:
        """Track flashcard review progress"""

        db = get_database()

        # Update last_reviewed timestamp
        await db.flashcard_sets.update_one(
            {"_id": set_id},
            {"$set": {"last_reviewed": datetime.utcnow()}}
        )

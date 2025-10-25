from openai import OpenAI
import json
import uuid
from typing import Dict, List
from app.config import settings

class AIFlashcardGenerator:
    """AI-powered flashcard generation using GPT-4o-mini"""

    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL

    def generate_flashcards(
        self,
        question: str,
        solution_data: Dict,
        subject: str,
        output_language: str
    ) -> List[Dict]:
        """
        Generate flashcards from solution

        Args:
            question: Original homework question
            solution_data: Solution with steps and concepts
            subject: Subject (math/science/language)
            output_language: Language for flashcards (en/ta/hi)

        Returns:
            List of flashcard dictionaries
        """

        language_names = {
            "en": "English",
            "ta": "Tamil",
            "hi": "Hindi"
        }

        concepts = solution_data.get("concepts_covered", [])
        concepts_str = ", ".join(concepts) if concepts else "the topic"

        prompt = f"""Based on this homework solution, create 5-10 educational flashcards for studying.

Question: {question}
Subject: {subject}
Concepts covered: {concepts_str}

Create flashcards that cover:
- Key concepts and definitions
- Important formulas (if applicable)
- Key terms and their meanings
- Important facts to remember

IMPORTANT: Generate ALL content in {language_names[output_language]} language.

Return JSON with this EXACT structure:
{{
    "cards": [
        {{
            "front": "Question or term in {language_names[output_language]}",
            "back": "Answer or definition in {language_names[output_language]}",
            "difficulty": "easy|medium|hard"
        }}
    ]
}}

Create 5-10 flashcards. Make ALL text in {language_names[output_language]}.
"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": f"You create educational flashcards. Always respond in {language_names[output_language]}."
                    },
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.7,
                max_tokens=2000
            )

            data = json.loads(response.choices[0].message.content)
            cards = data.get("cards", [])

            # Add unique IDs
            for card in cards:
                card["card_id"] = str(uuid.uuid4())

            return cards

        except Exception as e:
            raise Exception(f"Error generating flashcards: {str(e)}")

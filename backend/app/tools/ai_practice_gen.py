from openai import OpenAI
import json
import uuid
from typing import Dict, List
from app.config import settings

class AIPracticeGenerator:
    """AI-powered practice test generation using GPT-4o-mini"""

    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL

    def generate_practice_questions(
        self,
        topic: str,
        subject: str,
        question_count: int,
        difficulty: str,
        output_language: str
    ) -> List[Dict]:
        """
        Generate practice questions using GPT-4o-mini

        Args:
            topic: Topic to generate questions about
            subject: Subject (math/science/language)
            question_count: Number of questions to generate
            difficulty: Difficulty level (easy/medium/hard)
            output_language: Language for questions (en/ta/hi)

        Returns:
            List of question dictionaries
        """

        language_names = {
            "en": "English",
            "ta": "Tamil",
            "hi": "Hindi"
        }

        prompt = f"""Create practice questions for a student learning about: {topic}

Subject: {subject}
Difficulty: {difficulty}

CRITICAL: Generate EXACTLY {question_count} questions total - no more, no less.

Distribute question types approximately as follows:
- ~50% Multiple Choice Questions (MCQ) with exactly 4 options
- ~30% Fill in the blank questions
- ~20% True/False questions

For small question counts (1-3), adjust the distribution but NEVER exceed {question_count} total questions.

IMPORTANT: Generate ALL content in {language_names[output_language]} language.

Return JSON with this EXACT structure:
{{
    "questions": [
        {{
            "question_text": "Question in {language_names[output_language]}",
            "question_type": "mcq",
            "options": ["option1", "option2", "option3", "option4"],
            "correct_answer": "correct option text",
            "explanation": "Why this is correct in {language_names[output_language]}",
            "difficulty": "easy|medium|hard"
        }},
        {{
            "question_text": "Fill in the blank question in {language_names[output_language]}",
            "question_type": "fill_blank",
            "options": null,
            "correct_answer": "correct word or phrase",
            "explanation": "Explanation in {language_names[output_language]}",
            "difficulty": "easy|medium|hard"
        }},
        {{
            "question_text": "True/False question in {language_names[output_language]}",
            "question_type": "true_false",
            "options": ["True", "False"],
            "correct_answer": "True or False",
            "explanation": "Explanation in {language_names[output_language]}",
            "difficulty": "easy|medium|hard"
        }}
    ]
}}

Make ALL text content in {language_names[output_language]}.
"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": f"You create practice questions for students. Always respond in {language_names[output_language]}."
                    },
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.8,
                max_tokens=3000
            )

            data = json.loads(response.choices[0].message.content)
            questions = data.get("questions", [])

            # Ensure we don't exceed requested count (fail-safe)
            if len(questions) > question_count:
                questions = questions[:question_count]

            # Add unique IDs
            for question in questions:
                question["question_id"] = str(uuid.uuid4())

            return questions

        except Exception as e:
            raise Exception(f"Error generating practice questions: {str(e)}")

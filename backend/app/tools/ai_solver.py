from openai import OpenAI
import json
from typing import Dict, List
from app.config import settings

class AISolver:
    """AI-powered solution generation using GPT-4o-mini"""

    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL

    def generate_solution(
        self,
        question: str,
        subject: str,
        output_language: str,
        grade_level: int = 5
    ) -> Dict:
        """
        Generate step-by-step solution using GPT-4o-mini

        Args:
            question: The homework question
            subject: Subject (math/science/language)
            output_language: Language for explanation (en/ta/hi)
            grade_level: Student grade level

        Returns:
            Dict with solution_steps, final_answer, concepts_covered
        """

        # Language names for prompt
        language_names = {
            "en": "English",
            "ta": "Tamil",
            "hi": "Hindi"
        }

        prompt = f"""You are a friendly homework tutor helping a grade {grade_level} student.

Subject: {subject}
Question: {question}

Provide a detailed, step-by-step solution suitable for a child. Use simple, easy-to-understand language.

IMPORTANT: Generate the ENTIRE explanation in {language_names[output_language]} language.

Return your response as JSON with this EXACT structure:
{{
    "solution_steps": [
        {{
            "step_number": 1,
            "explanation": "Clear explanation in {language_names[output_language]}",
            "formula_used": "formula if applicable or null"
        }}
    ],
    "final_answer": "The final answer in {language_names[output_language]}",
    "concepts_covered": ["concept1 in {language_names[output_language]}", "concept2 in {language_names[output_language]}"]
}}

Make sure ALL text content is in {language_names[output_language]}.
"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": f"You are a patient homework tutor. Always respond in {language_names[output_language]}."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.7,
                max_tokens=2000
            )

            solution_data = json.loads(response.choices[0].message.content)
            return solution_data

        except Exception as e:
            raise Exception(f"Error generating solution: {str(e)}")

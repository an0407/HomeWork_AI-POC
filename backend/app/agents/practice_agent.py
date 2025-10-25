from typing import Dict, List
from bson import ObjectId
from app.tools.ai_practice_gen import AIPracticeGenerator
from app.database.mongodb import get_database

class PracticeAgent:
    """Main agent for practice test operations"""

    def __init__(self):
        self.ai_generator = AIPracticeGenerator()

    async def generate_practice_test(
        self,
        homework_id: str,
        question_count: int,
        difficulty: str,
        output_language: str
    ) -> Dict:
        """Generate practice test for homework"""

        # Get solution
        db = get_database()
        solution = await db.solutions.find_one({"homework_id": homework_id})

        if not solution:
            raise ValueError("Solution not found for this homework")

        # Extract topic
        concepts = solution.get("concepts_covered", [])
        topic = ", ".join(concepts) if concepts else solution.get("question", "")[:100]

        # Generate questions
        questions = self.ai_generator.generate_practice_questions(
            topic=topic,
            subject=solution["subject"],
            question_count=question_count,
            difficulty=difficulty,
            output_language=output_language
        )

        return {
            "homework_id": homework_id,
            "topic": topic,
            "subject": solution["subject"],
            "output_language": output_language,
            "questions": questions
        }

    async def submit_practice_test(
        self,
        test_id: str,
        answers: List[Dict],
        time_taken_seconds: int
    ) -> Dict:
        """Submit and grade practice test"""

        # Get test
        db = get_database()
        try:
            object_id = ObjectId(test_id)
        except Exception:
            raise ValueError("Invalid test ID format")

        test = await db.practice_tests.find_one({"_id": object_id})

        if not test:
            raise ValueError("Practice test not found")

        # Grade answers
        results = []
        correct_count = 0

        for answer in answers:
            question = next(
                (q for q in test["questions"] if q["question_id"] == answer["question_id"]),
                None
            )

            if not question:
                continue

            # Compare answers (case-insensitive, trimmed)
            user_ans = answer["user_answer"].lower().strip()
            correct_ans = question["correct_answer"].lower().strip()
            is_correct = user_ans == correct_ans

            if is_correct:
                correct_count += 1

            results.append({
                "question_id": answer["question_id"],
                "question_text": question["question_text"],
                "question_type": question["question_type"],
                "options": question.get("options"),
                "user_answer": answer["user_answer"],
                "correct_answer": question["correct_answer"],
                "is_correct": is_correct,
                "explanation": question["explanation"]
            })

        # Calculate score
        total = len(answers)
        score = (correct_count / total * 100) if total > 0 else 0

        return {
            "test_id": test_id,
            "score": round(score, 2),
            "correct": correct_count,
            "total_questions": total,
            "time_taken_seconds": time_taken_seconds,
            "results": results
        }

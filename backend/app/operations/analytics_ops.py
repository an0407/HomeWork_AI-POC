from typing import Dict, List
from datetime import datetime, timedelta
from bson import ObjectId

class AnalyticsOperations:
    """Non-AI analytics and statistics operations"""

    @staticmethod
    async def calculate_dashboard_stats(db) -> Dict:
        """Calculate dashboard statistics"""

        # Total counts
        total_homework = await db.homework_submissions.count_documents({})
        total_solutions = await db.solutions.count_documents({})
        total_practice_tests = await db.practice_tests.count_documents({})
        total_flashcard_sets = await db.flashcard_sets.count_documents({})

        # Subject breakdown
        subject_pipeline = [
            {"$group": {"_id": "$subject", "count": {"$sum": 1}}}
        ]
        subject_results = await db.homework_submissions.aggregate(subject_pipeline).to_list(length=None)
        subjects = [{"subject": r["_id"], "count": r["count"]} for r in subject_results]

        # Recent activity (last 7 days)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        recent_activity = await db.homework_submissions.count_documents({
            "created_at": {"$gte": seven_days_ago}
        })

        # Average practice score
        avg_score_pipeline = [
            {"$group": {"_id": None, "avg_score": {"$avg": "$score"}}}
        ]
        avg_result = await db.practice_submissions.aggregate(avg_score_pipeline).to_list(length=1)
        average_practice_score = avg_result[0]["avg_score"] if avg_result else None

        return {
            "total_homework": total_homework,
            "total_solutions": total_solutions,
            "practice_tests_taken": total_practice_tests,
            "flashcard_sets": total_flashcard_sets,
            "subjects": subjects,
            "recent_activity": recent_activity,
            "average_practice_score": round(average_practice_score, 2) if average_practice_score else None
        }

    @staticmethod
    async def get_recent_homework_enriched(db, limit: int = 10) -> List[Dict]:
        """Get recent homework with enriched data"""

        homework_list = await db.homework_submissions.find()\
            .sort("created_at", -1)\
            .limit(limit)\
            .to_list(length=limit)

        # Enrich each homework
        for hw in homework_list:
            hw_id = str(hw["_id"])

            # Check for solution
            solution = await db.solutions.find_one({"homework_id": hw_id})
            hw["has_solution"] = solution is not None
            hw["solution_id"] = str(solution["_id"]) if solution else None

            # Check for practice test
            practice_test = await db.practice_tests.find_one({"homework_id": hw_id})
            hw["has_practice_test"] = practice_test is not None

            # Check for flashcards
            flashcard_set = await db.flashcard_sets.find_one({"homework_id": hw_id})
            hw["has_flashcards"] = flashcard_set is not None

            # Convert ObjectId to string
            hw["homework_id"] = hw_id
            del hw["_id"]

            # Truncate extracted text
            if "extracted_text" in hw and len(hw["extracted_text"]) > 100:
                hw["extracted_text"] = hw["extracted_text"][:100] + "..."

        return homework_list

    @staticmethod
    async def calculate_review_progress(db, set_id: str) -> Dict:
        """Calculate flashcard review progress"""

        try:
            object_id = ObjectId(set_id)
        except Exception:
            return None

        # Get flashcard set
        flashcard_set = await db.flashcard_sets.find_one({"_id": object_id})

        if not flashcard_set:
            return None

        total_cards = flashcard_set.get("total_cards", 0)

        # Get review history
        reviews = await db.review_progress.find({"set_id": set_id})\
            .sort("reviewed_at", -1)\
            .to_list(length=100)

        if not reviews:
            return {
                "total_cards": total_cards,
                "reviewed_cards": 0,
                "progress_percentage": 0,
                "average_confidence": 0,
                "last_reviewed": None,
                "review_history": []
            }

        # Calculate stats
        reviewed_cards = len(set([r["card_id"] for r in reviews]))
        avg_confidence = sum(r["confidence_level"] for r in reviews) / len(reviews)
        progress_percentage = (reviewed_cards / total_cards * 100) if total_cards > 0 else 0

        # Convert ObjectId to string in review history
        for review in reviews:
            if "_id" in review:
                review["_id"] = str(review["_id"])

        return {
            "total_cards": total_cards,
            "reviewed_cards": reviewed_cards,
            "progress_percentage": round(progress_percentage, 2),
            "average_confidence": round(avg_confidence, 2),
            "last_reviewed": flashcard_set.get("last_reviewed"),
            "review_history": reviews[:10]  # Last 10 reviews
        }

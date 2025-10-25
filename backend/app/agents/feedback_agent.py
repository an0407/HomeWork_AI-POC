from typing import Dict, List
from datetime import datetime
from bson import ObjectId
from app.database.mongodb import get_database
import logging

logging.basicConfig(level=logging.DEBUG)  # Enable debug logging


class FeedbackAgent:
    """Main agent for feedback operations"""

    async def submit_feedback(
        self,
        solution_id: str,
        rating: int,
        feedback_text: str,
        was_helpful: bool,
        issues: List[str]
    ) -> Dict:
        db = get_database()
        obj_id = None

        # Convert string to ObjectId if possible
        try:
            obj_id = ObjectId(solution_id)
        except Exception:
            logging.debug(f"Solution ID is not a valid ObjectId: {solution_id}")

        # Try fetching solution
        solution = None
        try:
            if obj_id:
                solution = await db.solutions.find_one({"_id": obj_id})
            if not solution:
                solution = await db.solutions.find_one({"solution_id": solution_id})
        except Exception as e:
            logging.exception("Database error while fetching solution")
            raise e  # Propagate the actual DB error

        if not solution:
            raise ValueError(f"Solution not found for ID: {solution_id}")

        # Insert feedback
        feedback_data = {
            "solution_id": solution_id,
            "rating": rating,
            "feedback_text": feedback_text,
            "was_helpful": was_helpful,
            "issues": issues,
            "created_at": datetime.utcnow()
        }

        try:
            result = await db.feedback.insert_one(feedback_data)
        except Exception as e:
            logging.exception("Database error while inserting feedback")
            raise e

        # Calculate average rating
        try:
            all_feedback = await db.feedback.find({"solution_id": solution_id}).to_list(length=None)
            avg_rating = round(sum(f["rating"] for f in all_feedback) / len(all_feedback), 2)
        except Exception as e:
            logging.exception("Database error while calculating average rating")
            raise e

        # Update solution
        update_query = {"average_rating": avg_rating, "feedback_count": len(all_feedback)}
        try:
            if obj_id:
                await db.solutions.update_one({"_id": obj_id}, {"$set": update_query})
            else:
                await db.solutions.update_one({"solution_id": solution_id}, {"$set": update_query})
        except Exception as e:
            logging.exception("Database error while updating solution")
            raise e

        return {
            "feedback_id": str(result.inserted_id),
            "average_rating": avg_rating
        }

    async def get_solution_feedback(self, solution_id: str) -> Dict:
        db = get_database()
        obj_id = None

        try:
            obj_id = ObjectId(solution_id)
        except Exception:
            logging.debug(f"Solution ID is not a valid ObjectId: {solution_id}")

        # Ensure solution exists
        try:
            solution = None
            if obj_id:
                solution = await db.solutions.find_one({"_id": obj_id})
            if not solution:
                solution = await db.solutions.find_one({"solution_id": solution_id})
        except Exception as e:
            logging.exception("Database error while fetching solution")
            raise e

        if not solution:
            raise ValueError(f"Solution not found for ID: {solution_id}")

        # Fetch feedback
        try:
            all_feedback = await db.feedback.find({"solution_id": solution_id}) \
                .sort("created_at", -1) \
                .to_list(length=100)
        except Exception as e:
            logging.exception("Database error while fetching feedback")
            raise e

        if not all_feedback:
            return {
                "solution_id": solution_id,
                "average_rating": 0.0,
                "total_feedback": 0,
                "helpful_count": 0,
                "recent_feedback": []
            }

        avg_rating = round(sum(f["rating"] for f in all_feedback) / len(all_feedback), 2)
        helpful_count = sum(1 for f in all_feedback if f.get("was_helpful", False))

        recent_feedback = []
        for f in all_feedback[:10]:
            f["_id"] = str(f.get("_id"))
            recent_feedback.append(f)

        return {
            "solution_id": solution_id,
            "average_rating": avg_rating,
            "total_feedback": len(all_feedback),
            "helpful_count": helpful_count,
            "recent_feedback": recent_feedback
        }

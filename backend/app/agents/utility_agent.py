from typing import List, Dict
from app.database.mongodb import get_database
from app.operations.delete_ops import DeleteOperations
from app.agents.solution_agent import SolutionAgent
from bson import ObjectId

class UtilityAgent:
    def __init__(self):
        self.delete_ops = DeleteOperations()
        self.solution_agent = SolutionAgent()

    async def delete_homework(self, homework_id: str) -> Dict:
        db = get_database()
        try:
            obj_id = ObjectId(homework_id)
        except Exception:
            raise ValueError("Invalid homework ID format")

        homework = await db.homework_submissions.find_one({"_id": obj_id})
        if not homework:
            raise ValueError("Homework not found")

        counts = await self.delete_ops.delete_homework_cascade(db, obj_id)
        total_deleted = sum(counts.values())
        return {
            "message": "Homework and all associated data deleted successfully",
            "deleted_items": counts,
            "total_deleted": total_deleted
        }

    async def delete_flashcard_set(self, set_id: str) -> Dict:
        db = get_database()
        obj_id = ObjectId(set_id)
        flashcard_set = await db.flashcard_sets.find_one({"_id": obj_id})
        if not flashcard_set:
            raise ValueError("Flashcard set not found")
        counts = await self.delete_ops.delete_flashcard_set_cascade(db, obj_id)
        return {
            "message": "Flashcard set deleted successfully",
            "deleted_items": counts
        }

    async def batch_generate_content(self, homework_ids: List[str]) -> Dict:
        db = get_database()
        results = []
        successful = 0
        failed = 0
        skipped = 0

        for homework_id in homework_ids:
            try:
                # Convert string ID to ObjectId
                obj_id = ObjectId(homework_id)
            except Exception:
                results.append({
                    "homework_id": homework_id,
                    "status": "failed",
                    "message": "Invalid homework ID format",
                    "solution_id": None,
                    "error": "Cannot convert to ObjectId"
                })
                failed += 1
                continue

            # Fetch homework
            homework = await db.homework_submissions.find_one({"_id": obj_id})
            if not homework:
                results.append({
                    "homework_id": homework_id,
                    "status": "failed",
                    "message": "Homework not found",
                    "solution_id": None,
                    "error": "Homework ID does not exist"
                })
                failed += 1
                continue

            # Check if solution already exists
            existing_solution = await db.solutions.find_one({"homework_id": str(obj_id)})
            if existing_solution:
                results.append({
                    "homework_id": homework_id,
                    "status": "skipped",
                    "message": "Solution already exists",
                    "solution_id": str(existing_solution["_id"])
                })
                skipped += 1
                continue

            # Generate solution
            solution_data = await self.solution_agent.generate_solution(
                homework_id=homework_id,
                generate_audio=False,
                output_language=homework.get("output_language", "en")
            )

            from app.schemas.solution import SolutionDB
            solution_db = SolutionDB(
                homework_id=str(obj_id),  # store ObjectId
                **solution_data
            )
            solution_dict = solution_db.dict(by_alias=True, exclude={"id"})
            insert_result = await db.solutions.insert_one(solution_dict)

            results.append({
                "homework_id": homework_id,
                "status": "success",
                "message": "Solution generated successfully",
                "solution_id": str(insert_result.inserted_id)
            })
            successful += 1

        return {
            "results": results,
            "total_processed": len(homework_ids),
            "successful": successful,
            "failed": failed,
            "skipped": skipped
        }

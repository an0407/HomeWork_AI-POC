from typing import Dict

class DeleteOperations:
    @staticmethod
    async def delete_homework_cascade(db, homework_id: str) -> Dict:
        counts = {}
        # Delete homework
        hw_result = await db.homework_submissions.delete_one({"_id": homework_id})
        counts["homework"] = hw_result.deleted_count

        # Delete solutions
        solutions = await db.solutions.find({"homework_id": homework_id}).to_list(length=None)
        solution_ids = [str(s["_id"]) for s in solutions]
        sol_result = await db.solutions.delete_many({"homework_id": homework_id})
        counts["solutions"] = sol_result.deleted_count

        # Delete feedback for solutions
        if solution_ids:
            feedback_result = await db.feedback.delete_many({"solution_id": {"$in": solution_ids}})
            counts["feedback"] = feedback_result.deleted_count
        else:
            counts["feedback"] = 0

        # Delete practice tests
        practice_tests = await db.practice_tests.find({"homework_id": homework_id}).to_list(length=None)
        test_ids = [str(pt["_id"]) for pt in practice_tests]
        pt_result = await db.practice_tests.delete_many({"homework_id": homework_id})
        counts["practice_tests"] = pt_result.deleted_count

        # Delete practice submissions
        if test_ids:
            ps_result = await db.practice_submissions.delete_many({"test_id": {"$in": test_ids}})
            counts["practice_submissions"] = ps_result.deleted_count
        else:
            counts["practice_submissions"] = 0

        # Delete flashcard sets
        flashcard_sets = await db.flashcard_sets.find({"homework_id": homework_id}).to_list(length=None)
        set_ids = [str(fs["_id"]) for fs in flashcard_sets]
        fs_result = await db.flashcard_sets.delete_many({"homework_id": homework_id})
        counts["flashcard_sets"] = fs_result.deleted_count

        # Delete review progress
        if set_ids:
            rp_result = await db.review_progress.delete_many({"set_id": {"$in": set_ids}})
            counts["review_progress"] = rp_result.deleted_count
        else:
            counts["review_progress"] = 0

        return counts

    @staticmethod
    async def delete_flashcard_set_cascade(db, set_id: str) -> Dict:
        counts = {}
        fs_result = await db.flashcard_sets.delete_one({"_id": set_id})
        counts["flashcard_set"] = fs_result.deleted_count

        rp_result = await db.review_progress.delete_many({"set_id": set_id})
        counts["review_progress"] = rp_result.deleted_count

        return counts

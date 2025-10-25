from typing import Dict, Optional
from datetime import datetime
from bson import ObjectId


class SearchOperations:
    """Non-AI search and filter operations"""

    @staticmethod
    async def search_homework(
            db,
            query: Optional[str] = None,
            subject: Optional[str] = None,
            date_from: Optional[str] = None,
            date_to: Optional[str] = None,
            limit: int = 20,
            skip: int = 0
    ) -> Dict:
        # Build MongoDB filter
        filter_dict = {}

        # Text search (regex on extracted_text)
        if query:
            filter_dict["$or"] = [
                {"extracted_text": {"$regex": query, "$options": "i"}},
                {"subject": {"$regex": query, "$options": "i"}}
            ]

        # Subject filter
        if subject:
            filter_dict["subject"] = subject

        # Date range filter
        if date_from or date_to:
            filter_dict["created_at"] = {}
            if date_from:
                date_from_obj = datetime.fromisoformat(date_from.replace('Z', '+00:00'))
                filter_dict["created_at"]["$gte"] = date_from_obj
            if date_to:
                date_to_obj = datetime.fromisoformat(date_to.replace('Z', '+00:00'))
                filter_dict["created_at"]["$lte"] = date_to_obj

        # Execute query with pagination
        homework_list = await db.homework_submissions.find(filter_dict) \
            .sort("created_at", -1) \
            .skip(skip) \
            .limit(limit) \
            .to_list(length=limit)

        # Get total count for pagination
        total_count = await db.homework_submissions.count_documents(filter_dict)

        # Enrich with solution status & serialize ObjectId
        for hw in homework_list:
            hw_id = str(hw.get("_id"))
            solution = await db.solutions.find_one({"homework_id": hw_id})

            hw["homework_id"] = hw_id
            hw["has_solution"] = solution is not None
            # remove fields which are not JSON serializable or sensitive
            hw.pop("_id", None)
            hw.pop("image_path", None)

        # Calculate pagination info
        total_pages = (total_count + limit - 1) // limit if limit > 0 else 0
        current_page = (skip // limit) + 1 if limit > 0 else 1

        return {
            "homework": homework_list,
            "total": total_count,
            "page": current_page,
            "total_pages": total_pages
        }

    @staticmethod
    async def search_flashcards(
            db,
            query: Optional[str] = None,
            subject: Optional[str] = None,
            limit: int = 20
    ) -> Dict:
        # Build MongoDB filter
        filter_dict = {}

        # Text search (on title and card content)
        if query:
            filter_dict["$or"] = [
                {"title": {"$regex": query, "$options": "i"}},
                {"cards.front": {"$regex": query, "$options": "i"}},
                {"cards.back": {"$regex": query, "$options": "i"}}
            ]

        # Subject filter
        if subject:
            filter_dict["subject"] = subject

        # Execute query
        flashcard_sets = await db.flashcard_sets.find(filter_dict) \
            .sort("created_at", -1) \
            .limit(limit) \
            .to_list(length=limit)

        total_count = await db.flashcard_sets.count_documents(filter_dict)

        # Format results
        for fs in flashcard_sets:
            fs["set_id"] = str(fs.get("_id"))
            fs.pop("_id", None)
            fs.pop("cards", None)  # Don't return full cards in search results

        return {
            "flashcard_sets": flashcard_sets,
            "total": total_count
        }

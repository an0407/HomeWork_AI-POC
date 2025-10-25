from typing import Dict, Optional
from app.operations.search_ops import SearchOperations
from app.database.mongodb import get_database


class SearchAgent:
    """Main agent for search coordination"""

    def __init__(self):
        self.search_ops = SearchOperations()

    async def search_homework(
            self,
            query: Optional[str],
            subject: Optional[str],
            date_from: Optional[str],
            date_to: Optional[str],
            limit: int,
            skip: int
    ) -> Dict:
        db = get_database()
        return await self.search_ops.search_homework(
            db=db,
            query=query,
            subject=subject,
            date_from=date_from,
            date_to=date_to,
            limit=limit,
            skip=skip
        )

    async def search_flashcards(
            self,
            query: Optional[str],
            subject: Optional[str],
            limit: int
    ) -> Dict:
        db = get_database()
        return await self.search_ops.search_flashcards(
            db=db,
            query=query,
            subject=subject,
            limit=limit
        )

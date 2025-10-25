from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.agents.search_agent import SearchAgent
from app.schemas.search import (
    HomeworkSearchResponse,
    FlashcardSearchResponse
)

router = APIRouter(prefix="/api/search", tags=["search"])
search_agent = SearchAgent()

@router.get("/homework", response_model=HomeworkSearchResponse)
async def search_homework(
    query: Optional[str] = Query(None, description="Search text"),
    subject: Optional[str] = Query(None, description="Filter by subject"),
    date_from: Optional[str] = Query(None, description="Start date (ISO format)"),
    date_to: Optional[str] = Query(None, description="End date (ISO format)"),
    limit: int = Query(20, ge=1, le=100, description="Results per page"),
    skip: int = Query(0, ge=0, description="Pagination offset")
):
    try:
        results = await search_agent.search_homework(
            query=query,
            subject=subject,
            date_from=date_from,
            date_to=date_to,
            limit=limit,
            skip=skip
        )
        return HomeworkSearchResponse(**results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/flashcards", response_model=FlashcardSearchResponse)
async def search_flashcards(
    query: Optional[str] = Query(None, description="Search text"),
    subject: Optional[str] = Query(None, description="Filter by subject"),
    limit: int = Query(20, ge=1, le=100, description="Max results")
):
    try:
        results = await search_agent.search_flashcards(
            query=query,
            subject=subject,
            limit=limit
        )
        return FlashcardSearchResponse(**results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

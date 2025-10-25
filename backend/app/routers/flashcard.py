from fastapi import APIRouter, HTTPException
from app.agents.flashcard_agent import FlashcardAgent
from app.agents.dashboard_agent import DashboardAgent
from app.schemas.flashcard import (
    FlashcardGenerateRequest,
    FlashcardSetResponse,
    ReviewProgressRequest,
    FlashcardSetDB,
    ReviewProgressDB
)
from app.database.mongodb import get_database

router = APIRouter(prefix="/api/flashcards", tags=["flashcards"])
flashcard_agent = FlashcardAgent()
dashboard_agent = DashboardAgent()

@router.post("/generate", response_model=FlashcardSetResponse)
async def generate_flashcards(request: FlashcardGenerateRequest):
    """Generate flashcards from homework solution"""

    try:
        # Generate flashcards
        flashcard_data = await flashcard_agent.generate_flashcards(
            homework_id=request.homework_id,
            output_language=request.output_language
        )

        # Save to database
        flashcard_db = FlashcardSetDB(**flashcard_data)

        db = get_database()
        flashcard_dict = flashcard_db.dict(by_alias=True, exclude={"id"})
        insert_result = await db.flashcard_sets.insert_one(flashcard_dict)

        return FlashcardSetResponse(
            set_id=str(insert_result.inserted_id),
            **flashcard_data
        )

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/library")
async def get_flashcard_library(limit: int = 20, skip: int = 0):
    """Get all flashcard sets"""

    db = get_database()

    flashcard_sets = await db.flashcard_sets.find()\
        .sort("created_at", -1)\
        .skip(skip)\
        .limit(limit)\
        .to_list(length=limit)

    total = await db.flashcard_sets.count_documents({})

    # Convert ObjectId to string
    for fs in flashcard_sets:
        fs["_id"] = str(fs["_id"])

    return {
        "flashcard_sets": flashcard_sets,
        "total": total
    }

@router.get("/{set_id}")
async def get_flashcard_set(set_id: str):
    """Get specific flashcard set"""

    db = get_database()
    flashcard_set = await db.flashcard_sets.find_one({"_id": set_id})

    if not flashcard_set:
        raise HTTPException(status_code=404, detail="Flashcard set not found")

    flashcard_set["_id"] = str(flashcard_set["_id"])
    return flashcard_set

@router.post("/{set_id}/review")
async def track_flashcard_review(set_id: str, request: ReviewProgressRequest):
    """Track flashcard review progress"""

    try:
        # Track review
        await flashcard_agent.track_review(
            set_id=set_id,
            card_id=request.card_id,
            confidence_level=request.confidence_level,
            time_taken_seconds=request.time_taken_seconds
        )

        # Save review progress
        review_db = ReviewProgressDB(
            set_id=set_id,
            card_id=request.card_id,
            confidence_level=request.confidence_level,
            time_taken_seconds=request.time_taken_seconds
        )

        db = get_database()
        review_dict = review_db.dict(by_alias=True, exclude={"id"})
        await db.review_progress.insert_one(review_dict)

        return {
            "message": "Progress saved",
            "card_id": request.card_id,
            "confidence_level": request.confidence_level
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{set_id}/progress")
async def get_review_progress(set_id: str):
    """Get flashcard review progress"""

    progress = await dashboard_agent.get_review_progress(set_id)

    if not progress:
        raise HTTPException(status_code=404, detail="Flashcard set not found")

    return progress

@router.delete("/{set_id}")
async def delete_flashcard_set(set_id: str):
    """Delete flashcard set"""

    db = get_database()

    result = await db.flashcard_sets.delete_one({"_id": set_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Flashcard set not found")

    # Also delete review progress
    await db.review_progress.delete_many({"set_id": set_id})

    return {"message": "Flashcard set deleted successfully"}

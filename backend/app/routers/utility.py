from fastapi import APIRouter, HTTPException
from app.agents.utility_agent import UtilityAgent
from app.schemas.utility import BatchGenerateRequest, BatchGenerateResponse, DeleteResponse

router = APIRouter(prefix="/api/utility", tags=["utility"])
utility_agent = UtilityAgent()

@router.delete("/homework/{homework_id}", response_model=DeleteResponse)
async def delete_homework(homework_id: str):
    try:
        result = await utility_agent.delete_homework(homework_id)
        return DeleteResponse(
            message=result["message"],
            deleted_count=result["total_deleted"]
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/flashcards/{set_id}", response_model=DeleteResponse)
async def delete_flashcard_set(set_id: str):
    try:
        result = await utility_agent.delete_flashcard_set(set_id)
        return DeleteResponse(
            message=result["message"],
            deleted_count=sum(result["deleted_items"].values())
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/batch/generate-solutions", response_model=BatchGenerateResponse)
async def batch_generate_solutions(request: BatchGenerateRequest):
    try:
        result = await utility_agent.batch_generate_content(request.homework_ids)
        return BatchGenerateResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

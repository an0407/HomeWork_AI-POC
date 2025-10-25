from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
from app.agents.solution_agent import SolutionAgent
from app.schemas.solution import (
    SolutionGenerateRequest,
    SolutionResponse,
    RegenerateAudioRequest,
    SolutionDB
)
from app.database.mongodb import get_database
from app.config import settings

router = APIRouter(prefix="/api/solution", tags=["solution"])
solution_agent = SolutionAgent()

@router.post("/generate", response_model=SolutionResponse)
async def generate_solution(request: SolutionGenerateRequest):
    """Generate step-by-step solution for homework"""

    try:
        # Generate solution
        solution_data = await solution_agent.generate_solution(
            homework_id=request.homework_id,
            generate_audio=request.generate_audio,
            output_language=request.output_language
        )

        # Save to database
        solution_db = SolutionDB(
            homework_id=request.homework_id,
            **solution_data
        )

        db = get_database()
        solution_dict = solution_db.dict(by_alias=True, exclude={"id"})
        insert_result = await db.solutions.insert_one(solution_dict)

        return SolutionResponse(
            solution_id=str(insert_result.inserted_id),
            **solution_data
        )

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{solution_id}", response_model=SolutionResponse)
async def get_solution(solution_id: str):
    """Get solution details by ID"""

    db = get_database()
    solution = await db.solutions.find_one({"_id": solution_id})

    if not solution:
        raise HTTPException(status_code=404, detail="Solution not found")

    solution["solution_id"] = str(solution.pop("_id"))
    return SolutionResponse(**solution)

@router.get("/audio/{audio_filename}")
async def stream_audio(audio_filename: str):
    """Stream audio file"""

    audio_path = Path(settings.STORAGE_PATH) / "audio" / audio_filename

    if not audio_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found")

    return FileResponse(
        path=str(audio_path),
        media_type="audio/mpeg",
        filename=audio_filename
    )

@router.post("/{solution_id}/regenerate-audio")
async def regenerate_audio(solution_id: str, request: RegenerateAudioRequest):
    """Regenerate audio for existing solution in different language"""

    try:
        audio_url = await solution_agent.regenerate_audio(
            solution_id=solution_id,
            language=request.language
        )

        return {
            "audio_url": audio_url,
            "language": request.language
        }

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

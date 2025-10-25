from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.agents.homework_agent import HomeworkAgent
from app.schemas.homework import HomeworkUploadRequest, HomeworkResponse, HomeworkDB
from app.database.mongodb import get_database
from datetime import datetime

router = APIRouter(prefix="/api/homework", tags=["homework"])
homework_agent = HomeworkAgent()

@router.post("/upload", response_model=HomeworkResponse)
async def upload_homework(
    file: UploadFile = File(...),
    input_language: str = Form("en"),
    output_language: str = Form("en")
):
    """Upload homework image and extract text using OCR"""

    try:
        # Process homework
        result = await homework_agent.process_homework_upload(
            file,
            input_language,
            output_language
        )

        # Save to database
        homework_data = HomeworkDB(
            image_path=result["image_path"],
            extracted_text=result["extracted_text"],
            subject=result["subject"],
            input_language=result["input_language"],
            output_language=result["output_language"],
            status="completed"
        )

        db = get_database()
        homework_dict = homework_data.dict(by_alias=True, exclude={"id"})
        insert_result = await db.homework_submissions.insert_one(homework_dict)

        return HomeworkResponse(
            homework_id=str(insert_result.inserted_id),
            extracted_text=result["extracted_text"],
            subject=result["subject"],
            input_language=result["input_language"],
            output_language=result["output_language"],
            status="completed",
            created_at=datetime.utcnow()
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{homework_id}")
async def get_homework(homework_id: str):
    """Get homework details by ID"""

    db = get_database()
    homework = await db.homework_submissions.find_one({"_id": homework_id})

    if not homework:
        raise HTTPException(status_code=404, detail="Homework not found")

    homework["_id"] = str(homework["_id"])
    return homework

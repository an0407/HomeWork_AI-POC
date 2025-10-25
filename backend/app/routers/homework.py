from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from app.agents.homework_agent import HomeworkAgent
from app.schemas.homework import HomeworkUploadRequest, HomeworkResponse, HomeworkDB
from app.database.mongodb import get_database
from datetime import datetime

router = APIRouter(prefix="/api/homework", tags=["homework"])
homework_agent = HomeworkAgent()

@router.post("/upload", response_model=HomeworkResponse)
async def upload_homework(
    input_type: str = Form(..., description="Type of input: image, text, audio, webcam"),
    input_language: str = Form("en", description="Language of input: en, ta, hi"),
    output_language: str = Form("en", description="Language for solution: en, ta, hi"),
    file: Optional[UploadFile] = File(None, description="Image file for image/webcam input"),
    text_input: Optional[str] = Form(None, description="Text question for text input"),
    audio_file: Optional[UploadFile] = File(None, description="Audio file for voice input")
):
    """
    Unified homework submission endpoint supporting 4 input methods:
    1. Image upload - Upload photo of homework question
    2. Webcam capture - Capture photo using webcam
    3. Text input - Type the question directly
    4. Audio input - Speak the question (supports en, ta, hi)

    The endpoint will:
    - Extract/process the question from the input
    - Classify the subject (math/science/language)
    - Return homework_id for solution generation
    """

    try:
        # Validate input type
        if input_type not in ["image", "text", "audio", "webcam"]:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid input_type. Must be: image, text, audio, or webcam"
            )

        # Validate input based on type
        if input_type in ["image", "webcam"] and not file:
            raise HTTPException(
                status_code=400,
                detail=f"File is required for {input_type} input"
            )
        elif input_type == "text" and not text_input:
            raise HTTPException(
                status_code=400,
                detail="text_input is required for text input"
            )
        elif input_type == "audio" and not audio_file:
            raise HTTPException(
                status_code=400,
                detail="audio_file is required for audio input"
            )

        # Process homework using unified agent method
        result = await homework_agent.process_homework_submission(
            input_type=input_type,
            input_language=input_language,
            output_language=output_language,
            image_file=file,
            text_input=text_input,
            audio_file=audio_file
        )

        # Save to database
        homework_data = HomeworkDB(
            input_type=result["input_type"],
            image_path=result.get("image_path"),
            audio_path=result.get("audio_path"),
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
            input_type=result["input_type"],
            input_language=result["input_language"],
            output_language=result["output_language"],
            status="completed",
            created_at=datetime.utcnow()
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
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

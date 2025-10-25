from fastapi import APIRouter, HTTPException
from bson import ObjectId
from app.agents.practice_agent import PracticeAgent
from app.schemas.practice import (
    PracticeGenerateRequest,
    PracticeTestResponse,
    PracticeSubmitRequest,
    PracticeSubmitResponse,
    PracticeTestDB,
    PracticeSubmissionDB,
    Question
)
from app.database.mongodb import get_database

router = APIRouter(prefix="/api/practice", tags=["practice"])
practice_agent = PracticeAgent()

@router.post("/generate", response_model=PracticeTestResponse)
async def generate_practice_test(request: PracticeGenerateRequest):
    """Generate practice test from homework"""

    try:
        # Generate practice test
        test_data = await practice_agent.generate_practice_test(
            homework_id=request.homework_id,
            question_count=request.question_count,
            difficulty=request.difficulty,
            output_language=request.output_language
        )

        # Save to database
        test_db = PracticeTestDB(**test_data)

        db = get_database()
        test_dict = test_db.dict(by_alias=True, exclude={"id"})
        insert_result = await db.practice_tests.insert_one(test_dict)

        return PracticeTestResponse(
            test_id=str(insert_result.inserted_id),
            **test_data
        )

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{test_id}")
async def get_practice_test(test_id: str):
    """Get practice test (without answers)"""

    try:
        object_id = ObjectId(test_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid test ID format")

    db = get_database()
    test = await db.practice_tests.find_one({"_id": object_id})

    if not test:
        raise HTTPException(status_code=404, detail="Practice test not found")

    # Remove correct answers and explanations
    questions_without_answers = []
    for q in test["questions"]:
        questions_without_answers.append({
            "question_id": q["question_id"],
            "question_text": q["question_text"],
            "question_type": q["question_type"],
            "options": q.get("options"),
            "difficulty": q["difficulty"]
        })

    return {
        "test_id": str(test["_id"]),
        "homework_id": test["homework_id"],
        "topic": test["topic"],
        "subject": test["subject"],
        "output_language": test["output_language"],
        "questions": questions_without_answers,
        "created_at": test["created_at"]
    }

@router.post("/{test_id}/submit", response_model=PracticeSubmitResponse)
async def submit_practice_test(test_id: str, request: PracticeSubmitRequest):
    """Submit practice test answers and get results"""

    try:
        # Grade test
        result_data = await practice_agent.submit_practice_test(
            test_id=test_id,
            answers=[a.dict() for a in request.answers],
            time_taken_seconds=request.time_taken_seconds
        )

        # Save submission
        submission_db = PracticeSubmissionDB(
            test_id=test_id,
            answers=[{
                "question_id": r["question_id"],
                "user_answer": r["user_answer"],
                "is_correct": r["is_correct"]
            } for r in result_data["results"]],
            score=result_data["score"],
            correct=result_data["correct"],
            total_questions=result_data["total_questions"],
            time_taken_seconds=result_data["time_taken_seconds"]
        )

        db = get_database()
        submission_dict = submission_db.dict(by_alias=True, exclude={"id"})
        insert_result = await db.practice_submissions.insert_one(submission_dict)

        return PracticeSubmitResponse(
            submission_id=str(insert_result.inserted_id),
            **result_data
        )

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{test_id}/results/{submission_id}")
async def get_detailed_results(test_id: str, submission_id: str):
    """Get detailed results for a submission"""

    try:
        test_object_id = ObjectId(test_id)
        submission_object_id = ObjectId(submission_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    db = get_database()

    # Get test
    test = await db.practice_tests.find_one({"_id": test_object_id})
    if not test:
        raise HTTPException(status_code=404, detail="Practice test not found")

    # Get submission
    submission = await db.practice_submissions.find_one({"_id": submission_object_id})
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    # Build detailed results
    detailed_results = []
    for answer in submission["answers"]:
        question = next(
            (q for q in test["questions"] if q["question_id"] == answer["question_id"]),
            None
        )

        if question:
            detailed_results.append({
                "question": question["question_text"],
                "question_type": question["question_type"],
                "options": question.get("options"),
                "user_answer": answer["user_answer"],
                "correct_answer": question["correct_answer"],
                "is_correct": answer["is_correct"],
                "explanation": question["explanation"]
            })

    return {
        "test_id": test_id,
        "submission_id": submission_id,
        "topic": test["topic"],
        "subject": test["subject"],
        "score": submission["score"],
        "correct": submission["correct"],
        "total": submission["total_questions"],
        "time_taken_seconds": submission["time_taken_seconds"],
        "detailed_results": detailed_results,
        "submitted_at": submission["submitted_at"]
    }

@router.get("/history")
async def get_practice_history(limit: int = 10, skip: int = 0):
    """Get practice test submission history"""

    db = get_database()

    submissions = await db.practice_submissions.find()\
        .sort("submitted_at", -1)\
        .skip(skip)\
        .limit(limit)\
        .to_list(length=limit)

    total = await db.practice_submissions.count_documents({})

    # Enrich with test details
    for submission in submissions:
        try:
            # Convert test_id to ObjectId if it's a string
            test_id = submission["test_id"]
            if isinstance(test_id, str):
                test_id = ObjectId(test_id)
            test = await db.practice_tests.find_one({"_id": test_id})
            if test:
                submission["topic"] = test["topic"]
                submission["subject"] = test["subject"]
        except Exception:
            pass  # Skip if invalid test_id
        submission["_id"] = str(submission["_id"])

    return {
        "practice_history": submissions,
        "total": total
    }

from fastapi import APIRouter, HTTPException
from app.agents.feedback_agent import FeedbackAgent
from app.schemas.feedback import FeedbackSubmit, FeedbackResponse, SolutionFeedbackSummary

router = APIRouter(prefix="/api/feedback", tags=["feedback"])
feedback_agent = FeedbackAgent()


@router.post("/submit", response_model=FeedbackResponse)
async def submit_feedback(feedback: FeedbackSubmit):
    try:
        result = await feedback_agent.submit_feedback(
            solution_id=feedback.solution_id,
            rating=feedback.rating,
            feedback_text=feedback.feedback_text,
            was_helpful=feedback.was_helpful,
            issues=feedback.issues or []
        )
        return FeedbackResponse(
            feedback_id=result["feedback_id"],
            message="Thank you for your feedback!",
            average_rating=result["average_rating"]
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/solution/{solution_id}", response_model=SolutionFeedbackSummary)
async def get_solution_feedback(solution_id: str):
    try:
        summary = await feedback_agent.get_solution_feedback(solution_id)
        return SolutionFeedbackSummary(**summary)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from bson import ObjectId

class FeedbackSubmit(BaseModel):
    """Feedback submission request"""
    solution_id: str
    rating: int = Field(..., ge=1, le=5, description="Rating from 1-5 stars")
    feedback_text: Optional[str] = Field(default=None, max_length=1000)
    was_helpful: bool
    issues: Optional[List[str]] = None

    @validator('issues')
    def validate_issues(cls, v):
        if v is not None:
            valid_issues = [
                "incorrect_answer",
                "unclear_explanation",
                "too_advanced",
                "too_simple",
                "language_error",
                "other"
            ]
            for issue in v:
                if issue not in valid_issues:
                    raise ValueError(f"Invalid issue type: {issue}")
        return v


class FeedbackResponse(BaseModel):
    """Feedback submission response"""
    feedback_id: str
    message: str
    average_rating: Optional[float] = None


class FeedbackDB(BaseModel):
    """Database model for feedback"""
    id: Optional[str] = Field(alias="_id", default=None)
    solution_id: str
    rating: int
    feedback_text: Optional[str] = None
    was_helpful: bool
    issues: Optional[List[str]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class SolutionFeedbackSummary(BaseModel):
    """Aggregated feedback for a solution"""
    solution_id: str
    average_rating: float
    total_feedback: int
    helpful_count: int
    recent_feedback: List[dict] = []

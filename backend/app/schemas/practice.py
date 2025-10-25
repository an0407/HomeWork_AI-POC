from pydantic import BaseModel, Field, validator
from typing import List, Optional, Literal
from datetime import datetime
from bson import ObjectId

class Question(BaseModel):
    question_id: str
    question_text: str
    question_type: Literal["mcq", "fill_blank", "true_false"]
    options: Optional[List[str]] = None
    correct_answer: str
    explanation: str
    difficulty: Literal["easy", "medium", "hard"] = "medium"

class PracticeGenerateRequest(BaseModel):
    homework_id: str
    question_count: int = 5
    difficulty: Literal["easy", "medium", "hard"] = "medium"
    output_language: Literal["en", "ta", "hi"] = "en"

    @validator('question_count')
    def validate_question_count(cls, v):
        if v < 1 or v > 20:
            raise ValueError('question_count must be between 1 and 20')
        return v

class PracticeTestResponse(BaseModel):
    test_id: str
    topic: str
    subject: str
    output_language: str
    questions: List[Question]
    created_at: datetime

class AnswerSubmission(BaseModel):
    question_id: str
    user_answer: str

class PracticeSubmitRequest(BaseModel):
    answers: List[AnswerSubmission]
    time_taken_seconds: int = 0

class ResultDetail(BaseModel):
    question_id: str
    question_text: str
    question_type: str
    options: Optional[List[str]]
    user_answer: str
    correct_answer: str
    is_correct: bool
    explanation: str

class PracticeSubmitResponse(BaseModel):
    submission_id: str
    score: float
    correct: int
    total: int
    time_taken_seconds: int
    results: List[ResultDetail]
    submitted_at: datetime

class PracticeTestDB(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    homework_id: str
    topic: str
    subject: str
    output_language: str
    questions: List[Question]
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class PracticeSubmissionDB(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    test_id: str
    answers: List[dict]
    score: float
    correct: int
    total_questions: int
    time_taken_seconds: int
    submitted_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

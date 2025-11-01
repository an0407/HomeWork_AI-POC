from pydantic import BaseModel, Field, validator
from typing import List, Optional, Literal
from datetime import datetime
from bson import ObjectId

class SolutionStep(BaseModel):
    step_number: int
    explanation: str
    formula_used: Optional[str] = None

class SolutionGenerateRequest(BaseModel):
    homework_id: str
    generate_audio: bool = False
    output_language: Literal["en", "ta", "hi"] = "en"
    audio_language: Optional[Literal["en", "ta", "hi"]] = None

class RegenerateAudioRequest(BaseModel):
    language: Literal["en", "ta", "hi"]

class SolutionResponse(BaseModel):
    solution_id: str
    homework_id: str
    question: str
    subject: str
    solution_steps: List[SolutionStep]
    final_answer: str
    concepts_covered: List[str]
    audio_url: Optional[str] = None
    output_language: str
    created_at: datetime

class SolutionDB(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    homework_id: str
    question: str
    subject: str
    solution_steps: List[SolutionStep]
    final_answer: str
    concepts_covered: List[str]
    audio_url: Optional[str] = None
    output_language: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

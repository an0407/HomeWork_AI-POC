from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime
from bson import ObjectId

class Flashcard(BaseModel):
    card_id: str
    front: str
    back: str
    difficulty: Literal["easy", "medium", "hard"] = "medium"

class FlashcardGenerateRequest(BaseModel):
    homework_id: str
    output_language: Literal["en", "ta", "hi"] = "en"

class FlashcardSetResponse(BaseModel):
    set_id: str
    title: str
    subject: str
    output_language: str
    cards: List[Flashcard]
    total_cards: int
    created_at: datetime

class ReviewProgressRequest(BaseModel):
    card_id: str
    confidence_level: int = Field(..., ge=1, le=5)
    time_taken_seconds: int

class FlashcardSetDB(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    homework_id: str
    title: str
    subject: str
    output_language: str
    cards: List[Flashcard]
    total_cards: int
    last_reviewed: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class ReviewProgressDB(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    set_id: str
    card_id: str
    confidence_level: int
    time_taken_seconds: int
    reviewed_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

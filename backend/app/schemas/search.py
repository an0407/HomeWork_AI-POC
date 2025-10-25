from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime

class HomeworkSearchRequest(BaseModel):
    """Request model for homework search"""
    query: Optional[str] = None
    subject: Optional[Literal["math", "science", "language"]] = None
    date_from: Optional[str] = None  # ISO format date string
    date_to: Optional[str] = None
    limit: int = Field(default=20, ge=1, le=100)
    skip: int = Field(default=0, ge=0)

class HomeworkSearchResult(BaseModel):
    """Single homework search result"""
    homework_id: str
    extracted_text: str
    subject: str
    input_language: str
    output_language: str
    has_solution: bool
    created_at: datetime

class HomeworkSearchResponse(BaseModel):
    """Response model for homework search"""
    homework: List[HomeworkSearchResult]
    total: int
    page: int
    total_pages: int

class FlashcardSearchRequest(BaseModel):
    """Request model for flashcard search"""
    query: Optional[str] = None
    subject: Optional[Literal["math", "science", "language"]] = None
    limit: int = Field(default=20, ge=1, le=100)

class FlashcardSearchResult(BaseModel):
    """Single flashcard set search result"""
    set_id: str
    title: str
    subject: str
    output_language: str
    total_cards: int
    created_at: datetime

class FlashcardSearchResponse(BaseModel):
    """Response model for flashcard search"""
    flashcard_sets: List[FlashcardSearchResult]
    total: int

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class SubjectCount(BaseModel):
    subject: str
    count: int

class DashboardStats(BaseModel):
    total_homework: int
    total_solutions: int
    practice_tests_taken: int
    flashcard_sets: int
    subjects: List[SubjectCount]
    recent_activity: int
    average_practice_score: Optional[float] = None

class RecentHomeworkItem(BaseModel):
    homework_id: str
    extracted_text: str
    subject: str
    input_language: str
    output_language: str
    has_solution: bool
    solution_id: Optional[str]
    has_practice_test: bool
    has_flashcards: bool
    created_at: datetime

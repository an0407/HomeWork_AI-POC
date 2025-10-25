from pydantic import BaseModel, Field
from typing import Literal, Optional
from datetime import datetime
from bson import ObjectId


class UserPreferences(BaseModel):
    language: Literal["en", "ta", "hi"] = "en"
    voice_language: Literal["en", "ta", "hi"] = "en"
    difficulty_preference: Literal["auto", "easy", "medium", "hard"] = "auto"
    grade_level: Optional[int] = Field(default=5, ge=1, le=12)
    auto_generate_audio: bool = False
    auto_generate_flashcards: bool = False
    practice_question_count: int = Field(default=5, ge=1, le=20)
    theme: Literal["light", "dark"] = "light"


class PreferencesResponse(BaseModel):
    preferences: UserPreferences
    updated_at: Optional[datetime] = None


class PreferencesDB(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    is_default: bool = True
    language: str
    voice_language: str
    difficulty_preference: str
    grade_level: int
    auto_generate_audio: bool
    auto_generate_flashcards: bool
    practice_question_count: int
    theme: str
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class LanguageInfo(BaseModel):
    code: str
    name: str

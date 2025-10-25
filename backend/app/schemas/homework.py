from pydantic import BaseModel, Field, validator
from typing import Optional, Literal
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")

class HomeworkUploadRequest(BaseModel):
    input_language: Literal["en", "ta", "hi"] = "en"
    output_language: Literal["en", "ta", "hi"] = "en"

class HomeworkResponse(BaseModel):
    homework_id: str
    extracted_text: str
    subject: str
    input_language: str
    output_language: str
    status: str
    created_at: datetime

class HomeworkDB(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    image_path: str
    extracted_text: str
    subject: str
    input_language: str
    output_language: str
    status: str = "completed"
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

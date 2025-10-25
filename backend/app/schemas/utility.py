from pydantic import BaseModel, Field
from typing import List

class BatchGenerateRequest(BaseModel):
    homework_ids: List[str] = Field(..., min_items=1, max_items=10)

class BatchResultItem(BaseModel):
    homework_id: str
    status: str  # "success", "skipped", "failed"
    message: str
    solution_id: str = None
    error: str = None

class BatchGenerateResponse(BaseModel):
    results: List[BatchResultItem]
    total_processed: int
    successful: int
    failed: int
    skipped: int

class DeleteResponse(BaseModel):
    message: str
    deleted_count: int = 1

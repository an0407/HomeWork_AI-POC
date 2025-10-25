from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from app.database.mongodb import connect_to_mongo, close_mongo_connection
from app.routers import homework, solution, practice, flashcard, dashboard
from app.config import settings

app = FastAPI(
    title="AI Homework Assistant - Phase 1 & 2",
    description="Homework upload, OCR, solution generation, TTS, practice tests, flashcards, and analytics",
    version="2.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database events
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

# Mount static files for audio
audio_path = Path(settings.STORAGE_PATH) / "audio"
audio_path.mkdir(parents=True, exist_ok=True)
app.mount("/audio", StaticFiles(directory=str(audio_path)), name="audio")

# Include routers
app.include_router(homework.router)
app.include_router(solution.router)
app.include_router(practice.router)
app.include_router(flashcard.router)
app.include_router(dashboard.router)

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "AI Homework Assistant API - Phase 1 & 2",
        "version": "2.0.0",
        "phases": ["Core Homework Flow", "Learning Content Generation"],
        "endpoints": {
            "phase1": [
                "POST /api/homework/upload",
                "GET /api/homework/{homework_id}",
                "POST /api/solution/generate",
                "GET /api/solution/{solution_id}",
                "GET /api/solution/audio/{audio_filename}",
                "POST /api/solution/{solution_id}/regenerate-audio"
            ],
            "phase2": [
                "POST /api/practice/generate",
                "GET /api/practice/{test_id}",
                "POST /api/practice/{test_id}/submit",
                "GET /api/practice/{test_id}/results/{submission_id}",
                "GET /api/practice/history",
                "POST /api/flashcards/generate",
                "GET /api/flashcards/library",
                "GET /api/flashcards/{set_id}",
                "POST /api/flashcards/{set_id}/review",
                "GET /api/flashcards/{set_id}/progress",
                "DELETE /api/flashcards/{set_id}",
                "GET /api/dashboard/stats",
                "GET /api/dashboard/recent-homework",
                "GET /api/dashboard/subjects"
            ]
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "phases": [1, 2]}

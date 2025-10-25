from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from app.database.mongodb import connect_to_mongo, close_mongo_connection
from app.config import settings

app = FastAPI(
    title="AI Homework Assistant - Phase 1",
    description="Homework upload, OCR, solution generation, and TTS",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

'''# Database events
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()'''

# Mount static files for audio
audio_path = Path(settings.STORAGE_PATH) / "audio"
audio_path.mkdir(parents=True, exist_ok=True)
app.mount("/audio", StaticFiles(directory=str(audio_path)), name="audio")

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

    # Import routers after MongoDB is connected
    from app.routers import homework, solution, settings_route, feedback, search
    app.include_router(homework.router)
    app.include_router(solution.router)
    app.include_router(settings_route.router)
    app.include_router(feedback.router)
    app.include_router(search.router)

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "AI Homework Assistant API - Phase 1",
        "version": "1.0.0",
        "phase": "Core Homework Flow",
        "endpoints": [
            "POST /api/homework/upload",
            "GET /api/homework/{homework_id}",
            "POST /api/solution/generate",
            "GET /api/solution/{solution_id}",
            "GET /api/solution/audio/{audio_filename}",
            "POST /api/solution/{solution_id}/regenerate-audio"
        ]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "phase": 1}

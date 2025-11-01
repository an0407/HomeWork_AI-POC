from fastapi import FastAPI, Request, status
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pathlib import Path
import traceback
import logging
from app.database.mongodb import connect_to_mongo, close_mongo_connection
from app.routers import homework, solution, practice, flashcard, dashboard, utility, feedback, search, settings_route
from app.config import settings

# Configure detailed logging
logging.basicConfig(
    level=logging.INFO,  # Set base level to INFO
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Set application logger to DEBUG
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# Suppress noisy MongoDB heartbeat logs
logging.getLogger('pymongo.topology').setLevel(logging.WARNING)
logging.getLogger('pymongo.connection').setLevel(logging.WARNING)
logging.getLogger('pymongo.server').setLevel(logging.WARNING)

# Keep application logs at DEBUG
logging.getLogger('app').setLevel(logging.DEBUG)

app = FastAPI(
    title="AI Homework Assistant - Phase 1, 2 & 4",
    description="Homework upload, OCR, solution generation, TTS, practice tests, flashcards, and analytics",
    version="2.0.0",
    debug=True  # Enable debug mode for detailed errors
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom exception handlers for detailed error messages
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch all exceptions and return detailed error information"""

    # Log the full error with traceback
    logger.error(f"Exception on {request.method} {request.url}")
    logger.error(f"Error: {str(exc)}")
    logger.error(traceback.format_exc())

    # Return detailed error response
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": str(exc),
            "type": type(exc).__name__,
            "traceback": traceback.format_exc().split('\n'),
            "path": str(request.url),
            "method": request.method
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors with detailed information"""

    logger.error(f"Validation error on {request.method} {request.url}")
    logger.error(f"Errors: {exc.errors()}")

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation Error",
            "errors": exc.errors(),
            "body": str(exc.body) if hasattr(exc, 'body') else None,
            "path": str(request.url),
            "method": request.method
        }
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

# Include all routers at module level
app.include_router(homework.router)
app.include_router(solution.router)
app.include_router(practice.router)
app.include_router(flashcard.router)
app.include_router(feedback.router)
app.include_router(search.router)
app.include_router(settings_route.router)
app.include_router(dashboard.router)
app.include_router(utility.router)

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "AI Homework Assistant API - Phase 1, 2 & 4",
        "version": "2.0.0",
        "phases": ["Core Homework Flow", "Learning Content Generation", "Utility & Management APIs"],
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
            ],
            "phase4": [
                "DELETE /api/utility/homework/{homework_id}",
                "DELETE /api/utility/flashcards/{set_id}",
                "POST /api/utility/batch/generate-solutions"
            ]
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "phases": [1, 2, 4]}

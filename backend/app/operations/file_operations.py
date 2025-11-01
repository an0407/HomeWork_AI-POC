import os
import uuid
import shutil
from pathlib import Path
from fastapi import UploadFile, HTTPException
from app.utils.constants import MAX_FILE_SIZE, ALLOWED_EXTENSIONS

class FileOperations:
    """Non-AI file handling operations"""

    @staticmethod
    def validate_image_file(file: UploadFile) -> None:
        """Validate uploaded image file"""
        # Check file extension
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
            )

    @staticmethod
    async def save_upload_file(file: UploadFile, storage_path: str) -> str:
        """
        Save uploaded file to storage

        Args:
            file: Uploaded file
            storage_path: Base storage path

        Returns:
            Full path to saved file
        """
        # Create uploads directory if it doesn't exist
        upload_dir = Path(storage_path) / "uploads"
        upload_dir.mkdir(parents=True, exist_ok=True)

        # Generate unique filename
        file_ext = Path(file.filename).suffix
        filename = f"{uuid.uuid4()}{file_ext}"
        file_path = upload_dir / filename

        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return str(file_path)

    @staticmethod
    def ensure_audio_directory(storage_path: str) -> Path:
        """Ensure audio directory exists"""
        audio_dir = Path(storage_path) / "audio"
        audio_dir.mkdir(parents=True, exist_ok=True)
        return audio_dir

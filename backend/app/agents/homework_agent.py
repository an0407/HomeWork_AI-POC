from fastapi import UploadFile
from typing import Dict, Optional
from app.operations.file_operations import FileOperations
from app.operations.image_processor import ImageProcessor
from app.operations.audio_processor import AudioProcessor
from app.utils.constants import SUPPORTED_LANGUAGES
from app.config import settings

class HomeworkAgent:
    """Main agent for homework processing with multi-input support"""

    def __init__(self):
        self.file_ops = FileOperations()
        self.image_processor = ImageProcessor()
        self.audio_processor = AudioProcessor()

    async def process_homework_submission(
        self,
        input_type: str,
        input_language: str,
        output_language: str,
        image_file: Optional[UploadFile] = None,
        text_input: Optional[str] = None,
        audio_file: Optional[UploadFile] = None
    ) -> Dict:
        """
        Unified homework processing for all input types

        Args:
            input_type: Type of input (image, text, audio, webcam)
            input_language: Language of input
            output_language: Language for output
            image_file: Image file (for image/webcam)
            text_input: Text question (for text)
            audio_file: Audio file (for audio)

        Returns:
            Dict with extracted_text, subject, and input-specific paths
        """
        if input_type in ["image", "webcam"]:
            return await self._process_image_input(
                image_file, input_language, output_language, input_type
            )
        elif input_type == "text":
            return await self._process_text_input(
                text_input, input_language, output_language
            )
        elif input_type == "audio":
            return await self._process_audio_input(
                audio_file, input_language, output_language
            )
        else:
            raise ValueError(f"Unsupported input type: {input_type}")

    async def _process_image_input(
        self,
        file: UploadFile,
        input_language: str,
        output_language: str,
        input_type: str
    ) -> Dict:
        """Process image or webcam input"""
        # Validate file
        self.file_ops.validate_image_file(file)

        # Save uploaded file
        image_path = await self.file_ops.save_upload_file(
            file,
            settings.STORAGE_PATH
        )

        # Get tesseract language code
        tesseract_code = SUPPORTED_LANGUAGES[input_language]["tesseract_code"]

        # Extract text using OCR
        extracted_text = self.image_processor.extract_text_with_tesseract(
            image_path,
            tesseract_code
        )

        # Classify subject
        subject = self.image_processor.classify_subject(extracted_text)

        return {
            "input_type": input_type,
            "image_path": image_path,
            "audio_path": None,
            "extracted_text": extracted_text,
            "subject": subject,
            "input_language": input_language,
            "output_language": output_language
        }

    async def _process_text_input(
        self,
        text_input: str,
        input_language: str,
        output_language: str
    ) -> Dict:
        """Process typed text input"""
        if not text_input or text_input.strip() == "":
            raise ValueError("Text input cannot be empty")

        # For text input, we assume it's already in English or will be handled by AI
        # Classify subject based on text
        subject = self.image_processor.classify_subject(text_input)

        return {
            "input_type": "text",
            "image_path": None,
            "audio_path": None,
            "extracted_text": text_input.strip(),
            "subject": subject,
            "input_language": input_language,
            "output_language": output_language
        }

    async def _process_audio_input(
        self,
        audio_file: UploadFile,
        input_language: str,
        output_language: str
    ) -> Dict:
        """Process voice/audio input"""
        # Save audio file
        audio_path = await self.file_ops.save_upload_file(
            audio_file,
            settings.STORAGE_PATH
        )

        # Process audio: transcribe + translate if needed
        # This will handle: audio → text (original lang) → English (if needed)
        extracted_text = self.audio_processor.process_audio_input(
            audio_path,
            input_language
        )

        # Classify subject
        subject = self.image_processor.classify_subject(extracted_text)

        return {
            "input_type": "audio",
            "image_path": None,
            "audio_path": audio_path,
            "extracted_text": extracted_text,
            "subject": subject,
            "input_language": input_language,
            "output_language": output_language
        }

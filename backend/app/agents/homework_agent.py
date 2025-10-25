from fastapi import UploadFile
from typing import Dict
from app.operations.file_operations import FileOperations
from app.operations.image_processor import ImageProcessor
from app.utils.constants import SUPPORTED_LANGUAGES
from app.config import settings

class HomeworkAgent:
    """Main agent for homework processing"""

    def __init__(self):
        self.file_ops = FileOperations()
        self.image_processor = ImageProcessor()

    async def process_homework_upload(
        self,
        file: UploadFile,
        input_language: str,
        output_language: str
    ) -> Dict:
        """
        Process uploaded homework image

        Args:
            file: Uploaded image file
            input_language: Language of text in image
            output_language: Language for output

        Returns:
            Dict with extracted_text, subject, image_path
        """
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
            "image_path": image_path,
            "extracted_text": extracted_text,
            "subject": subject,
            "input_language": input_language,
            "output_language": output_language
        }

import cv2
import numpy as np
from PIL import Image
import pytesseract
from pathlib import Path

class ImageProcessor:
    """Non-AI image processing operations"""

    @staticmethod
    def preprocess_image(image_path: str) -> np.ndarray:
        """
        Preprocess image for better OCR accuracy
        - Convert to grayscale
        - Apply denoising
        - Apply adaptive thresholding
        - Deskew if needed
        """
        # Read image
        img = cv2.imread(image_path)

        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)

        # Apply adaptive thresholding
        thresh = cv2.adaptiveThreshold(
            blurred, 255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY,
            11, 2
        )

        # Denoise
        denoised = cv2.fastNlMeansDenoising(thresh, None, 10, 7, 21)

        return denoised

    @staticmethod
    def extract_text_with_tesseract(image_path: str, language_code: str) -> str:
        """
        Extract text from image using Tesseract OCR

        Args:
            image_path: Path to image file
            language_code: Tesseract language code (eng, tam, hin)

        Returns:
            Extracted text
        """
        # Preprocess image
        processed_img = ImageProcessor.preprocess_image(image_path)

        # Convert back to PIL Image for tesseract
        pil_img = Image.fromarray(processed_img)

        # Configure tesseract
        custom_config = f'--oem 3 --psm 6 -l {language_code}'

        # Extract text
        text = pytesseract.image_to_string(pil_img, config=custom_config)

        return text.strip()

    @staticmethod
    def classify_subject(text: str) -> str:
        """
        Classify subject based on keywords in extracted text

        Args:
            text: Extracted text from image

        Returns:
            Subject: "math", "science", or "language"
        """
        from app.utils.constants import SUBJECT_KEYWORDS

        text_lower = text.lower()

        # Count keyword matches for each subject
        subject_scores = {}
        for subject, keywords in SUBJECT_KEYWORDS.items():
            score = sum(1 for keyword in keywords if keyword.lower() in text_lower)
            subject_scores[subject] = score

        # Return subject with highest score
        if max(subject_scores.values()) == 0:
            return "language"  # Default

        return max(subject_scores, key=subject_scores.get)

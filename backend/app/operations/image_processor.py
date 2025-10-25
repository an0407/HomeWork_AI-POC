import cv2
import numpy as np
from PIL import Image
import pytesseract
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class ImageProcessor:
    """Image processing operations with OCR fallback support"""

    def __init__(self):
        """Initialize ImageProcessor with lazy-loaded EasyOCR reader"""
        self._easyocr_reader = None

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

    def _get_easyocr_reader(self):
        """Lazy-load EasyOCR reader to avoid startup overhead"""
        if self._easyocr_reader is None:
            try:
                # Import easyocr only when needed (lazy import)
                import easyocr
                logger.info("Initializing EasyOCR reader (first use only)...")
                self._easyocr_reader = easyocr.Reader(['en'], gpu=False, verbose=False)
                logger.info("EasyOCR reader initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize EasyOCR: {str(e)}")
                raise
        return self._easyocr_reader

    def extract_text_with_pix2text(self, image_path: str) -> str:
        """
        Extract text and mathematical equations using Pix2Text

        Pix2Text is specifically designed for:
        - Mathematical equations (returns LaTeX)
        - Mixed content (text + math)
        - Printed and handwritten content

        Args:
            image_path: Path to image file

        Returns:
            Extracted text with LaTeX for math equations
        """
        try:
            # Lazy import to avoid loading models at startup
            from pix2text import Pix2Text

            logger.info("Initializing Pix2Text...")
            # Initialize with English language
            # First run will download models (~100MB one-time)
            p2t = Pix2Text(languages='en')

            logger.info(f"Extracting text with Pix2Text from {image_path}...")
            result = p2t(image_path)

            # Pix2Text returns text directly or dict with 'text' key
            if isinstance(result, dict):
                text = result.get('text', '')
            else:
                text = str(result)

            logger.info(f"Pix2Text extracted {len(text)} characters")
            return text.strip()

        except Exception as e:
            logger.error(f"Pix2Text extraction failed: {str(e)}")
            return ""

    def extract_text_with_easyocr(self, image_path: str) -> str:
        """
        Extract text from image using EasyOCR (better for handwritten text)

        Args:
            image_path: Path to image file

        Returns:
            Extracted text
        """
        try:
            # Get EasyOCR reader
            reader = self._get_easyocr_reader()

            # Read image
            img = cv2.imread(image_path)

            # Extract text with EasyOCR
            results = reader.readtext(img, detail=0, paragraph=True)

            # Combine results
            text = "\n".join(results)

            logger.info(f"EasyOCR extracted {len(text)} characters from {image_path}")
            return text.strip()

        except Exception as e:
            logger.error(f"EasyOCR extraction failed: {str(e)}")
            return ""

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
        try:
            # Preprocess image
            processed_img = ImageProcessor.preprocess_image(image_path)

            # Convert back to PIL Image for tesseract
            pil_img = Image.fromarray(processed_img)

            # Configure tesseract
            custom_config = f'--oem 3 --psm 6 -l {language_code}'

            # Extract text
            text = pytesseract.image_to_string(pil_img, config=custom_config)

            logger.info(f"Tesseract extracted {len(text.strip())} characters")
            return text.strip()

        except Exception as e:
            logger.error(f"Tesseract extraction failed: {str(e)}")
            return ""

    def extract_text_with_multiple_psm_modes(self, image_path: str, language_code: str) -> str:
        """
        Try multiple Tesseract PSM modes for better handwriting recognition

        PSM modes:
        - PSM 6: Uniform block of text (default, good for printed text)
        - PSM 3: Fully automatic page segmentation
        - PSM 11: Sparse text, find as much text as possible (better for handwriting)
        - PSM 13: Raw line, treat image as single text line

        Args:
            image_path: Path to image file
            language_code: Tesseract language code (eng, tam, hin)

        Returns:
            Longest extracted text from all PSM modes
        """
        try:
            # Read original image (no preprocessing for alternative modes)
            img = cv2.imread(image_path)
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            pil_img_raw = Image.fromarray(gray)

            # Preprocess image for PSM 6
            processed_img = ImageProcessor.preprocess_image(image_path)
            pil_img_processed = Image.fromarray(processed_img)

            results = {}

            # Try PSM 6 with preprocessing (default, good for printed text)
            try:
                config = f'--oem 3 --psm 6 -l {language_code}'
                text = pytesseract.image_to_string(pil_img_processed, config=config)
                results['PSM 6 (processed)'] = text.strip()
                logger.info(f"PSM 6 (processed): {len(results['PSM 6 (processed)'])} characters")
            except Exception as e:
                logger.warning(f"PSM 6 (processed) failed: {e}")

            # Try PSM 3 with raw image (auto page segmentation)
            try:
                config = f'--oem 3 --psm 3 -l {language_code}'
                text = pytesseract.image_to_string(pil_img_raw, config=config)
                results['PSM 3 (raw)'] = text.strip()
                logger.info(f"PSM 3 (raw): {len(results['PSM 3 (raw)'])} characters")
            except Exception as e:
                logger.warning(f"PSM 3 (raw) failed: {e}")

            # Try PSM 11 with raw image (sparse text, best for handwriting)
            try:
                config = f'--oem 3 --psm 11 -l {language_code}'
                text = pytesseract.image_to_string(pil_img_raw, config=config)
                results['PSM 11 (raw)'] = text.strip()
                logger.info(f"PSM 11 (raw): {len(results['PSM 11 (raw)'])} characters")
            except Exception as e:
                logger.warning(f"PSM 11 (raw) failed: {e}")

            # Try PSM 13 with raw image (single line)
            try:
                config = f'--oem 3 --psm 13 -l {language_code}'
                text = pytesseract.image_to_string(pil_img_raw, config=config)
                results['PSM 13 (raw)'] = text.strip()
                logger.info(f"PSM 13 (raw): {len(results['PSM 13 (raw)'])} characters")
            except Exception as e:
                logger.warning(f"PSM 13 (raw) failed: {e}")

            # Return the longest non-empty result
            if results:
                best_mode = max(results, key=lambda k: len(results[k]))
                best_text = results[best_mode]
                logger.info(f"✅ Best result from {best_mode}: {len(best_text)} characters")
                return best_text
            else:
                logger.error("❌ All PSM modes failed")
                return ""

        except Exception as e:
            logger.error(f"Error in multi-PSM extraction: {str(e)}")
            return ""

    def extract_text_with_ocr_fallback(self, image_path: str, language_code: str) -> str:
        """
        Extract text from image with automatic fallback strategy

        Strategy (optimized for math equations and handwriting):
        1. PRIMARY: Try Pix2Text (best for math equations + mixed content)
        2. FALLBACK 1: If Pix2Text fails, try EasyOCR (good for handwriting)
        3. FALLBACK 2: If both fail, try Tesseract multi-PSM modes
        4. Return the longest extraction from all attempts

        Args:
            image_path: Path to image file
            language_code: Tesseract language code (eng, tam, hin)

        Returns:
            Extracted text (with LaTeX for math equations if present)
        """
        MIN_CHARS_THRESHOLD = 10
        logger.info(f"Attempting OCR extraction for {image_path}")

        # PRIMARY: Try Pix2Text first (best for math equations)
        pix2text_result = ""
        try:
            logger.info("Trying Pix2Text (primary method - best for math)...")
            pix2text_result = self.extract_text_with_pix2text(image_path)

            # If Pix2Text extracted enough text, return it immediately
            if len(pix2text_result) >= MIN_CHARS_THRESHOLD:
                logger.info(f"✅ Pix2Text successful: {len(pix2text_result)} characters")
                return pix2text_result

            logger.warning(f"⚠️ Pix2Text extracted only {len(pix2text_result)} characters (< {MIN_CHARS_THRESHOLD}), trying EasyOCR...")

        except Exception as e:
            logger.warning(f"⚠️ Pix2Text failed: {str(e)}, falling back to EasyOCR...")
            pix2text_result = ""

        # FALLBACK 1: Try EasyOCR (better for handwriting)
        easyocr_text = ""
        try:
            logger.info("Trying EasyOCR (fallback 1 - better for handwriting)...")
            easyocr_text = self.extract_text_with_easyocr(image_path)

            # If EasyOCR extracted enough text, return it
            if len(easyocr_text) >= MIN_CHARS_THRESHOLD:
                logger.info(f"✅ EasyOCR successful: {len(easyocr_text)} characters")
                return easyocr_text

            logger.warning(f"⚠️ EasyOCR extracted only {len(easyocr_text)} characters (< {MIN_CHARS_THRESHOLD}), trying Tesseract...")

        except Exception as e:
            logger.warning(f"⚠️ EasyOCR failed: {str(e)}, falling back to Tesseract...")
            easyocr_text = ""

        # FALLBACK 2: Try Tesseract multi-PSM modes (final attempt)
        logger.info("Trying Tesseract multi-PSM modes (fallback 2 - final attempt)...")
        tesseract_text = self.extract_text_with_multiple_psm_modes(image_path, language_code)

        # Return the longest extraction from all attempts
        all_results = [
            ("Pix2Text", pix2text_result),
            ("EasyOCR", easyocr_text),
            ("Tesseract multi-PSM", tesseract_text)
        ]

        # Filter out empty results and find the longest
        non_empty_results = [(method, text) for method, text in all_results if text]

        if non_empty_results:
            best_method, best_text = max(non_empty_results, key=lambda x: len(x[1]))
            logger.info(f"✅ Best result from {best_method}: {len(best_text)} characters")
            return best_text
        else:
            logger.error(f"❌ All OCR methods (Pix2Text, EasyOCR, Tesseract) failed to extract text from {image_path}")
            return ""

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

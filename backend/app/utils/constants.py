# Supported languages
SUPPORTED_LANGUAGES = {
    "en": {"name": "English", "tesseract_code": "eng"},
    "ta": {"name": "Tamil", "tesseract_code": "tam"},
    "hi": {"name": "Hindi", "tesseract_code": "hin"}
}

# Subject classification keywords
SUBJECT_KEYWORDS = {
    "math": ["solve", "equation", "calculate", "add", "subtract", "multiply", "divide",
             "+", "-", "×", "÷", "=", "sum", "difference", "product", "quotient",
             "கூட்டல்", "கழித்தல்", "பெருக்கல்", "வகுத்தல்",  # Tamil
             "जोड़", "घटाना", "गुणा", "भाग"],  # Hindi

    "science": ["cell", "atom", "energy", "force", "experiment", "matter", "chemical",
                "biology", "physics", "chemistry", "reaction", "organism",
                "அணு", "ஆற்றல்", "விசை", "சோதனை",  # Tamil
                "कोशिका", "परमाणु", "ऊर्जा", "बल"],  # Hindi

    "language": ["write", "essay", "paragraph", "grammar", "verb", "noun", "sentence",
                 "poem", "story", "reading", "writing",
                 "எழுது", "கட்டுரை", "வாக்கியம்",  # Tamil
                 "लिखना", "निबंध", "व्याकरण"]  # Hindi
}

# File upload settings
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".tiff"}

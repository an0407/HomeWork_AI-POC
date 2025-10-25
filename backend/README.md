# AI Homework Assistant - Phase 1 Backend

## Overview

Phase 1 provides the core homework processing flow:
- Image upload with OCR text extraction (Pytesseract)
- Subject classification (Math, Science, Language)
- AI-powered step-by-step solution generation (GPT-4o-mini)
- Text-to-speech audio generation (OpenAI TTS)
- Multi-language support (English, Tamil, Hindi)

## Architecture

```
Request → Router → Agent → Tools/Operations → Database
                     ↓
              Business Logic
```

### Layers

- **Routers** (`app/routers/`): FastAPI endpoint handlers
- **Agents** (`app/agents/`): Business logic orchestration
- **Tools** (`app/tools/`): AI-powered functions (OpenAI integration)
- **Operations** (`app/operations/`): Non-AI helper functions
- **Schemas** (`app/schemas/`): Pydantic data models
- **Database** (`app/database/`): MongoDB connection (Motor)
- **Utils** (`app/utils/`): Constants and utilities

## Tech Stack

- **FastAPI** - Web framework
- **Motor** - Async MongoDB driver
- **OpenAI API** - GPT-4o-mini (solutions), TTS (audio)
- **Pytesseract** - OCR text extraction
- **OpenCV + Pillow** - Image preprocessing
- **Pydantic** - Data validation

## Prerequisites

1. **Python 3.9+**
2. **MongoDB** (local or MongoDB Atlas)
3. **Tesseract OCR** installed on system
4. **OpenAI API Key**

## Installation

### 1. Install Tesseract OCR

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install tesseract-ocr tesseract-ocr-eng tesseract-ocr-tam tesseract-ocr-hin
```

**macOS:**
```bash
brew install tesseract tesseract-lang
```

**Windows:**
Download from [GitHub](https://github.com/UB-Mannheim/tesseract/wiki) and add to PATH

### 2. Setup Python Environment

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment

The `.env` file already exists with your MongoDB Atlas connection. Verify it contains:

```
MONGODB_URL=mongodb+srv://homework_dev:...
DATABASE_NAME=homework_assistant_dev
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-mini
STORAGE_PATH=./storage
```

## Running the Application

```bash
# Make sure you're in the backend directory
cd backend

# Activate virtual environment if not already active
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Run the FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

## API Endpoints

### Homework Endpoints

#### 1. Upload Homework
```bash
POST /api/homework/upload
```

**Form Data:**
- `file`: Image file (JPG, PNG, BMP, TIFF)
- `input_language`: Language in image (en/ta/hi)
- `output_language`: Language for solution (en/ta/hi)

**Example:**
```bash
curl -X POST "http://localhost:8000/api/homework/upload" \
  -F "file=@homework.jpg" \
  -F "input_language=en" \
  -F "output_language=en"
```

**Response:**
```json
{
  "homework_id": "507f1f77bcf86cd799439011",
  "extracted_text": "What is 2 + 2?",
  "subject": "math",
  "input_language": "en",
  "output_language": "en",
  "status": "completed",
  "created_at": "2024-01-01T12:00:00"
}
```

#### 2. Get Homework Details
```bash
GET /api/homework/{homework_id}
```

### Solution Endpoints

#### 3. Generate Solution
```bash
POST /api/solution/generate
```

**JSON Body:**
```json
{
  "homework_id": "507f1f77bcf86cd799439011",
  "generate_audio": true,
  "output_language": "en"
}
```

**Response:**
```json
{
  "solution_id": "507f1f77bcf86cd799439012",
  "question": "What is 2 + 2?",
  "subject": "math",
  "solution_steps": [
    {
      "step_number": 1,
      "explanation": "Add the two numbers together",
      "formula_used": "a + b"
    }
  ],
  "final_answer": "4",
  "concepts_covered": ["Addition", "Basic arithmetic"],
  "audio_url": "/audio/abc123.mp3",
  "output_language": "en",
  "created_at": "2024-01-01T12:01:00"
}
```

#### 4. Get Solution Details
```bash
GET /api/solution/{solution_id}
```

#### 5. Stream Audio
```bash
GET /api/solution/audio/{audio_filename}
```

#### 6. Regenerate Audio
```bash
POST /api/solution/{solution_id}/regenerate-audio
```

**JSON Body:**
```json
{
  "language": "ta"
}
```

## Database Collections

### homework_submissions
```javascript
{
  "_id": ObjectId,
  "image_path": String,
  "extracted_text": String,
  "subject": "math" | "science" | "language",
  "input_language": "en" | "ta" | "hi",
  "output_language": "en" | "ta" | "hi",
  "status": "completed",
  "created_at": DateTime
}
```

### solutions
```javascript
{
  "_id": ObjectId,
  "homework_id": String (ref: homework_submissions),
  "question": String,
  "subject": String,
  "solution_steps": [
    {
      "step_number": Number,
      "explanation": String,
      "formula_used": String | null
    }
  ],
  "final_answer": String,
  "concepts_covered": [String],
  "audio_url": String | null,
  "output_language": "en" | "ta" | "hi",
  "created_at": DateTime
}
```

## Language Support

| Code | Language | Tesseract | TTS |
|------|----------|-----------|-----|
| `en` | English  | ✓         | ✓   |
| `ta` | Tamil    | ✓         | ✓   |
| `hi` | Hindi    | ✓         | ✓   |

## File Upload Limits

- **Max File Size**: 10 MB
- **Allowed Formats**: .jpg, .jpeg, .png, .bmp, .tiff

## Storage Structure

```
storage/
├── uploads/         # Uploaded homework images
└── audio/           # Generated audio files
```

## Development

### Project Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── config.py            # Settings & environment
│   ├── routers/             # API endpoints
│   │   ├── homework.py
│   │   └── solution.py
│   ├── agents/              # Business logic
│   │   ├── homework_agent.py
│   │   └── solution_agent.py
│   ├── tools/               # AI integrations
│   │   ├── ai_solver.py
│   │   └── ai_tts.py
│   ├── operations/          # Helper functions
│   │   ├── image_processor.py
│   │   └── file_operations.py
│   ├── schemas/             # Data models
│   │   ├── homework.py
│   │   └── solution.py
│   ├── database/            # DB connection
│   │   └── mongodb.py
│   └── utils/               # Constants
│       └── constants.py
├── storage/
│   ├── uploads/
│   └── audio/
├── requirements.txt
├── .env
├── .env.example
└── README.md
```

## Error Handling

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request (invalid file type, language)
- `404` - Resource Not Found (homework/solution ID)
- `500` - Server Error (OCR failure, AI API error)

### Common Errors

**OCR Extraction Failed:**
- Check Tesseract is installed correctly
- Verify language data files are present
- Ensure image quality is sufficient

**MongoDB Connection Failed:**
- Verify MONGODB_URL in .env
- Check network connectivity
- Confirm MongoDB is running

**OpenAI API Error:**
- Verify OPENAI_API_KEY is valid
- Check API quota/limits
- Ensure gpt-4o-mini model access

## Testing

### Manual Testing

```bash
# 1. Upload homework
curl -X POST "http://localhost:8000/api/homework/upload" \
  -F "file=@test_image.jpg" \
  -F "input_language=en" \
  -F "output_language=en"

# Copy the homework_id from response

# 2. Generate solution
curl -X POST "http://localhost:8000/api/solution/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "homework_id": "YOUR_HOMEWORK_ID",
    "generate_audio": true,
    "output_language": "en"
  }'

# 3. Download audio
curl "http://localhost:8000/api/solution/audio/AUDIO_FILENAME.mp3" \
  --output solution_audio.mp3
```

## Phase 2 & 3 Compatibility

This implementation is designed to be extended by Phase 2 and Phase 3:

- **Phase 2**: Will add flashcards and practice questions
- **Phase 3**: Will add settings, feedback, and search

The architecture supports easy integration:
- Extensible `main.py` for new routers
- Flexible database schemas
- Shared constants and utilities
- Consistent error handling patterns

## Troubleshooting

### Tesseract Not Found
```
Error: pytesseract.pytesseract.TesseractNotFoundError
```
**Solution**: Install Tesseract OCR and add to system PATH

### MongoDB Connection Timeout
```
Error: ServerSelectionTimeoutError
```
**Solution**: Check MONGODB_URL and network connectivity

### Audio File Not Found
```
Error: 404 Audio file not found
```
**Solution**: Ensure `storage/audio/` directory exists and has write permissions

## Support

For issues or questions:
1. Check the `/docs` endpoint for API documentation
2. Review error logs in console output
3. Verify all environment variables are set correctly

## License

This is a proof-of-concept project for educational purposes.

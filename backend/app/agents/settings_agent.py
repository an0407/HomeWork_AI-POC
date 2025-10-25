from typing import Dict
from datetime import datetime
from app.database.mongodb import get_database
from app.schemas.settings import UserPreferences


class SettingsAgent:
    """Main agent for settings management"""

    async def get_preferences(self) -> Dict:
        db = get_database()

        # For POC, get/create default preferences
        prefs = await db.preferences.find_one({"is_default": True})

        if not prefs:
            # Create default preferences
            default_prefs = {
                "is_default": True,
                "language": "en",
                "voice_language": "en",
                "difficulty_preference": "auto",
                "grade_level": 5,
                "auto_generate_audio": False,
                "auto_generate_flashcards": False,
                "practice_question_count": 5,
                "theme": "light",
                "updated_at": datetime.utcnow()
            }
            await db.preferences.insert_one(default_prefs)
            return default_prefs

        return prefs

    async def update_preferences(self, preferences: UserPreferences) -> Dict:
        db = get_database()

        prefs_dict = preferences.dict()
        prefs_dict["is_default"] = True
        prefs_dict["updated_at"] = datetime.utcnow()

        # Upsert (update or insert)
        await db.preferences.update_one(
            {"is_default": True},
            {"$set": prefs_dict},
            upsert=True
        )

        return prefs_dict

    @staticmethod
    def get_supported_languages() -> list:
        return [
            {"code": "en", "name": "English"},
            {"code": "ta", "name": "தமிழ் (Tamil)"},
            {"code": "hi", "name": "हिंदी (Hindi)"}
        ]

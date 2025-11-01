from fastapi import APIRouter, HTTPException
from app.agents.settings_agent import SettingsAgent
from app.schemas.settings import (
    UserPreferences,
    PreferencesResponse,
    LanguageInfo
)

router = APIRouter(prefix="/api/settings", tags=["settings"])
settings_agent = SettingsAgent()


@router.get("/preferences", response_model=PreferencesResponse)
async def get_preferences():
    try:
        prefs = await settings_agent.get_preferences()

        # Remove MongoDB internal fields
        prefs.pop("_id", None)
        prefs.pop("is_default", None)

        return PreferencesResponse(
            preferences=UserPreferences(**prefs),
            updated_at=prefs.get("updated_at")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/preferences", response_model=PreferencesResponse)
async def update_preferences(preferences: UserPreferences):
    try:
        updated_prefs = await settings_agent.update_preferences(preferences)

        return PreferencesResponse(
            preferences=UserPreferences(**updated_prefs),
            updated_at=updated_prefs.get("updated_at")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/languages", response_model=list[LanguageInfo])
async def get_supported_languages():
    return settings_agent.get_supported_languages()

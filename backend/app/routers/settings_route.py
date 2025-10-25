from fastapi import APIRouter
from app.agents.settings_agent.py import SettingsAgent
from app.schemas.settings import UserPreferences

router = APIRouter(prefix="/settings", tags=["settings"])
agent = SettingsAgent()

@router.get("/")
async def get_preferences():
    return await agent.get_preferences()

@router.put("/")
async def update_preferences(preferences: UserPreferences):
    return await agent.update_preferences(preferences)

@router.get("/languages")
async def supported_languages():
    return agent.get_supported_languages()

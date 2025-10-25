from fastapi import APIRouter
from app.agents.dashboard_agent import DashboardAgent
from app.schemas.dashboard import DashboardStats, RecentHomeworkItem

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])
dashboard_agent = DashboardAgent()

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    """Get dashboard statistics"""

    stats = await dashboard_agent.get_dashboard_stats()
    return DashboardStats(**stats)

@router.get("/recent-homework")
async def get_recent_homework(limit: int = 10):
    """Get recent homework with enriched data"""

    homework_list = await dashboard_agent.get_recent_homework(limit)

    return {
        "homework": homework_list
    }

@router.get("/subjects")
async def get_subjects_list():
    """Get list of subjects"""

    subjects = await dashboard_agent.get_subjects_list()

    return {
        "subjects": subjects
    }

from typing import Dict, List
from app.operations.analytics_ops import AnalyticsOperations
from app.database.mongodb import get_database

class DashboardAgent:
    """Main agent for dashboard operations"""

    def __init__(self):
        self.analytics = AnalyticsOperations()

    async def get_dashboard_stats(self) -> Dict:
        """Get dashboard statistics"""
        db = get_database()
        return await self.analytics.calculate_dashboard_stats(db)

    async def get_recent_homework(self, limit: int = 10) -> List[Dict]:
        """Get recent homework with enriched data"""
        db = get_database()
        return await self.analytics.get_recent_homework_enriched(db, limit)

    async def get_subjects_list(self) -> List[str]:
        """Get list of subjects"""
        db = get_database()
        subjects = await db.homework_submissions.distinct("subject")
        return subjects

    async def get_review_progress(self, set_id: str) -> Dict:
        """Get flashcard review progress"""
        db = get_database()
        return await self.analytics.calculate_review_progress(db, set_id)

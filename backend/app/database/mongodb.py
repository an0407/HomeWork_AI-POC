from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class MongoDB:
    client: AsyncIOMotorClient = None

mongodb = MongoDB()

async def connect_to_mongo():
    """Connect to MongoDB on startup"""
    try:
        mongodb.client = AsyncIOMotorClient(settings.MONGODB_URL)
        # Test the connection
        await mongodb.client.admin.command('ping')
        logger.info(f"✅ Successfully connected to MongoDB")
        logger.info(f"Database: {settings.DATABASE_NAME}")
        print(f"✅ Connected to MongoDB - Database: {settings.DATABASE_NAME}")
    except Exception as e:
        logger.error(f"❌ Failed to connect to MongoDB: {str(e)}")
        raise

async def close_mongo_connection():
    """Close MongoDB connection on shutdown"""
    if mongodb.client:
        mongodb.client.close()
        logger.info("Closed MongoDB connection")
        print("Closed MongoDB connection")

def get_database():
    """Get database instance"""
    if mongodb.client is None:
        raise RuntimeError("MongoDB client not initialized. Call connect_to_mongo first.")
    return mongodb.client[settings.DATABASE_NAME]
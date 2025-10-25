from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

class MongoDB:
    client: AsyncIOMotorClient = None

mongodb = MongoDB()

async def connect_to_mongo():
    """Connect to MongoDB on startup"""
    mongodb.client = AsyncIOMotorClient(settings.MONGODB_URL)
    print(f"Connected to MongoDB at {settings.MONGODB_URL}")

async def close_mongo_connection():
    """Close MongoDB connection on shutdown"""
    mongodb.client.close()
    print("Closed MongoDB connection")

def get_database():
    """Get database instance"""
    if mongodb.client is None:
        raise RuntimeError("MongoDB client not initialized. Call connect_to_mongo first.")
    return mongodb.client[settings.DATABASE_NAME]
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import MONGODB_URL, DATABASE_NAME

client: AsyncIOMotorClient | None = None
db: AsyncIOMotorDatabase | None = None


async def connect_to_mongo():
    """Connect to MongoDB"""
    global client, db
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    # Verify connection
    await client.admin.command('ping')
    print(f'✅ Connected to MongoDB: {DATABASE_NAME}')


async def close_mongo_connection():
    """Close MongoDB connection"""
    global client
    if client:
        client.close()
        print('❌ Disconnected from MongoDB')


def get_database() -> AsyncIOMotorDatabase:
    """Get database instance"""
    if db is None:
        raise RuntimeError('Database not connected')
    return db

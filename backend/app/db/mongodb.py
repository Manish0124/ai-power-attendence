import motor.motor_asyncio
from app.core.config import settings

client: motor.motor_asyncio.AsyncIOMotorClient = None
db = None


async def connect_to_mongo():
    global client, db
    client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URL)
    # Use default DB from connection string, or fallback to 'attendance_db'
    try:
        db = client.get_default_database()
    except Exception:
        db = client["attendance_db"]
    print("✅ Connected to MongoDB")


async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("🔌 MongoDB connection closed")


def get_db():
    return db

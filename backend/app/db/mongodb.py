import motor.motor_asyncio
from app.core.config import settings

client: motor.motor_asyncio.AsyncIOMotorClient = None
db = None


async def connect_to_mongo():
    global client, db
    client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URL)
    db = client.get_default_database()
    print("✅ Connected to MongoDB Atlas")


async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("🔌 MongoDB connection closed")


def get_db():
    return db

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.api.v1.router import api_router
from app.db.mongodb import connect_to_mongo, close_mongo_connection

app = FastAPI(
    title="AI-Powered Attendance System",
    description="Attendance management with Face Recognition, Geolocation, and AI Assistant",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploaded selfies
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Startup / shutdown events
app.add_event_handler("startup", connect_to_mongo)
app.add_event_handler("shutdown", close_mongo_connection)

# Routes
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"message": "AI-Powered Attendance System API is running 🚀"}


@app.get("/health")
async def health():
    return {"status": "ok"}

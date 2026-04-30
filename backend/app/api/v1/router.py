from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, attendance, overtime, reports, ai_assistant

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(attendance.router, prefix="/attendance", tags=["Attendance"])
api_router.include_router(overtime.router, prefix="/overtime", tags=["Overtime"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
api_router.include_router(ai_assistant.router, prefix="/ai", tags=["AI Assistant"])

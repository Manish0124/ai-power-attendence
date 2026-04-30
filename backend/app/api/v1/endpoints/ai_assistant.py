from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import date
import google.generativeai as genai

from app.api.deps import get_current_user
from app.db.mongodb import get_db
from app.core.config import settings

router = APIRouter()

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)
    _model = genai.GenerativeModel("gemini-1.5-flash")
else:
    _model = None


class AIQuery(BaseModel):
    query: str
    target_date: Optional[str] = None


async def _gather_context(db, role: str, user_id: str, target_date: Optional[str]) -> str:
    """Fetch relevant attendance data and format as context string for the AI."""
    today = target_date or date.today().isoformat()

    if role == "employee":
        records = await db.attendance.find({"user_id": user_id, "date": today}).to_list(10)
    else:
        records = await db.attendance.find({"date": today}).to_list(200)

    overtime_records = await db.overtime.find({"status": "pending"}).to_list(100)

    lines = [f"Attendance data for {today}:", ""]
    for r in records:
        punch_in = r.get("punch_in", "N/A")
        punch_out = r.get("punch_out", "N/A")
        hours = r.get("total_hours", "N/A")
        status = r.get("status", "N/A")
        lines.append(
            f"- User {r['user_id']}: punch_in={punch_in}, punch_out={punch_out}, "
            f"hours={hours}, status={status}"
        )

    lines += ["", f"Pending overtime requests: {len(overtime_records)}"]
    for ot in overtime_records[:10]:
        lines.append(f"- User {ot['user_id']} requested {ot['extra_hours']} extra hours on {ot['date']}")

    return "\n".join(lines)


@router.post("/query", summary="Ask AI assistant about attendance")
async def ai_query(payload: AIQuery, current_user: dict = Depends(get_current_user)):
    if not _model:
        raise HTTPException(
            status_code=503,
            detail="AI Assistant is not configured. Please set GEMINI_API_KEY in .env",
        )

    db = get_db()
    role = current_user.get("role", "employee")
    user_id = str(current_user["_id"])

    context = await _gather_context(db, role, user_id, payload.target_date)

    system_prompt = (
        "You are an intelligent attendance management assistant. "
        "Answer questions based on the following attendance data. "
        "Be concise and helpful. If data is insufficient, say so.\n\n"
        f"{context}\n\n"
        f"User role: {role}\n"
        f"User query: {payload.query}"
    )

    response = _model.generate_content(system_prompt)
    return {"response": response.text, "context_date": payload.target_date or date.today().isoformat()}

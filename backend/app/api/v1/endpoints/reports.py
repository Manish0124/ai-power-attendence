from fastapi import APIRouter, Depends
from typing import Optional
from datetime import datetime, date

from app.api.deps import get_current_user, require_manager_or_admin
from app.db.mongodb import get_db

router = APIRouter()


@router.get("/summary", summary="Attendance summary report")
async def attendance_summary(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    user_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()
    role = current_user.get("role")

    query = {}
    if role == "employee":
        query["user_id"] = str(current_user["_id"])
    elif user_id and role in ("manager", "admin"):
        query["user_id"] = user_id

    if start_date:
        query["date"] = {"$gte": start_date}
    if end_date:
        query.setdefault("date", {})["$lte"] = end_date

    records = await db.attendance.find(query).to_list(length=2000)

    summary = {
        "total_days": len(records),
        "present": sum(1 for r in records if r.get("status") == "present"),
        "incomplete": sum(1 for r in records if r.get("status") == "incomplete"),
        "absent": sum(1 for r in records if r.get("status") == "absent"),
        "total_hours": round(sum(r.get("total_hours") or 0 for r in records), 2),
        "average_hours": 0,
    }
    if summary["total_days"] > 0:
        summary["average_hours"] = round(summary["total_hours"] / summary["total_days"], 2)

    return summary


@router.get("/daily", summary="Daily attendance breakdown", dependencies=[Depends(require_manager_or_admin)])
async def daily_report(target_date: Optional[str] = None):
    db = get_db()
    if not target_date:
        target_date = date.today().isoformat()

    records = await db.attendance.find({"date": target_date}).to_list(length=500)

    late_employees = []
    incomplete_employees = []

    for r in records:
        r["id"] = str(r.pop("_id"))
        if r.get("punch_in"):
            punch_in: datetime = r["punch_in"]
            if punch_in.hour >= 9:  # late if after 9 AM UTC
                late_employees.append(r["user_id"])
        if r.get("status") == "incomplete":
            incomplete_employees.append(r["user_id"])

    return {
        "date": target_date,
        "total_records": len(records),
        "late_user_ids": late_employees,
        "incomplete_user_ids": incomplete_employees,
        "records": records,
    }

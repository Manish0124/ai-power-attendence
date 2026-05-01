from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from app.api.deps import get_current_user, require_manager_or_admin
from app.models.overtime import OvertimeCreate, OvertimeReview, OvertimeStatus
from app.db.mongodb import get_db

router = APIRouter()


@router.post("/", summary="Submit overtime request")
async def create_overtime(
    data: OvertimeCreate,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()
    record = {
        "user_id": str(current_user["_id"]),
        "attendance_id": data.attendance_id,
        "date": data.date,
        "extra_hours": data.extra_hours,
        "reason": data.reason,
        "status": OvertimeStatus.PENDING.value,
        "reviewed_by": None,
        "reviewed_at": None,
        "review_note": None,
        "created_at": datetime.utcnow(),
    }
    result = await db.overtime.insert_one(record)
    return {"id": str(result.inserted_id), "message": "Overtime request submitted"}


@router.get("/me", summary="My overtime requests")
async def my_overtime(current_user: dict = Depends(get_current_user)):
    db = get_db()
    records = await db.overtime.find({"user_id": str(current_user["_id"])}).sort("created_at", -1).to_list(100)
    for r in records:
        r["id"] = str(r.pop("_id"))
    return records


@router.get("/", summary="All overtime requests (Manager/Admin)", dependencies=[Depends(require_manager_or_admin)])
async def all_overtime(status: Optional[str] = None):
    db = get_db()
    query = {}
    if status:
        query["status"] = status
    records = await db.overtime.find(query).sort("created_at", -1).to_list(500)
    for r in records:
        r["id"] = str(r.pop("_id"))
    return records


@router.patch("/{request_id}/review", summary="Approve or reject overtime")
async def review_overtime(
    request_id: str,
    review: OvertimeReview,
    current_user: dict = Depends(require_manager_or_admin),
):
    db = get_db()
    await db.overtime.update_one(
        {"_id": ObjectId(request_id)},
        {
            "$set": {
                "status": review.status.value,
                "reviewed_by": str(current_user["_id"]),
                "reviewed_at": datetime.utcnow(),
                "review_note": review.review_note,
            }
        },
    )
    return {"message": f"Overtime request {review.status.value}"}

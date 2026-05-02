from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from typing import List, Optional
from datetime import datetime, date
import os
import uuid

from app.api.deps import get_current_user, require_manager_or_admin
from app.models.attendance import AttendanceRecord, AttendanceStatus, AttendanceOut
from app.db.mongodb import get_db
from app.core.config import settings
from app.core.face_utils import get_face_encoding, compare_encodings

router = APIRouter()


def _compute_status(punch_in: datetime, punch_out: datetime) -> tuple[AttendanceStatus, float]:
    delta = punch_out - punch_in
    hours = delta.total_seconds() / 3600
    if hours >= 8:
        status = AttendanceStatus.PRESENT
    else:
        status = AttendanceStatus.INCOMPLETE
    return status, round(hours, 2)


async def _verify_face(file_bytes: bytes, user: dict) -> bool:
    if not user.get("face_registered") or not user.get("face_encoding"):
        raise HTTPException(status_code=400, detail="Face not registered. Please register your face first.")
    try:
        candidate = get_face_encoding(file_bytes)
    except Exception:
        raise HTTPException(status_code=400, detail="No face detected in uploaded image")
    return compare_encodings(user["face_encoding"], candidate)


@router.post("/punch-in", summary="Punch In with face recognition")
async def punch_in(
    latitude: float = Form(...),
    longitude: float = Form(...),
    selfie: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    db = get_db()
    today = date.today().isoformat()
    user_id = str(current_user["_id"])

    existing = await db.attendance.find_one({"user_id": user_id, "date": today})
    if existing and existing.get("punch_in"):
        raise HTTPException(status_code=400, detail="Already punched in today")

    file_bytes = await selfie.read()
    is_match = await _verify_face(file_bytes, current_user)
    if not is_match:
        raise HTTPException(status_code=400, detail="Face verification failed ❌")

    # Save selfie
    filename = f"{user_id}_in_{uuid.uuid4().hex}.jpg"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(file_bytes)

    now = datetime.utcnow()
    record = {
        "user_id": user_id,
        "date": today,
        "punch_in": now,
        "punch_out": None,
        "total_hours": None,
        "status": AttendanceStatus.INCOMPLETE.value,
        "selfie_in": filename,
        "selfie_out": None,
        "location_in": {"lat": latitude, "lng": longitude},
        "location_out": None,
        "is_valid": True,
        "created_at": now,
        "updated_at": now,
    }
    await db.attendance.insert_one(record)
    return {"message": "Punched in successfully ✅", "punch_in": now}


@router.post("/punch-out", summary="Punch Out with face recognition")
async def punch_out(
    latitude: float = Form(...),
    longitude: float = Form(...),
    selfie: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    db = get_db()
    today = date.today().isoformat()
    user_id = str(current_user["_id"])

    record = await db.attendance.find_one({"user_id": user_id, "date": today})
    if not record or not record.get("punch_in"):
        raise HTTPException(status_code=400, detail="No punch-in record found for today")
    if record.get("punch_out"):
        raise HTTPException(status_code=400, detail="Already punched out today")

    file_bytes = await selfie.read()
    is_match = await _verify_face(file_bytes, current_user)
    if not is_match:
        raise HTTPException(status_code=400, detail="Face verification failed ❌")

    filename = f"{user_id}_out_{uuid.uuid4().hex}.jpg"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(file_bytes)

    now = datetime.utcnow()
    att_status, total_hours = _compute_status(record["punch_in"], now)

    await db.attendance.update_one(
        {"_id": record["_id"]},
        {
            "$set": {
                "punch_out": now,
                "total_hours": total_hours,
                "status": att_status.value,
                "selfie_out": filename,
                "location_out": {"lat": latitude, "lng": longitude},
                "updated_at": now,
            }
        },
    )
    return {
        "message": "Punched out successfully ✅",
        "punch_out": now,
        "total_hours": total_hours,
        "status": att_status.value,
    }


@router.get("/me", summary="Get my attendance records")
async def get_my_attendance(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()
    query = {"user_id": str(current_user["_id"])}
    if start_date:
        query["date"] = {"$gte": start_date}
    if end_date:
        query.setdefault("date", {})["$lte"] = end_date

    records = await db.attendance.find(query).sort("date", -1).to_list(length=200)
    for r in records:
        r["id"] = str(r.pop("_id"))
    return records


@router.get("/", summary="Get all attendance (Manager/Admin)", dependencies=[Depends(require_manager_or_admin)])
async def get_all_attendance(
    user_id: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
):
    db = get_db()
    query = {}
    if user_id:
        query["user_id"] = user_id
    if start_date:
        query["date"] = {"$gte": start_date}
    if end_date:
        query.setdefault("date", {})["$lte"] = end_date

    records = await db.attendance.find(query).sort("date", -1).to_list(length=1000)
    for r in records:
        r["id"] = str(r.pop("_id"))
    return records


@router.patch("/{record_id}/invalidate", summary="Mark record as invalid (Admin)", dependencies=[Depends(require_manager_or_admin)])
async def invalidate_record(record_id: str, notes: Optional[str] = None):
    from bson import ObjectId
    db = get_db()
    await db.attendance.update_one(
        {"_id": ObjectId(record_id)},
        {"$set": {"is_valid": False, "notes": notes, "updated_at": datetime.utcnow()}},
    )
    return {"message": "Record marked as invalid"}

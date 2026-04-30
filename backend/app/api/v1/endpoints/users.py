from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from typing import List
from bson import ObjectId
import numpy as np
import face_recognition
import io
from PIL import Image

from app.api.deps import get_current_user, require_admin
from app.models.user import UserOut, UserUpdate, Role
from app.db.mongodb import get_db

router = APIRouter()


def _serialize_user(user: dict) -> dict:
    user["id"] = str(user["_id"])
    user.pop("_id", None)
    user.pop("hashed_password", None)
    user.pop("face_encoding", None)
    return user


@router.get("/me", response_model=UserOut)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserOut(**_serialize_user(current_user))


@router.put("/me", response_model=UserOut)
async def update_me(update: UserUpdate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if update_data:
        await db.users.update_one(
            {"_id": current_user["_id"]},
            {"$set": update_data},
        )
    updated = await db.users.find_one({"_id": current_user["_id"]})
    return UserOut(**_serialize_user(updated))


@router.post("/me/register-face", summary="Register face encoding from selfie")
async def register_face(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    contents = await file.read()
    image = face_recognition.load_image_file(io.BytesIO(contents))
    encodings = face_recognition.face_encodings(image)
    if not encodings:
        raise HTTPException(status_code=400, detail="No face detected in the image")

    encoding = encodings[0].tolist()
    db = get_db()
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"face_encoding": encoding, "face_registered": True}},
    )
    return {"message": "Face registered successfully ✅"}


# ── Admin-only endpoints ─────────────────────────────────────────────────────

@router.get("/", response_model=List[UserOut], dependencies=[Depends(require_admin)])
async def list_users():
    db = get_db()
    users = await db.users.find().to_list(length=500)
    return [UserOut(**_serialize_user(u)) for u in users]


@router.get("/{user_id}", response_model=UserOut, dependencies=[Depends(require_admin)])
async def get_user(user_id: str):
    db = get_db()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserOut(**_serialize_user(user))


@router.put("/{user_id}", response_model=UserOut, dependencies=[Depends(require_admin)])
async def update_user(user_id: str, update: UserUpdate):
    db = get_db()
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if update_data:
        await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserOut(**_serialize_user(user))


@router.delete("/{user_id}", dependencies=[Depends(require_admin)])
async def delete_user(user_id: str):
    db = get_db()
    result = await db.users.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}

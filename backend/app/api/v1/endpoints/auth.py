from fastapi import APIRouter, HTTPException, status
from datetime import datetime
from bson import ObjectId
from app.models.user import UserCreate, UserOut, Token, LoginRequest
from app.core.security import get_password_hash, verify_password, create_access_token
from app.db.mongodb import get_db

router = APIRouter()


@router.post("/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate):
    db = get_db()
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = get_password_hash(user_data.password)
    user_dict = user_data.model_dump(exclude={"password"})
    user_dict["hashed_password"] = hashed
    user_dict["face_encoding"] = None
    user_dict["face_registered"] = False
    user_dict["created_at"] = datetime.utcnow()

    result = await db.users.insert_one(user_dict)
    user_dict["id"] = str(result.inserted_id)

    return UserOut(**user_dict)


@router.post("/login", response_model=Token)
async def login(credentials: LoginRequest):
    db = get_db()
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is disabled")

    user_id = str(user["_id"])
    token = create_access_token({"sub": user_id, "role": user["role"]})

    user_out = UserOut(
        id=user_id,
        email=user["email"],
        full_name=user["full_name"],
        role=user["role"],
        department=user.get("department"),
        is_active=user.get("is_active", True),
        face_registered=user.get("face_registered", False),
        created_at=user.get("created_at", datetime.utcnow()),
    )
    return Token(access_token=token, user=user_out)

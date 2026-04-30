from enum import Enum
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class OvertimeStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class OvertimeRequest(BaseModel):
    id: Optional[str] = None
    user_id: str
    attendance_id: str
    date: str  # YYYY-MM-DD
    extra_hours: float
    reason: str
    status: OvertimeStatus = OvertimeStatus.PENDING
    reviewed_by: Optional[str] = None  # manager/admin user_id
    reviewed_at: Optional[datetime] = None
    review_note: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True


class OvertimeCreate(BaseModel):
    attendance_id: str
    date: str
    extra_hours: float
    reason: str


class OvertimeReview(BaseModel):
    status: OvertimeStatus
    review_note: Optional[str] = None

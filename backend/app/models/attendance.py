from enum import Enum
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class AttendanceStatus(str, Enum):
    PRESENT = "present"
    INCOMPLETE = "incomplete"
    ABSENT = "absent"


class PunchType(str, Enum):
    IN = "in"
    OUT = "out"


class AttendanceRecord(BaseModel):
    id: Optional[str] = None
    user_id: str
    date: str  # YYYY-MM-DD
    punch_in: Optional[datetime] = None
    punch_out: Optional[datetime] = None
    total_hours: Optional[float] = None
    status: AttendanceStatus = AttendanceStatus.ABSENT
    selfie_in: Optional[str] = None   # file path
    selfie_out: Optional[str] = None  # file path
    location_in: Optional[dict] = None   # {lat, lng}
    location_out: Optional[dict] = None  # {lat, lng}
    is_valid: bool = True
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True


class PunchRequest(BaseModel):
    latitude: float
    longitude: float


class AttendanceOut(AttendanceRecord):
    user_name: Optional[str] = None
    user_email: Optional[str] = None

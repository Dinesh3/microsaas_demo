from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AppointmentBase(BaseModel):
    customer_id: str
    title: str
    purpose: Optional[str] = None
    location: Optional[str] = None
    scheduled_at: datetime
    assigned_to_user_id: Optional[str] = None
    preparation_checklist: Optional[str] = None
    notes: Optional[str] = None


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentUpdate(BaseModel):
    title: Optional[str] = None
    purpose: Optional[str] = None
    location: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    assigned_to_user_id: Optional[str] = None
    preparation_checklist: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class AppointmentOut(AppointmentBase):
    id: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

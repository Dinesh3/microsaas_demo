from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class FollowUpBase(BaseModel):
    type: str
    customer_id: str
    reference_id: Optional[str] = None
    last_conversation: Optional[str] = None
    next_follow_up_date: Optional[datetime] = None
    owner_user_id: Optional[str] = None


class FollowUpCreate(FollowUpBase):
    pass


class FollowUpUpdate(BaseModel):
    last_conversation: Optional[str] = None
    next_follow_up_date: Optional[datetime] = None
    outcome: Optional[str] = None


class FollowUpOut(FollowUpBase):
    id: str
    last_contact_date: Optional[datetime] = None
    outcome: str
    created_at: datetime

    class Config:
        from_attributes = True

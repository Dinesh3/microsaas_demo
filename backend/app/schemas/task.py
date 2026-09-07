from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    customer_id: Optional[str] = None
    assigned_to_user_id: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = "Medium"


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    assigned_to_user_id: Optional[str] = None


class TaskOut(TaskBase):
    id: str
    status: str
    source: str
    created_at: datetime

    class Config:
        from_attributes = True

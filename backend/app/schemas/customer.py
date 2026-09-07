from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CustomerBase(BaseModel):
    name: str
    phone: str
    address: Optional[str] = None
    requirement: Optional[str] = None
    budget: Optional[float] = None
    product_interest: Optional[str] = None
    lead_source: Optional[str] = None
    next_action: Optional[str] = None
    next_follow_up_date: Optional[datetime] = None


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    requirement: Optional[str] = None
    budget: Optional[float] = None
    product_interest: Optional[str] = None
    lead_source: Optional[str] = None
    stage: Optional[str] = None
    next_action: Optional[str] = None
    next_follow_up_date: Optional[datetime] = None


class CustomerOut(CustomerBase):
    id: str
    stage: str
    last_contact_date: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

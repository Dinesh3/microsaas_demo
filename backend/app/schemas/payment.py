from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PaymentBase(BaseModel):
    customer_id: str
    quotation_id: Optional[str] = None
    type: str = "Advance"
    amount_due: float
    due_date: Optional[datetime] = None
    notes: Optional[str] = None


class PaymentCreate(PaymentBase):
    pass


class PaymentUpdate(BaseModel):
    amount_paid: Optional[float] = None
    due_date: Optional[datetime] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class PaymentOut(PaymentBase):
    id: str
    amount_paid: float
    status: str
    paid_date: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

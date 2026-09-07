import enum
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Enum, Float, Text
from app.db.session import Base


class PaymentType(str, enum.Enum):
    advance = "Advance"
    stage = "Stage Payment"
    final = "Final Payment"


class PaymentStatus(str, enum.Enum):
    pending = "Pending"
    partially_paid = "Partially Paid"
    paid = "Paid"
    overdue = "Overdue"


class Payment(Base):
    __tablename__ = "payments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = Column(String, nullable=False)
    quotation_id = Column(String, nullable=True)
    type = Column(Enum(PaymentType), default=PaymentType.advance, nullable=False)
    amount_due = Column(Float, default=0)
    amount_paid = Column(Float, default=0)
    due_date = Column(DateTime, nullable=True)
    paid_date = Column(DateTime, nullable=True)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.pending, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

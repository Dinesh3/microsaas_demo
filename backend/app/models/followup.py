import enum
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Enum, Text
from app.db.session import Base


class FollowUpType(str, enum.Enum):
    customer = "Customer"
    quotation = "Quotation"
    appointment = "Appointment"
    payment = "Payment"


class FollowUpOutcome(str, enum.Enum):
    pending = "Pending"
    contacted = "Contacted"
    no_response = "No Response"
    callback_requested = "Callback Requested"
    converted = "Converted"
    cold = "Cold"


class FollowUp(Base):
    __tablename__ = "followups"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    type = Column(Enum(FollowUpType), nullable=False)
    customer_id = Column(String, nullable=False)
    reference_id = Column(String, nullable=True)  # quotation id, appointment id, etc.
    last_contact_date = Column(DateTime, nullable=True)
    last_conversation = Column(Text, nullable=True)
    next_follow_up_date = Column(DateTime, nullable=True)
    owner_user_id = Column(String, nullable=True)
    outcome = Column(Enum(FollowUpOutcome), default=FollowUpOutcome.pending, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

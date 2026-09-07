import enum
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Enum, Text
from app.db.session import Base


class AppointmentStatus(str, enum.Enum):
    booked = "Booked"
    confirmed = "Confirmed"
    rescheduled = "Rescheduled"
    cancelled = "Cancelled"
    completed = "Completed"


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = Column(String, nullable=False)
    title = Column(String, nullable=False)
    purpose = Column(String, nullable=True)
    location = Column(String, nullable=True)
    scheduled_at = Column(DateTime, nullable=False)
    assigned_to_user_id = Column(String, nullable=True)
    preparation_checklist = Column(Text, nullable=True)
    status = Column(Enum(AppointmentStatus), default=AppointmentStatus.booked, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

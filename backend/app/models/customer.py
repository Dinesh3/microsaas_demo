import enum
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Enum, Text, Float
from app.db.session import Base


class CustomerStage(str, enum.Enum):
    new_enquiry = "New Enquiry"
    qualified_lead = "Qualified Lead"
    appointment = "Appointment"
    site_visit = "Site Visit"
    measurement = "Measurement"
    quotation = "Quotation"
    follow_up = "Follow-up"
    negotiation = "Negotiation"
    approved = "Approved"
    advance_payment = "Advance Payment"
    project_execution = "Project Execution"
    installation = "Installation / Delivery"
    final_payment = "Final Payment"
    completed = "Completed"
    after_sales = "After-Sales Follow-up"


class Customer(Base):
    __tablename__ = "customers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    address = Column(String, nullable=True)
    requirement = Column(Text, nullable=True)
    budget = Column(Float, nullable=True)
    product_interest = Column(String, nullable=True)
    lead_source = Column(String, nullable=True)
    stage = Column(Enum(CustomerStage), default=CustomerStage.new_enquiry, nullable=False)
    next_action = Column(String, nullable=True)
    next_follow_up_date = Column(DateTime, nullable=True)
    last_contact_date = Column(DateTime, nullable=True)
    owner_user_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

import enum
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Enum, Text, Float, Integer
from app.db.session import Base


class QuotationStatus(str, enum.Enum):
    draft = "Draft"
    generated = "Generated"
    sent = "Sent"
    viewed = "Viewed"
    follow_up_required = "Follow-up Required"
    negotiation = "Negotiation"
    revision_required = "Revision Required"
    accepted = "Accepted"
    rejected = "Rejected"
    expired = "Expired"
    converted = "Converted to Project"


class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    category = Column(String, nullable=True)
    unit = Column(String, default="Sq Ft")
    purchase_cost = Column(Float, default=0)
    standard_selling_price = Column(Float, default=0)
    minimum_selling_price = Column(Float, default=0)
    labour_cost = Column(Float, default=0)
    installation_cost = Column(Float, default=0)
    tax_percent = Column(Float, default=0)
    supplier = Column(String, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Quotation(Base):
    __tablename__ = "quotations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    quotation_number = Column(String, unique=True, nullable=False)
    customer_id = Column(String, nullable=False)
    version = Column(Integer, default=1)
    parent_quotation_id = Column(String, nullable=True)
    status = Column(Enum(QuotationStatus), default=QuotationStatus.draft, nullable=False)
    subtotal = Column(Float, default=0)
    labour_total = Column(Float, default=0)
    installation_total = Column(Float, default=0)
    transport_cost = Column(Float, default=0)
    tax_total = Column(Float, default=0)
    discount = Column(Float, default=0)
    total_value = Column(Float, default=0)
    estimated_cost = Column(Float, default=0)
    estimated_profit = Column(Float, default=0)
    margin_percent = Column(Float, default=0)
    valid_until = Column(DateTime, nullable=True)
    sent_at = Column(DateTime, nullable=True)
    last_follow_up = Column(DateTime, nullable=True)
    next_follow_up = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class QuotationItem(Base):
    __tablename__ = "quotation_items"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    quotation_id = Column(String, nullable=False)
    product_id = Column(String, nullable=True)
    product_name = Column(String, nullable=False)
    quantity = Column(Float, default=1)
    unit = Column(String, default="Sq Ft")
    unit_price = Column(Float, default=0)
    line_total = Column(Float, default=0)

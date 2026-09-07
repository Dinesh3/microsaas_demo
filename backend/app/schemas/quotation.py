from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ProductBase(BaseModel):
    name: str
    category: Optional[str] = None
    unit: str = "Sq Ft"
    purchase_cost: float = 0
    standard_selling_price: float = 0
    minimum_selling_price: float = 0
    labour_cost: float = 0
    installation_cost: float = 0
    tax_percent: float = 0
    supplier: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class ProductOut(ProductBase):
    id: str

    class Config:
        from_attributes = True


class QuotationItemIn(BaseModel):
    product_id: Optional[str] = None
    product_name: str
    quantity: float
    unit: str = "Sq Ft"
    unit_price: Optional[float] = None  # if omitted, pulled from product master


class QuotationItemOut(BaseModel):
    id: str
    product_id: Optional[str] = None
    product_name: str
    quantity: float
    unit: str
    unit_price: float
    line_total: float

    class Config:
        from_attributes = True


class QuotationCreate(BaseModel):
    customer_id: str
    items: List[QuotationItemIn]
    transport_cost: float = 0
    discount: float = 0
    notes: Optional[str] = None
    valid_days: int = 7


class QuotationUpdate(BaseModel):
    status: Optional[str] = None
    discount: Optional[float] = None
    transport_cost: Optional[float] = None
    notes: Optional[str] = None


class QuotationOut(BaseModel):
    id: str
    quotation_number: str
    customer_id: str
    version: int
    parent_quotation_id: Optional[str] = None
    status: str
    subtotal: float
    labour_total: float
    installation_total: float
    transport_cost: float
    tax_total: float
    discount: float
    total_value: float
    estimated_cost: float
    estimated_profit: float
    margin_percent: float
    valid_until: Optional[datetime] = None
    next_follow_up: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime
    items: List[QuotationItemOut] = []

    class Config:
        from_attributes = True

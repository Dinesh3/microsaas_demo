import random
import string
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from io import BytesIO

from app.db.session import get_db
from app.models.quotation import Quotation, QuotationItem, Product, QuotationStatus
from app.models.customer import Customer
from app.schemas.quotation import QuotationCreate, QuotationUpdate, QuotationOut
from app.core.deps import get_current_user

router = APIRouter(prefix="/api/quotations", tags=["quotations"])


def _generate_number(db: Session) -> str:
    today = datetime.utcnow().strftime("%Y%m%d")
    suffix = "".join(random.choices(string.digits, k=4))
    return f"QT-{today}-{suffix}"


def _price_items(db: Session, items):
    """Price each line item from the product master. AI/user never invents prices."""
    priced = []
    subtotal = 0.0
    labour_total = 0.0
    installation_total = 0.0
    tax_total = 0.0
    cost_total = 0.0

    for item in items:
        product = None
        if item.product_id:
            product = db.query(Product).filter(Product.id == item.product_id).first()
        elif item.product_name:
            product = db.query(Product).filter(Product.name.ilike(item.product_name)).first()

        unit_price = item.unit_price if item.unit_price is not None else (
            product.standard_selling_price if product else 0
        )
        line_total = round(unit_price * item.quantity, 2)
        subtotal += line_total

        if product:
            labour_total += product.labour_cost * item.quantity
            installation_total += product.installation_cost * item.quantity
            tax_total += line_total * (product.tax_percent / 100)
            cost_total += product.purchase_cost * item.quantity

        priced.append(
            QuotationItem(
                product_id=product.id if product else item.product_id,
                product_name=item.product_name,
                quantity=item.quantity,
                unit=item.unit,
                unit_price=unit_price,
                line_total=line_total,
            )
        )
    return priced, subtotal, labour_total, installation_total, tax_total, cost_total


@router.get("", response_model=list[QuotationOut])
def list_quotations(customer_id: str = None, db: Session = Depends(get_db), _=Depends(get_current_user)):
    q = db.query(Quotation)
    if customer_id:
        q = q.filter(Quotation.customer_id == customer_id)
    quotations = q.order_by(Quotation.created_at.desc()).all()
    for quo in quotations:
        quo.items = db.query(QuotationItem).filter(QuotationItem.quotation_id == quo.id).all()
    return quotations


@router.post("", response_model=QuotationOut)
def create_quotation(payload: QuotationCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    customer = db.query(Customer).filter(Customer.id == payload.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    priced_items, subtotal, labour_total, installation_total, tax_total, cost_total = _price_items(
        db, payload.items
    )

    total_value = subtotal + labour_total + installation_total + payload.transport_cost + tax_total - payload.discount
    estimated_cost = cost_total + labour_total + installation_total + payload.transport_cost
    estimated_profit = total_value - estimated_cost - tax_total
    margin_percent = round((estimated_profit / total_value) * 100, 2) if total_value else 0

    quotation = Quotation(
        quotation_number=_generate_number(db),
        customer_id=payload.customer_id,
        status=QuotationStatus.draft,
        subtotal=round(subtotal, 2),
        labour_total=round(labour_total, 2),
        installation_total=round(installation_total, 2),
        transport_cost=payload.transport_cost,
        tax_total=round(tax_total, 2),
        discount=payload.discount,
        total_value=round(total_value, 2),
        estimated_cost=round(estimated_cost, 2),
        estimated_profit=round(estimated_profit, 2),
        margin_percent=margin_percent,
        valid_until=datetime.utcnow() + timedelta(days=payload.valid_days),
        notes=payload.notes,
    )
    db.add(quotation)
    db.flush()
    for item in priced_items:
        item.quotation_id = quotation.id
        db.add(item)
    db.commit()
    db.refresh(quotation)
    quotation.items = db.query(QuotationItem).filter(QuotationItem.quotation_id == quotation.id).all()
    return quotation


@router.post("/{quotation_id}/revise", response_model=QuotationOut)
def revise_quotation(quotation_id: str, payload: QuotationCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    """Create a new version of an existing quotation (e.g. customer requested changes)."""
    original = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not original:
        raise HTTPException(status_code=404, detail="Quotation not found")

    priced_items, subtotal, labour_total, installation_total, tax_total, cost_total = _price_items(
        db, payload.items
    )
    total_value = subtotal + labour_total + installation_total + payload.transport_cost + tax_total - payload.discount
    estimated_cost = cost_total + labour_total + installation_total + payload.transport_cost
    estimated_profit = total_value - estimated_cost - tax_total
    margin_percent = round((estimated_profit / total_value) * 100, 2) if total_value else 0

    new_version = Quotation(
        quotation_number=original.quotation_number,
        customer_id=original.customer_id,
        version=original.version + 1,
        parent_quotation_id=original.id,
        status=QuotationStatus.draft,
        subtotal=round(subtotal, 2),
        labour_total=round(labour_total, 2),
        installation_total=round(installation_total, 2),
        transport_cost=payload.transport_cost,
        tax_total=round(tax_total, 2),
        discount=payload.discount,
        total_value=round(total_value, 2),
        estimated_cost=round(estimated_cost, 2),
        estimated_profit=round(estimated_profit, 2),
        margin_percent=margin_percent,
        valid_until=datetime.utcnow() + timedelta(days=payload.valid_days),
        notes=payload.notes,
    )
    db.add(new_version)
    db.flush()
    for item in priced_items:
        item.quotation_id = new_version.id
        db.add(item)
    original.status = QuotationStatus.revision_required
    db.commit()
    db.refresh(new_version)
    new_version.items = db.query(QuotationItem).filter(QuotationItem.quotation_id == new_version.id).all()
    return new_version


@router.put("/{quotation_id}", response_model=QuotationOut)
def update_quotation(quotation_id: str, payload: QuotationUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    quotation = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")
    data = payload.model_dump(exclude_unset=True)
    if data.get("status") == "Sent":
        quotation.sent_at = datetime.utcnow()
        quotation.next_follow_up = datetime.utcnow() + timedelta(days=2)
    for field, value in data.items():
        setattr(quotation, field, value)
    db.commit()
    db.refresh(quotation)
    quotation.items = db.query(QuotationItem).filter(QuotationItem.quotation_id == quotation.id).all()
    return quotation


@router.post("/{quotation_id}/check-discount")
def check_discount(quotation_id: str, target_price: float, db: Session = Depends(get_db), _=Depends(get_current_user)):
    """AI Margin & Discount Agent: validates a proposed discounted price against real economics."""
    quotation = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")

    min_safe_price = round(quotation.estimated_cost * 1.08, 2)  # protect an 8% minimum margin
    profit_at_target = round(target_price - quotation.estimated_cost, 2)
    margin_at_target = round((profit_at_target / target_price) * 100, 2) if target_price else 0

    safe = target_price >= min_safe_price
    return {
        "target_price": target_price,
        "estimated_cost": quotation.estimated_cost,
        "profit_at_target": profit_at_target,
        "margin_at_target_percent": margin_at_target,
        "recommended_minimum_price": min_safe_price,
        "is_safe": safe,
        "message": (
            f"At ₹{target_price:,.0f}, profit is ₹{profit_at_target:,.0f} ({margin_at_target}% margin)."
            if safe
            else f"At ₹{target_price:,.0f}, margin is too thin. Recommended minimum selling price is ₹{min_safe_price:,.0f}."
        ),
    }


@router.get("/{quotation_id}/pdf")
def quotation_pdf(quotation_id: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    from reportlab.lib.pagesizes import A4
    from reportlab.pdfgen import canvas
    from reportlab.lib.units import mm

    quotation = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")
    customer = db.query(Customer).filter(Customer.id == quotation.customer_id).first()
    items = db.query(QuotationItem).filter(QuotationItem.quotation_id == quotation.id).all()

    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    y = height - 25 * mm

    c.setFont("Helvetica-Bold", 16)
    c.drawString(20 * mm, y, "Quotation")
    y -= 10 * mm
    c.setFont("Helvetica", 10)
    c.drawString(20 * mm, y, f"Quotation No: {quotation.quotation_number}  (v{quotation.version})")
    y -= 6 * mm
    c.drawString(20 * mm, y, f"Customer: {customer.name if customer else '-'}  |  Phone: {customer.phone if customer else '-'}")
    y -= 6 * mm
    c.drawString(20 * mm, y, f"Date: {quotation.created_at.strftime('%d-%b-%Y')}")
    y -= 12 * mm

    c.setFont("Helvetica-Bold", 10)
    c.drawString(20 * mm, y, "Item")
    c.drawString(90 * mm, y, "Qty")
    c.drawString(110 * mm, y, "Unit Price")
    c.drawString(150 * mm, y, "Total")
    y -= 5 * mm
    c.line(20 * mm, y, 190 * mm, y)
    y -= 6 * mm

    c.setFont("Helvetica", 10)
    for item in items:
        c.drawString(20 * mm, y, item.product_name[:40])
        c.drawString(90 * mm, y, f"{item.quantity} {item.unit}")
        c.drawString(110 * mm, y, f"Rs.{item.unit_price:,.2f}")
        c.drawString(150 * mm, y, f"Rs.{item.line_total:,.2f}")
        y -= 6 * mm

    y -= 4 * mm
    c.line(20 * mm, y, 190 * mm, y)
    y -= 8 * mm

    for label, val in [
        ("Subtotal", quotation.subtotal),
        ("Labour", quotation.labour_total),
        ("Installation", quotation.installation_total),
        ("Transport", quotation.transport_cost),
        ("Tax", quotation.tax_total),
        ("Discount", -quotation.discount),
    ]:
        c.drawString(120 * mm, y, label)
        c.drawString(160 * mm, y, f"Rs.{val:,.2f}")
        y -= 6 * mm

    c.setFont("Helvetica-Bold", 12)
    c.drawString(120 * mm, y, "Total")
    c.drawString(160 * mm, y, f"Rs.{quotation.total_value:,.2f}")

    if quotation.valid_until:
        y -= 12 * mm
        c.setFont("Helvetica-Oblique", 9)
        c.drawString(20 * mm, y, f"Valid until {quotation.valid_until.strftime('%d-%b-%Y')}")

    c.showPage()
    c.save()
    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={quotation.quotation_number}.pdf"},
    )

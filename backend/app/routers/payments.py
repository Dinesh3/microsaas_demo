from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.db.session import get_db
from app.models.payment import Payment, PaymentStatus
from app.schemas.payment import PaymentCreate, PaymentUpdate, PaymentOut
from app.core.deps import get_current_user

router = APIRouter(prefix="/api/payments", tags=["payments"])


def _recompute_status(payment: Payment):
    if payment.amount_paid >= payment.amount_due and payment.amount_due > 0:
        payment.status = PaymentStatus.paid
        payment.paid_date = payment.paid_date or datetime.utcnow()
    elif payment.amount_paid > 0:
        payment.status = PaymentStatus.partially_paid
    elif payment.due_date and payment.due_date < datetime.utcnow():
        payment.status = PaymentStatus.overdue
    else:
        payment.status = PaymentStatus.pending


@router.get("", response_model=list[PaymentOut])
def list_payments(db: Session = Depends(get_db), _=Depends(get_current_user)):
    payments = db.query(Payment).order_by(Payment.due_date.asc().nulls_last()).all()
    for p in payments:
        _recompute_status(p)
    db.commit()
    return payments


@router.post("", response_model=PaymentOut)
def create_payment(payload: PaymentCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    payment = Payment(**payload.model_dump())
    _recompute_status(payment)
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


@router.put("/{payment_id}", response_model=PaymentOut)
def update_payment(
    payment_id: str, payload: PaymentUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)
):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(payment, field, value)
    _recompute_status(payment)
    db.commit()
    db.refresh(payment)
    return payment


@router.get("/summary/outstanding")
def outstanding_summary(db: Session = Depends(get_db), _=Depends(get_current_user)):
    payments = db.query(Payment).all()
    total_outstanding = sum(p.amount_due - p.amount_paid for p in payments if p.amount_due > p.amount_paid)
    overdue = [p for p in payments if p.status == PaymentStatus.overdue]
    return {
        "total_outstanding": total_outstanding,
        "overdue_count": len(overdue),
        "overdue_amount": sum(p.amount_due - p.amount_paid for p in overdue),
    }

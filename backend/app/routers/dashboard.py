from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from app.db.session import get_db
from app.models.customer import Customer
from app.models.appointment import Appointment
from app.models.quotation import Quotation, QuotationStatus
from app.models.payment import Payment
from app.models.task import Task, TaskStatus
from app.core.deps import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary")
def summary(db: Session = Depends(get_db), _=Depends(get_current_user)):
    total_customers = db.query(Customer).count()
    active_quotations = db.query(Quotation).filter(
        Quotation.status.notin_([QuotationStatus.rejected, QuotationStatus.expired, QuotationStatus.converted])
    ).count()
    pipeline_value = sum(
        q.total_value for q in db.query(Quotation).filter(
            Quotation.status.notin_([QuotationStatus.rejected, QuotationStatus.expired])
        ).all()
    )
    payments = db.query(Payment).all()
    outstanding = sum(p.amount_due - p.amount_paid for p in payments if p.amount_due > p.amount_paid)
    open_tasks = db.query(Task).filter(Task.status != TaskStatus.done).count()
    upcoming_appointments = db.query(Appointment).filter(Appointment.scheduled_at >= datetime.utcnow()).count()

    return {
        "total_customers": total_customers,
        "active_quotations": active_quotations,
        "pipeline_value": pipeline_value,
        "outstanding_payments": outstanding,
        "open_tasks": open_tasks,
        "upcoming_appointments": upcoming_appointments,
    }

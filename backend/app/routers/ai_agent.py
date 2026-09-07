from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.customer import Customer
from app.models.appointment import Appointment, AppointmentStatus
from app.models.quotation import Quotation, QuotationStatus
from app.models.payment import Payment, PaymentStatus
from app.models.task import Task, TaskStatus
from app.models.followup import FollowUp
from app.core.deps import get_current_user

router = APIRouter(prefix="/api/agent", tags=["ai_agent"])

# NOTE: This is a deterministic, rule-based "AI Daily Agent" so the MVP works
# with zero external dependencies. To upgrade to a real LLM-driven agent later:
#   1. Add ANTHROPIC_API_KEY to backend/.env
#   2. Install the `anthropic` python package
#   3. Feed the same context this endpoint gathers into a tool-calling prompt
#      (see Section 34 "AI Agent Safety Model" in the product plan: the model
#      should call the tools below rather than write to the DB directly).


@router.get("/daily-briefing")
def daily_briefing(db: Session = Depends(get_db), _=Depends(get_current_user)):
    now = datetime.utcnow()
    today_end = now.replace(hour=23, minute=59, second=59)

    todays_appointments = (
        db.query(Appointment)
        .filter(Appointment.scheduled_at >= now.replace(hour=0, minute=0, second=0))
        .filter(Appointment.scheduled_at <= today_end)
        .filter(Appointment.status.in_([AppointmentStatus.booked, AppointmentStatus.confirmed]))
        .order_by(Appointment.scheduled_at.asc())
        .all()
    )

    overdue_followups = (
        db.query(FollowUp)
        .filter(FollowUp.next_follow_up_date != None)  # noqa: E711
        .filter(FollowUp.next_follow_up_date <= now)
        .all()
    )

    stale_quotations = (
        db.query(Quotation)
        .filter(Quotation.status == QuotationStatus.sent)
        .filter(Quotation.next_follow_up != None)  # noqa: E711
        .filter(Quotation.next_follow_up <= now)
        .all()
    )

    overdue_payments = db.query(Payment).filter(Payment.status == PaymentStatus.overdue).all()
    if not overdue_payments:
        # also catch ones not yet flagged overdue by a background job
        overdue_payments = (
            db.query(Payment)
            .filter(Payment.due_date != None)  # noqa: E711
            .filter(Payment.due_date < now)
            .filter(Payment.amount_paid < Payment.amount_due)
            .all()
        )

    open_high_priority_tasks = (
        db.query(Task)
        .filter(Task.status != TaskStatus.done)
        .filter(Task.priority == "High")
        .all()
    )

    def cust_name(cid):
        c = db.query(Customer).filter(Customer.id == cid).first()
        return c.name if c else "Unknown"

    return {
        "date": now.strftime("%Y-%m-%d"),
        "todays_appointments": [
            {
                "id": a.id,
                "title": a.title,
                "customer": cust_name(a.customer_id),
                "time": a.scheduled_at.strftime("%I:%M %p"),
                "location": a.location,
            }
            for a in todays_appointments
        ],
        "overdue_followups": [
            {
                "id": f.id,
                "customer": cust_name(f.customer_id),
                "type": f.type.value if hasattr(f.type, "value") else f.type,
                "days_overdue": (now - f.next_follow_up_date).days if f.next_follow_up_date else 0,
            }
            for f in overdue_followups
        ],
        "stale_quotations": [
            {
                "id": q.id,
                "quotation_number": q.quotation_number,
                "customer": cust_name(q.customer_id),
                "value": q.total_value,
                "days_since_sent": (now - q.sent_at).days if q.sent_at else None,
            }
            for q in stale_quotations
        ],
        "overdue_payments": [
            {
                "id": p.id,
                "customer": cust_name(p.customer_id),
                "outstanding": p.amount_due - p.amount_paid,
                "due_date": p.due_date.strftime("%Y-%m-%d") if p.due_date else None,
            }
            for p in overdue_payments
        ],
        "high_priority_tasks": [
            {"id": t.id, "title": t.title, "due_date": t.due_date.strftime("%Y-%m-%d") if t.due_date else None}
            for t in open_high_priority_tasks
        ],
        "summary": (
            f"{len(todays_appointments)} appointment(s) today, "
            f"{len(overdue_followups)} follow-up(s) overdue, "
            f"{len(stale_quotations)} quotation(s) gone quiet, "
            f"{len(overdue_payments)} payment(s) overdue."
        ),
    }


@router.get("/what-am-i-forgetting")
def what_am_i_forgetting(db: Session = Depends(get_db), _=Depends(get_current_user)):
    now = datetime.utcnow()
    five_days_ago = now - timedelta(days=5)

    stuck_customers = (
        db.query(Customer)
        .filter(Customer.last_contact_date != None)  # noqa: E711
        .filter(Customer.last_contact_date <= five_days_ago)
        .filter(Customer.stage.notin_(["Completed", "After-Sales Follow-up"]))
        .all()
    )

    alerts = []
    for c in stuck_customers:
        days = (now - c.last_contact_date).days
        alerts.append(f"{c.name} has not been contacted for {days} days (stage: {c.stage.value}).")

    stale_quotations = (
        db.query(Quotation)
        .filter(Quotation.status == QuotationStatus.sent)
        .filter(Quotation.sent_at != None)  # noqa: E711
        .filter(Quotation.sent_at <= now - timedelta(days=7))
        .all()
    )
    for q in stale_quotations:
        days = (now - q.sent_at).days
        alerts.append(f"Quotation {q.quotation_number} was sent {days} days ago with no follow-up logged.")

    return {"alerts": alerts, "count": len(alerts)}

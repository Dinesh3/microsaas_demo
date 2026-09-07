from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.db.session import get_db
from app.models.followup import FollowUp
from app.schemas.followup import FollowUpCreate, FollowUpUpdate, FollowUpOut
from app.core.deps import get_current_user

router = APIRouter(prefix="/api/followups", tags=["followups"])


@router.get("", response_model=list[FollowUpOut])
def list_followups(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(FollowUp).order_by(FollowUp.next_follow_up_date.asc().nulls_last()).all()


@router.post("", response_model=FollowUpOut)
def create_followup(payload: FollowUpCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    followup = FollowUp(**payload.model_dump(), last_contact_date=datetime.utcnow())
    db.add(followup)
    db.commit()
    db.refresh(followup)
    return followup


@router.put("/{followup_id}", response_model=FollowUpOut)
def update_followup(
    followup_id: str, payload: FollowUpUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)
):
    followup = db.query(FollowUp).filter(FollowUp.id == followup_id).first()
    if not followup:
        raise HTTPException(status_code=404, detail="Follow-up not found")
    data = payload.model_dump(exclude_unset=True)
    if "last_conversation" in data:
        followup.last_contact_date = datetime.utcnow()
    for field, value in data.items():
        setattr(followup, field, value)
    db.commit()
    db.refresh(followup)
    return followup


@router.delete("/{followup_id}")
def delete_followup(followup_id: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    followup = db.query(FollowUp).filter(FollowUp.id == followup_id).first()
    if not followup:
        raise HTTPException(status_code=404, detail="Follow-up not found")
    db.delete(followup)
    db.commit()
    return {"ok": True}

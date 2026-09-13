import uuid
from datetime import date as date_type, time as time_type, datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import RoutineItem, Domain, RoutineStatus, RecurrenceRule, User
from app.auth import get_current_user

router = APIRouter(prefix="/routines", tags=["routines"])

def ensure_todays_recurring_instances(db: Session, user_id, target_date):
    templates = (
        db.query(RoutineItem)
        .filter(
            RoutineItem.user_id == user_id,
            RoutineItem.is_recurring == True,
            RoutineItem.template_id.is_(None),
        )
        .all()
    )
    for template in templates:
        if template.recurrence_rule == RecurrenceRule.weekly:
            if template.scheduled_date.weekday() != target_date.weekday():
                continue
        exists = (
            db.query(RoutineItem)
            .filter(RoutineItem.template_id == template.id, RoutineItem.scheduled_date == target_date)
            .first()
        )
        if exists:
            continue
        instance = RoutineItem(
            user_id=user_id,
            title=template.title,
            domain=template.domain,
            scheduled_date=target_date,
            scheduled_time=template.scheduled_time,
            template_id=template.id,
        )
        db.add(instance)
    db.commit()



class RoutineItemCreate(BaseModel):
    title: str
    domain: Domain
    scheduled_date: date_type
    scheduled_time: Optional[time_type] = None
    is_recurring: bool = False
    recurrence_rule: Optional[RecurrenceRule] = None


class RoutineItemUpdate(BaseModel):
    title: Optional[str] = None
    domain: Optional[Domain] = None
    scheduled_time: Optional[time_type] = None
    status: Optional[RoutineStatus] = None


class RoutineItemOut(BaseModel):
    id: uuid.UUID
    title: str
    domain: Domain
    scheduled_date: date_type
    scheduled_time: Optional[time_type]
    status: RoutineStatus
    is_recurring: bool
    recurrence_rule: Optional[RecurrenceRule]

    class Config:
        from_attributes = True


@router.get("", response_model=list[RoutineItemOut])
def list_routines(
    target_date: Optional[date_type] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if target_date is None:
        target_date = date_type.today()
    ensure_todays_recurring_instances(db, current_user.id, target_date)
    items = (
        db.query(RoutineItem)
        .filter(RoutineItem.user_id == current_user.id, RoutineItem.scheduled_date == target_date)
        .order_by(RoutineItem.scheduled_time.asc().nulls_last())
        .all()
    )
    return items


@router.post("", response_model=RoutineItemOut, status_code=status.HTTP_201_CREATED)
def create_routine(
    payload: RoutineItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = RoutineItem(user_id=current_user.id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/{item_id}", response_model=RoutineItemOut)
def update_routine(
    item_id: uuid.UUID,
    payload: RoutineItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.query(RoutineItem).filter(RoutineItem.id == item_id, RoutineItem.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Routine item not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_routine(
    item_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.query(RoutineItem).filter(RoutineItem.id == item_id, RoutineItem.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Routine item not found")
    db.delete(item)
    db.commit()


@router.get("/focus")
def focus_view(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    today = date_type.today()
    ensure_todays_recurring_instances(db, current_user.id, today)
    items = db.query(RoutineItem).filter(
        RoutineItem.user_id == current_user.id, RoutineItem.scheduled_date == today
    ).all()

    now = datetime.now().time()
    timed = sorted([i for i in items if i.scheduled_time], key=lambda i: i.scheduled_time)
    current = None
    up_next = None
    for i in timed:
        if i.scheduled_time <= now:
            current = i
        elif i.scheduled_time > now and up_next is None:
            up_next = i
    in_progress = [i for i in items if not i.scheduled_time and i.status == RoutineStatus.pending]

    def shape(i):
        return None if i is None else {"id": str(i.id), "title": i.title, "domain": i.domain, "scheduled_time": str(i.scheduled_time) if i.scheduled_time else None}

    return {
        "current_activity": shape(current),
        "up_next": shape(up_next),
        "in_progress": [shape(i) for i in in_progress],
    }



import uuid
from datetime import date as date_type, time as time_type
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import RoutineItem, Domain, RoutineStatus, RecurrenceRule, User
from app.auth import get_current_user

router = APIRouter(prefix="/routines", tags=["routines"])


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

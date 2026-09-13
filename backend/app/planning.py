import uuid
from datetime import date as date_type
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import PlanningItem, PlanningHorizon, PlanningStatus, User
from app.auth import get_current_user

router = APIRouter(prefix="/planning", tags=["planning"])


class PlanningItemCreate(BaseModel):
    title: str
    horizon: PlanningHorizon
    target_date: Optional[date_type] = None
    notes: Optional[str] = None


class PlanningItemUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[PlanningStatus] = None
    notes: Optional[str] = None


class PlanningItemOut(BaseModel):
    id: uuid.UUID
    title: str
    horizon: PlanningHorizon
    target_date: Optional[date_type]
    notes: Optional[str]
    status: PlanningStatus

    class Config:
        from_attributes = True


@router.get("", response_model=list[PlanningItemOut])
def list_planning(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(PlanningItem).filter(PlanningItem.user_id == current_user.id).all()


@router.post("", response_model=PlanningItemOut, status_code=status.HTTP_201_CREATED)
def create_planning(payload: PlanningItemCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = PlanningItem(user_id=current_user.id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/{item_id}", response_model=PlanningItemOut)
def update_planning(item_id: uuid.UUID, payload: PlanningItemUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(PlanningItem).filter(PlanningItem.id == item_id, PlanningItem.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Planning item not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_planning(item_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(PlanningItem).filter(PlanningItem.id == item_id, PlanningItem.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Planning item not found")
    db.delete(item)
    db.commit()

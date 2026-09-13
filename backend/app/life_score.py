from datetime import date as date_type
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import RoutineItem, RoutineStatus, User
from app.auth import get_current_user

router = APIRouter(tags=["life-score"])


@router.get("/life-score")
def life_score(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    today = date_type.today()
    items = db.query(RoutineItem).filter(
        RoutineItem.user_id == current_user.id, RoutineItem.scheduled_date == today
    ).all()

    by_domain = {}
    for i in items:
        by_domain.setdefault(i.domain.value, []).append(i)

    per_domain = {}
    for domain, domain_items in by_domain.items():
        done = sum(1 for i in domain_items if i.status == RoutineStatus.done)
        per_domain[domain] = round(done / len(domain_items) * 100)

    overall = round(sum(per_domain.values()) / len(per_domain)) if per_domain else 0
    return {"overall_pct": overall, "per_domain": per_domain}

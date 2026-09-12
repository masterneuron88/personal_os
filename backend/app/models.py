import uuid
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

import enum
from sqlalchemy import Enum, Date, Time, Boolean, ForeignKey
from sqlalchemy.orm import relationship


class Domain(str, enum.Enum):
    work = "work"
    health = "health"
    family = "family"
    wealth = "wealth"
    me = "me"


class RoutineStatus(str, enum.Enum):
    pending = "pending"
    done = "done"


class RecurrenceRule(str, enum.Enum):
    none = "none"
    daily = "daily"
    weekly = "weekly"


class RoutineItem(Base):
    __tablename__ = "routine_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    domain = Column(Enum(Domain), nullable=False)
    scheduled_date = Column(Date, nullable=False)
    scheduled_time = Column(Time, nullable=True)
    status = Column(Enum(RoutineStatus), nullable=False, default=RoutineStatus.pending)
    is_recurring = Column(Boolean, nullable=False, default=False)
    recurrence_rule = Column(Enum(RecurrenceRule), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class PlanningHorizon(str, enum.Enum):
    today = "today"
    month = "month"
    year = "year"
    custom = "custom"


class PlanningStatus(str, enum.Enum):
    open = "open"
    promoted = "promoted"
    archived = "archived"


class PlanningItem(Base):
    __tablename__ = "planning_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    horizon = Column(Enum(PlanningHorizon), nullable=False)
    target_date = Column(Date, nullable=True)
    notes = Column(String, nullable=True)
    status = Column(Enum(PlanningStatus), nullable=False, default=PlanningStatus.open)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

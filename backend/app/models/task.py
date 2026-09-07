import enum
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Enum, Text
from app.db.session import Base


class TaskPriority(str, enum.Enum):
    low = "Low"
    medium = "Medium"
    high = "High"


class TaskStatus(str, enum.Enum):
    open = "Open"
    in_progress = "In Progress"
    done = "Done"


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    customer_id = Column(String, nullable=True)
    assigned_to_user_id = Column(String, nullable=True)
    due_date = Column(DateTime, nullable=True)
    priority = Column(Enum(TaskPriority), default=TaskPriority.medium, nullable=False)
    status = Column(Enum(TaskStatus), default=TaskStatus.open, nullable=False)
    source = Column(String, default="manual")  # manual | ai
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

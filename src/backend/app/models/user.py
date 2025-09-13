from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import relationship

from ..core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    appointments = relationship("Appointment", back_populates="user", cascade="all, delete-orphan")
    points = relationship("RewardPoint", back_populates="user", cascade="all, delete-orphan")
    alerts = relationship("EmergencyAlert", back_populates="user", cascade="all, delete-orphan")
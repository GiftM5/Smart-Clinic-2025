from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from ..core.database import Base


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    clinic_name = Column(String, nullable=False)
    clinic_location = Column(String, nullable=True)
    time_slot = Column(String, nullable=False)
    status = Column(String, nullable=False, default="booked")
    symptoms = Column(String, nullable=True)
    ai_recommendation = Column(String, nullable=True)
    pdf_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="appointments")
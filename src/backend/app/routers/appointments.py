from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.security import get_current_user
from ..models.appointment import Appointment
from ..schemas.appointment import AppointmentCreate, AppointmentRead


router = APIRouter(prefix="/appointments", tags=["appointments"])


@router.post("/", response_model=AppointmentRead)
def create_appointment(
    payload: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    appt = Appointment(
        user_id=current_user.id,
        clinic_name=payload.clinic_name,
        clinic_location=payload.clinic_location,
        time_slot=payload.time_slot,
        status="booked",
        symptoms=payload.symptoms,
        ai_recommendation=payload.ai_recommendation,
    )
    db.add(appt)
    db.commit()
    db.refresh(appt)
    return appt


@router.get("/upcoming", response_model=list[AppointmentRead])
def list_upcoming(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    appts = (
        db.query(Appointment)
        .filter(Appointment.user_id == current_user.id)
        .order_by(Appointment.created_at.desc())
        .all()
    )
    return appts


@router.delete("/{appointment_id}")
def cancel_appointment(appointment_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    appt = db.query(Appointment).filter(Appointment.id == appointment_id, Appointment.user_id == current_user.id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    appt.status = "cancelled"
    db.commit()
    return {"ok": True}
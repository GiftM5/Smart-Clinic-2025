from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.security import get_current_user
from ..models.emergency import EmergencyAlert
from ..schemas.emergency import EmergencyCreate, EmergencyRead


router = APIRouter(prefix="/emergency", tags=["emergency"])


@router.post("/alert", response_model=EmergencyRead)
def send_alert(payload: EmergencyCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    alert = EmergencyAlert(user_id=current_user.id, location=payload.location, summary=payload.summary, status="sent")
    db.add(alert)
    db.commit()
    db.refresh(alert)
    # Placeholder: integrate with SMS/email providers
    return alert
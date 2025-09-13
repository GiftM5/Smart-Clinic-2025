from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.security import get_current_user
from ..models.reward import RewardPoint
from ..schemas.points import PointsCreate, PointsRead


router = APIRouter(prefix="/points", tags=["points"])


@router.post("/earn", response_model=PointsRead)
def earn_points(payload: PointsCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    entry = RewardPoint(user_id=current_user.id, points=payload.points, reason=payload.reason)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/balance")
def get_balance(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    total = db.query(RewardPoint).filter(RewardPoint.user_id == current_user.id).all()
    balance = sum(e.points for e in total)
    return {"balance": balance}
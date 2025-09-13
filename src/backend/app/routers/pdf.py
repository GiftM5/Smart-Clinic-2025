import os
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

from ..core.database import get_db
from ..core.security import get_current_user


router = APIRouter(prefix="/pdf", tags=["pdf"])


@router.post("/recommendation")
def generate_recommendation_pdf(
    data: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    output_dir = "/src/backend/generated"
    os.makedirs(output_dir, exist_ok=True)
    file_name = f"recommendation_{current_user.id}_{int(datetime.utcnow().timestamp())}.pdf"
    file_path = os.path.join(output_dir, file_name)

    c = canvas.Canvas(file_path, pagesize=A4)
    width, height = A4
    y = height - 50
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, y, "Smart Clinic - Recommendation Summary")
    y -= 30
    c.setFont("Helvetica", 12)
    c.drawString(50, y, f"Patient: {current_user.full_name or current_user.email}")
    y -= 20
    c.drawString(50, y, f"Date: {datetime.utcnow().isoformat()}Z")
    y -= 30
    for key, value in data.items():
        c.drawString(50, y, f"{key}: {value}")
        y -= 18
        if y < 60:
            c.showPage()
            y = height - 50
    c.showPage()
    c.save()
    return {"pdf_path": file_path}
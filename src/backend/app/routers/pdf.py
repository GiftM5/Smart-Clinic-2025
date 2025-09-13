import os
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

from ..core.database import get_db
from ..core.security import get_current_user

router = APIRouter(prefix="/pdf", tags=["pdf"])


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_DIR = os.path.join(BASE_DIR, "generated")

# Make sure the folder exists
os.makedirs(OUTPUT_DIR, exist_ok=True)


@router.post("/recommendation")
def generate_recommendation_pdf(
    data: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Generate a recommendation PDF with patient details and AI suggestions.
    """
    try:
        file_name = f"recommendation_{current_user.id}_{int(datetime.utcnow().timestamp())}.pdf"
        file_path = os.path.join(OUTPUT_DIR, file_name)

        c = canvas.Canvas(file_path, pagesize=A4)
        width, height = A4
        y = height - 50

        # Title
        c.setFont("Helvetica-Bold", 16)
        c.drawString(50, y, "Smart Clinic - Recommendation Summary")
        y -= 30

        # Patient info
        c.setFont("Helvetica", 12)
        c.drawString(50, y, f"Patient: {current_user.full_name or current_user.email}")
        y -= 20
        c.drawString(50, y, f"Date: {datetime.utcnow().isoformat()}Z")
        y -= 30

        # Dynamic content
        for key, value in data.items():
            c.drawString(50, y, f"{key}: {value}")
            y -= 18
            if y < 60:  # Page break
                c.showPage()
                y = height - 50
                c.setFont("Helvetica", 12)

        c.showPage()
        c.save()

      
        download_url = f"/static/generated/{file_name}"

        return {
            "message": "PDF generated successfully",
            "download_url": download_url,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")

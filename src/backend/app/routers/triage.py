from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..schemas.triage import SymptomInput, TriageResult


router = APIRouter(prefix="/triage", tags=["triage"])


@router.post("/check", response_model=TriageResult)
def check_symptoms(payload: SymptomInput, db: Session = Depends(get_db)):
    # Simple rules-based MVP triage; placeholder for GPT integration
    reasons: list[str] = []
    severity = "mild"

    if payload.temperature_c and payload.temperature_c >= 39.0:
        severity = "urgent"
        reasons.append("High fever")
    if payload.spo2 and payload.spo2 < 92:
        severity = "urgent"
        reasons.append("Low oxygen saturation")
    if payload.heart_rate_bpm and payload.heart_rate_bpm > 120:
        severity = "moderate" if severity != "urgent" else severity
        reasons.append("Elevated heart rate")

    symptoms_text = (payload.symptoms or "").lower()
    red_flags = ["chest pain", "severe", "unconscious", "stroke", "bleeding"]
    if any(flag in symptoms_text for flag in red_flags):
        severity = "urgent"
        reasons.append("Red flag symptom detected")

    if severity == "urgent":
        recommendation = "Seek urgent care at the nearest clinic or hospital."
    elif severity == "moderate":
        recommendation = "Visit a pharmacy or clinic soon. Monitor symptoms closely."
    else:
        recommendation = "Home care with rest, fluids, and OTC meds. Reassess in 24h."

    if not reasons:
        reasons.append("No red flags detected")

    return TriageResult(severity=severity, recommendation=recommendation, reasons=reasons)
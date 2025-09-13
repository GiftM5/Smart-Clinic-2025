from pydantic import BaseModel


class SymptomInput(BaseModel):
    symptoms: str
    temperature_c: float | None = None
    heart_rate_bpm: int | None = None
    systolic_bp: int | None = None
    diastolic_bp: int | None = None
    spo2: int | None = None


class TriageResult(BaseModel):
    severity: str  # mild | moderate | urgent
    recommendation: str
    reasons: list[str]
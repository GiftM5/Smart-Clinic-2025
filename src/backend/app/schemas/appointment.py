from pydantic import BaseModel


class AppointmentCreate(BaseModel):
    clinic_name: str
    clinic_location: str | None = None
    time_slot: str
    symptoms: str | None = None
    ai_recommendation: str | None = None


class AppointmentRead(BaseModel):
    id: int
    clinic_name: str
    clinic_location: str | None
    time_slot: str
    status: str
    symptoms: str | None
    ai_recommendation: str | None
    pdf_path: str | None

    class Config:
        from_attributes = True
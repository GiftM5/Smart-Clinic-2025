from pydantic import BaseModel


class EmergencyCreate(BaseModel):
    location: str | None = None
    summary: str | None = None


class EmergencyRead(BaseModel):
    id: int
    location: str | None
    summary: str | None
    status: str

    class Config:
        from_attributes = True
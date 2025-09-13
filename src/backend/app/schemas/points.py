from pydantic import BaseModel


class PointsCreate(BaseModel):
    points: int
    reason: str | None = None


class PointsRead(BaseModel):
    id: int
    points: int
    reason: str | None

    class Config:
        from_attributes = True
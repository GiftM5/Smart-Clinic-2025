from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.database import Base, engine
from .routers import auth, triage, appointments, emergency, points, pdf
from .routers import auth, triage, appointments, emergency, points, pdf, chat

app = FastAPI(title="Smart Clinic API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def healthcheck():
    return {"status": "ok"}


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


app.include_router(auth.router)
app.include_router(triage.router)
app.include_router(appointments.router)
app.include_router(emergency.router)
app.include_router(points.router)
app.include_router(pdf.router)
app.include_router(chat.router)
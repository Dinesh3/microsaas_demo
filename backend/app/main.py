from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.session import Base, engine, SessionLocal
from app import models  # noqa: F401  (ensures models are registered before create_all)
from app.seed import run_seed

from app.routers import (
    auth,
    customers,
    appointments,
    tasks,
    followups,
    products,
    quotations,
    payments,
    ai_agent,
    dashboard,
)

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        run_seed(db)
    finally:
        db.close()


app.include_router(auth.router)
app.include_router(customers.router)
app.include_router(appointments.router)
app.include_router(tasks.router)
app.include_router(followups.router)
app.include_router(products.router)
app.include_router(quotations.router)
app.include_router(payments.router)
app.include_router(ai_agent.router)
app.include_router(dashboard.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "app": settings.APP_NAME}

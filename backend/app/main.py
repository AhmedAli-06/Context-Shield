# pyrefly: ignore [missing-import]
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import engine, Base
from app.routers.auth import router as auth_router
from app.routers.dashboard import router as dashboard_router
from app.routers.assets import router as assets_router
from app.routers.events import router as events_router
from app.routers.alerts import router as alerts_router
from app.routers.sessions import router as sessions_router
from app.routers.settings import router as settings_router
from app.routers.api_keys import router as api_keys_router
from app.routers.reports import router as reports_router
from app.routers.audit import router as audit_router
from app.routers.ws import router as ws_router
from app.middleware.audit import AuditMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        import app.models  # noqa: F401
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()

app = FastAPI(
    title="ContextShield API",
    description="Intent-Aware Physical Asset Security Platform",
    version="0.2.0-alpha",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(AuditMiddleware)

app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(assets_router)
app.include_router(events_router)
app.include_router(alerts_router)
app.include_router(sessions_router)
app.include_router(settings_router)
app.include_router(api_keys_router)
app.include_router(reports_router)
app.include_router(audit_router)
app.include_router(ws_router)

@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.2.0-alpha", "service": "contextshield"}

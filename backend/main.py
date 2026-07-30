# ============================================================
# MediVision AI – FastAPI Backend Entry Point (Strict Medical Domain Guardrails Active)
# ============================================================
import os
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes import health, predict, reports, hospitals, auth, assistant
from app.core.config import settings
from app.core.logging import setup_logging
from app.db.database import Base, engine

setup_logging()

# Ensure uploads directory exists
UPLOADS_DIR = Path(__file__).resolve().parent / "static" / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup / shutdown lifecycle."""
    # Create SQLite database tables
    Base.metadata.create_all(bind=engine)

    from app.ai.model_loader import ModelLoader
    # Lazy load models on demand to conserve RAM on 512MB free tier containers
    if not os.environ.get("RENDER") and not settings.DEMO_MODE:
        ModelLoader.warm_up()
    yield
    ModelLoader.unload_all()       # Release memory on shutdown


app = FastAPI(
    title=settings.APP_NAME,
    description="AI-assisted clinical screening API for MediVision AI",
    version=settings.APP_VERSION,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# ── Middleware ──────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1024)

# ── Static Files (Uploads & Heatmaps) ──────────────────────
app.mount("/static", StaticFiles(directory=Path(__file__).resolve().parent / "static"), name="static")

# ── Routers ─────────────────────────────────────────────────
app.include_router(health.router,    prefix="/api/v1",          tags=["Health"])
app.include_router(auth.router,      prefix="/api/v1/auth",     tags=["Auth"])
app.include_router(predict.router,   prefix="/api/v1/predict",  tags=["Prediction"])
app.include_router(reports.router,   prefix="/api/v1/reports",  tags=["Reports"])
app.include_router(hospitals.router, prefix="/api/v1/hospitals",tags=["Hospitals"])
app.include_router(assistant.router, prefix="/api/v1/assistant",tags=["Assistant"])

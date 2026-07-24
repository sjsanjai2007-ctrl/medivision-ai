# ============================================================
# MediVision AI – FastAPI Backend Entry Point
# ============================================================
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.api.routes import health, predict, reports, hospitals, auth
from app.core.config import settings
from app.core.logging import setup_logging

setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup / shutdown lifecycle."""
    from app.ai.model_loader import ModelLoader
    ModelLoader.warm_up()          # Pre-load all models into memory
    yield
    ModelLoader.unload_all()       # Release GPU memory on shutdown


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
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1024)

# ── Routers ─────────────────────────────────────────────────
app.include_router(health.router,    prefix="/api/v1",          tags=["Health"])
app.include_router(auth.router,      prefix="/api/v1/auth",     tags=["Auth"])
app.include_router(predict.router,   prefix="/api/v1/predict",  tags=["Prediction"])
app.include_router(reports.router,   prefix="/api/v1/reports",  tags=["Reports"])
app.include_router(hospitals.router, prefix="/api/v1/hospitals",tags=["Hospitals"])

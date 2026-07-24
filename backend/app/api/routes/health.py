"""Health check endpoint."""
from fastapi import APIRouter
from app.ai.model_loader import ModelLoader
from app.core.config import settings
from app.schemas.schemas import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse, summary="Health Check")
async def health_check() -> HealthResponse:
    return HealthResponse(
        status="ok",
        version=settings.APP_VERSION,
        demo_mode=settings.DEMO_MODE,
        models_loaded=ModelLoader.loaded_categories(),
    )

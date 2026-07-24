# ============================================================
# MediVision AI – Application Configuration
# ============================================================
from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # App
    APP_NAME: str = "MediVision AI"
    APP_VERSION: str = "1.0.0"
    DEMO_MODE: bool = True

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 1

    # Security
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7   # 7 days

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://medivision-ai-smoky.vercel.app",
    ]

    # Database
    DATABASE_URL: str = "sqlite:///./medivision.db"   # SQLite for dev

    # Redis (optional)
    REDIS_URL: str = "redis://localhost:6379/0"

    # Storage
    CLOUDINARY_URL: str = ""
    AWS_BUCKET_NAME: str = ""
    AWS_REGION: str = "ap-south-1"

    # AI Models
    MODELS_DIR: str = "backend/app/ai/models"
    MAX_IMAGE_SIZE_MB: int = 10
    CONFIDENCE_THRESHOLD: float = 0.65

    # Google Maps
    GOOGLE_MAPS_API_KEY: str = ""


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

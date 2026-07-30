"""
Centralized Core Configuration Module
─────────────────────────────────────
Loads environment settings via Pydantic BaseSettings.
"""
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "MediVision AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    PORT: int = 8000
    API_V1_STR: str = "/api/v1"

    # General & Demo Mode
    DEMO_MODE: bool = True
    MAX_IMAGE_SIZE_MB: int = 10
    CONFIDENCE_THRESHOLD: float = 0.65

    # Database
    DATABASE_URL: str = "sqlite:///./medivision.db"

    # Security & JWT
    SECRET_KEY: str = "medivision-super-secret-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "https://medivision-ai-smoky.vercel.app",
        "*"
    ]

    # Hospital Search (OpenStreetMap)
    NOMINATIM_URL: str = "https://nominatim.openstreetmap.org"
    OVERPASS_URL: str = "https://overpass-api.de/api/interpreter"
    USER_AGENT: str = "MediVisionAI/1.0 (sih-screening-app)"

    # Cloud Live LLM API (Google Gemini / OpenAI)
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    LLM_PROVIDER: str = "gemini"  # gemini, openai, ollama, auto
    GEMINI_MODEL: str = "gemini-1.5-flash"

    # Local LLM & RAG (Ollama & ChromaDB)
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_PRIMARY_MODEL: str = "gemma3:4b"
    OLLAMA_ALT_MODEL: str = "llama3.2"
    EMBEDDING_MODEL: str = "BAAI/bge-small-en-v1.5"

    # Redis Cache
    REDIS_URL: str = "redis://localhost:6379/0"

    # Directories
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    UPLOAD_DIR: Path = BASE_DIR / "static" / "uploads"
    MODEL_DIR: Path = BASE_DIR / "app" / "ai" / "models"
    MODELS_DIR: Path = BASE_DIR / "app" / "ai" / "models"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()

"""
AI Prediction Route
────────────────────
POST /api/v1/predict/{category}
Accepts a multipart image upload and returns a structured prediction result.
"""
from __future__ import annotations

import io

from fastapi import APIRouter, File, HTTPException, Path, UploadFile
from loguru import logger
from PIL import Image

from app.ai.predict import prediction_service
from app.ai.preprocessing import ImagePreprocessor
from app.core.config import settings
from app.schemas.schemas import MedicalCategory, PredictionResult

router = APIRouter()

ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp"}
MAX_BYTES = settings.MAX_IMAGE_SIZE_MB * 1024 * 1024


@router.post(
    "/{category}",
    response_model=PredictionResult,
    summary="Predict Medical Condition",
    description=(
        "Upload a medical image to receive an AI-assisted screening result. "
        "In demo mode, returns realistic mock data without running the model."
    ),
)
async def predict(
    category: MedicalCategory = Path(..., description="Medical image category"),
    file: UploadFile = File(..., description="Medical image (JPEG/PNG/WebP, max 10 MB)"),
    demo_mode: bool = True,
) -> PredictionResult:
    # Validate MIME type
    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{file.content_type}'. Use JPEG, PNG, or WebP.",
        )

    image_bytes = await file.read()

    # Validate file size
    if len(image_bytes) > MAX_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"Image too large. Maximum size is {settings.MAX_IMAGE_SIZE_MB} MB.",
        )

    # Validate it's a valid image
    try:
        Image.open(io.BytesIO(image_bytes)).verify()
    except Exception:
        raise HTTPException(status_code=422, detail="File is not a valid image.")

    logger.info(f"Prediction request | category={category} | demo={demo_mode} | size={len(image_bytes)} bytes")

    result = await prediction_service.predict(
        image_bytes=image_bytes,
        category=category.value,
        demo_mode=demo_mode,
    )
    return result


@router.post(
    "/{category}/quality",
    summary="Image Quality Check",
    description="Returns quality metrics (blur, brightness, resolution, contrast) for a medical image.",
)
async def quality_check(
    category: MedicalCategory = Path(...),
    file: UploadFile = File(...),
) -> dict:
    image_bytes = await file.read()
    try:
        image = Image.open(io.BytesIO(image_bytes))
    except Exception:
        raise HTTPException(status_code=422, detail="Invalid image file.")

    preprocessor = ImagePreprocessor(category.value)
    metrics = preprocessor.check_quality(image)
    return {"category": category.value, "quality": metrics}

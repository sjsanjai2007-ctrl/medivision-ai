"""Pydantic schemas for API request/response validation."""
from __future__ import annotations

from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


# ── Enums ──────────────────────────────────────────────────
class MedicalCategory(str, Enum):
    SKIN    = "skin"
    EYE     = "eye"
    CHEST   = "chest"
    DENTAL  = "dental"
    ORAL    = "oral"
    BURNS   = "burns"
    WOUNDS  = "wounds"


class Severity(str, Enum):
    MILD     = "mild"
    MODERATE = "moderate"
    SEVERE   = "severe"
    CRITICAL = "critical"


# ── Prediction ─────────────────────────────────────────────
class BoundingBox(BaseModel):
    x: float = Field(..., ge=0, le=1, description="Normalised X (0–1)")
    y: float = Field(..., ge=0, le=1, description="Normalised Y (0–1)")
    width: float = Field(..., ge=0, le=1)
    height: float = Field(..., ge=0, le=1)
    label: str
    confidence: float = Field(..., ge=0, le=1)


class PredictionResult(BaseModel):
    category: MedicalCategory
    condition: str
    confidence: float = Field(..., ge=0, le=1)
    severity: Severity
    description: str
    recommendations: List[str]
    bounding_boxes: List[BoundingBox] = []
    heatmap_url: Optional[str] = None
    report_id: str


class PredictionRequest(BaseModel):
    category: MedicalCategory
    demo_mode: bool = True


# ── Reports ────────────────────────────────────────────────
class ReportSummary(BaseModel):
    id: str
    category: MedicalCategory
    condition: str
    severity: Severity
    confidence: float
    created_at: str
    image_url: Optional[str] = None


class ReportDetail(ReportSummary):
    description: str
    recommendations: List[str]
    bounding_boxes: List[BoundingBox] = []
    heatmap_url: Optional[str] = None
    disclaimer: str = (
        "MediVision AI provides AI-assisted clinical screening for informational "
        "purposes only. Results are NOT a medical diagnosis. Always consult a "
        "qualified healthcare professional for diagnosis and treatment."
    )


# ── Hospitals ──────────────────────────────────────────────
class HospitalSchema(BaseModel):
    id: str
    name: str
    address: str
    rating: float
    reviews: int
    distance_km: float
    travel_time_min: int
    is_open: bool
    specialties: List[str]
    phone: Optional[str] = None
    image_url: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None


# ── Auth ────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str = Field(..., min_length=6)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    name: str
    email: str


# ── Health ──────────────────────────────────────────────────
class HealthResponse(BaseModel):
    status: str
    version: str
    demo_mode: bool
    models_loaded: List[str]

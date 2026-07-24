"""
MediVision AI Backend – Test Suite
════════════════════════════════════
Tests for all major API endpoints.
Run: pytest backend/tests/ -v
"""
import io
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient
from PIL import Image

# Add backend to path
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from main import app

client = TestClient(app)


# ── Helpers ─────────────────────────────────────────────────
def make_test_image(size=(224, 224), color=(200, 100, 50)) -> bytes:
    img = Image.new("RGB", size, color=color)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


# ── Health ──────────────────────────────────────────────────
def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data
    assert "demo_mode" in data


# ── Auth ────────────────────────────────────────────────────
def test_demo_login():
    response = client.post("/api/v1/auth/login", json={
        "email": "demo@medivision.ai",
        "password": "demo",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_register():
    response = client.post("/api/v1/auth/register", json={
        "name": "Test User",
        "email": "test@example.com",
        "password": "secure123",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test User"


# ── Prediction ──────────────────────────────────────────────
@pytest.mark.parametrize("category", ["skin", "eye", "chest", "dental", "oral", "burns", "wounds"])
def test_predict_demo_mode(category: str):
    image_bytes = make_test_image()
    response = client.post(
        f"/api/v1/predict/{category}?demo_mode=true",
        files={"file": ("test.jpg", io.BytesIO(image_bytes), "image/jpeg")},
    )
    assert response.status_code == 200
    data = response.json()
    assert "condition" in data
    assert "confidence" in data
    assert "severity" in data
    assert "recommendations" in data
    assert "report_id" in data
    assert data["category"] == category


def test_predict_invalid_mime():
    response = client.post(
        "/api/v1/predict/skin?demo_mode=true",
        files={"file": ("test.pdf", io.BytesIO(b"%PDF-1.4"), "application/pdf")},
    )
    assert response.status_code == 415


def test_quality_check():
    image_bytes = make_test_image()
    response = client.post(
        "/api/v1/predict/skin/quality",
        files={"file": ("test.jpg", io.BytesIO(image_bytes), "image/jpeg")},
    )
    assert response.status_code == 200
    data = response.json()
    assert "quality" in data
    quality = data["quality"]
    assert all(k in quality for k in ["blur", "brightness", "resolution", "contrast", "overall"])


# ── Reports ─────────────────────────────────────────────────
def test_list_reports():
    response = client.get("/api/v1/reports/")
    assert response.status_code == 200
    reports = response.json()
    assert isinstance(reports, list)
    assert len(reports) > 0


def test_get_report_detail():
    response = client.get("/api/v1/reports/rpt-001")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "rpt-001"
    assert "disclaimer" in data


def test_report_not_found():
    response = client.get("/api/v1/reports/nonexistent")
    assert response.status_code == 404


# ── Hospitals ────────────────────────────────────────────────
def test_list_hospitals():
    response = client.get("/api/v1/hospitals/")
    assert response.status_code == 200
    hospitals = response.json()
    assert isinstance(hospitals, list)
    assert len(hospitals) > 0


def test_hospital_open_filter():
    response = client.get("/api/v1/hospitals/?open_only=true")
    assert response.status_code == 200
    hospitals = response.json()
    assert all(h["is_open"] for h in hospitals)


def test_best_match_hospital():
    response = client.get("/api/v1/hospitals/recommend?condition=Psoriasis")
    assert response.status_code == 200
    data = response.json()
    assert "name" in data
    assert "specialties" in data

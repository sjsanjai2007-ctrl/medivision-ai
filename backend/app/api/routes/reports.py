"""
Reports Route
──────────────
CRUD operations for AI screening reports.
In demo mode, serves from in-memory fixture data.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, HTTPException, Path, Query

from app.schemas.schemas import MedicalCategory, ReportDetail, ReportSummary, Severity

router = APIRouter()

# ── In-memory demo reports ──────────────────────────────────
_DEMO_REPORTS: List[ReportDetail] = [
    ReportDetail(
        id="rpt-001",
        category=MedicalCategory.SKIN,
        condition="Moderate Psoriasis",
        severity=Severity.MODERATE,
        confidence=0.94,
        created_at="2026-07-19T09:15:00Z",
        image_url="/demo/skin_scan.jpg",
        description="Plaque psoriasis with characteristic scaly patches identified on the elbow area.",
        recommendations=[
            "Consult a dermatologist within 2–3 days",
            "Apply fragrance-free moisturiser twice daily",
            "Avoid known triggers: stress and alcohol",
        ],
        heatmap_url="/demo/skin_heatmap.jpg",
    ),
    ReportDetail(
        id="rpt-002",
        category=MedicalCategory.EYE,
        condition="Mild Conjunctivitis",
        severity=Severity.MILD,
        confidence=0.89,
        created_at="2026-07-15T14:30:00Z",
        image_url="/demo/eye_scan.jpg",
        description="Viral conjunctivitis detected with mild redness and watery discharge.",
        recommendations=[
            "Wash hands frequently",
            "Apply cool compresses for relief",
            "Avoid touching eyes",
        ],
        heatmap_url="/demo/eye_heatmap.jpg",
    ),
    ReportDetail(
        id="rpt-003",
        category=MedicalCategory.CHEST,
        condition="Normal Chest X-Ray",
        severity=Severity.MILD,
        confidence=0.97,
        created_at="2026-07-08T11:00:00Z",
        image_url="/demo/chest_scan.jpg",
        description="No significant pathological findings. Lung fields appear clear.",
        recommendations=[
            "No immediate action required",
            "Continue routine annual screenings",
        ],
        heatmap_url="/demo/chest_heatmap.jpg",
    ),
]


@router.get("/", response_model=List[ReportSummary], summary="List All Reports")
async def list_reports(
    category: str | None = Query(None, description="Filter by medical category"),
    severity: str | None = Query(None, description="Filter by severity"),
) -> List[ReportSummary]:
    reports = _DEMO_REPORTS
    if category:
        reports = [r for r in reports if r.category.value == category]
    if severity:
        reports = [r for r in reports if r.severity.value == severity]
    return [ReportSummary(**r.model_dump()) for r in reports]


@router.get("/{report_id}", response_model=ReportDetail, summary="Get Report Detail")
async def get_report(report_id: str = Path(...)) -> ReportDetail:
    for report in _DEMO_REPORTS:
        if report.id == report_id:
            return report
    raise HTTPException(status_code=404, detail=f"Report '{report_id}' not found.")


@router.delete("/{report_id}", summary="Delete Report")
async def delete_report(report_id: str = Path(...)) -> dict:
    global _DEMO_REPORTS
    before = len(_DEMO_REPORTS)
    _DEMO_REPORTS = [r for r in _DEMO_REPORTS if r.id != report_id]
    if len(_DEMO_REPORTS) == before:
        raise HTTPException(status_code=404, detail=f"Report '{report_id}' not found.")
    return {"deleted": report_id, "message": "Report deleted successfully."}

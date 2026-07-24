"""
Reports Route
──────────────
CRUD operations for diagnostic reports using SQLite DB persistence.
"""
from __future__ import annotations

from typing import List
from fastapi import APIRouter, Depends, HTTPException, Path, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import ReportModel
from app.schemas.schemas import MedicalCategory, ReportDetail, ReportSummary, Severity

router = APIRouter()

# Demo reports fallback
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
    db: Session = Depends(get_db),
) -> List[ReportSummary]:
    query = db.query(ReportModel)
    if category:
        query = query.filter(ReportModel.category == category)
    if severity:
        query = query.filter(ReportModel.severity == severity)

    db_reports = query.order_by(ReportModel.created_at.desc()).all()

    if db_reports:
        return [
            ReportSummary(
                id=r.id,
                category=MedicalCategory(r.category),
                condition=r.condition,
                severity=Severity(r.severity),
                confidence=r.confidence,
                created_at=r.created_at.isoformat(),
                image_url=r.image_url,
            )
            for r in db_reports
        ]

    # Fallback to demo reports if database is empty
    reports = _DEMO_REPORTS
    if category:
        reports = [r for r in reports if r.category.value == category]
    if severity:
        reports = [r for r in reports if r.severity.value == severity]
    return [ReportSummary(**r.model_dump()) for r in reports]


@router.get("/{report_id}", response_model=ReportDetail, summary="Get Report Detail")
async def get_report(report_id: str = Path(...), db: Session = Depends(get_db)) -> ReportDetail:
    report_db = db.query(ReportModel).filter(ReportModel.id == report_id).first()
    if report_db:
        return ReportDetail(
            id=report_db.id,
            category=MedicalCategory(report_db.category),
            condition=report_db.condition,
            severity=Severity(report_db.severity),
            confidence=report_db.confidence,
            created_at=report_db.created_at.isoformat(),
            image_url=report_db.image_url,
            heatmap_url=report_db.heatmap_url,
            description=report_db.description or "",
            recommendations=report_db.recommendations or [],
        )

    for report in _DEMO_REPORTS:
        if report.id == report_id:
            return report
    raise HTTPException(status_code=404, detail=f"Report '{report_id}' not found.")


@router.delete("/{report_id}", summary="Delete Report")
async def delete_report(report_id: str = Path(...), db: Session = Depends(get_db)) -> dict:
    report_db = db.query(ReportModel).filter(ReportModel.id == report_id).first()
    if report_db:
        db.delete(report_db)
        db.commit()
        return {"deleted": report_id, "message": "Report deleted successfully from database."}

    global _DEMO_REPORTS
    before = len(_DEMO_REPORTS)
    _DEMO_REPORTS = [r for r in _DEMO_REPORTS if r.id != report_id]
    if len(_DEMO_REPORTS) == before:
        raise HTTPException(status_code=404, detail=f"Report '{report_id}' not found.")
    return {"deleted": report_id, "message": "Report deleted successfully."}

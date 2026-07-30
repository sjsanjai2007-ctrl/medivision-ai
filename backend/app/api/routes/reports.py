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

    raise HTTPException(status_code=404, detail=f"Report '{report_id}' not found.")


@router.delete("/{report_id}", summary="Delete Report")
async def delete_report(report_id: str = Path(...), db: Session = Depends(get_db)) -> dict:
    report_db = db.query(ReportModel).filter(ReportModel.id == report_id).first()
    if report_db:
        db.delete(report_db)
        db.commit()
        return {"deleted": report_id, "message": "Report deleted successfully from database."}

    raise HTTPException(status_code=404, detail=f"Report '{report_id}' not found.")


@router.get("/{report_id}/pdf", summary="Download PDF Report")
async def download_report_pdf(report_id: str = Path(...), db: Session = Depends(get_db)):
    """Generates and returns downloadable PDF report."""
    from fastapi.responses import Response
    from app.services.pdf import generate_report_pdf

    report = await get_report(report_id, db)
    pdf_bytes = generate_report_pdf(report)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=medivision_report_{report_id}.pdf"},
    )

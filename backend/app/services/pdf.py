"""
PDF Report Generation Service
──────────────────────────────
Generates clinical PDF reports with patient findings, confidence scores,
heatmap overlays, and disclaimer text using ReportLab.
"""
from __future__ import annotations

import io
from typing import Optional
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import HRFlowable, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from loguru import logger

from app.schemas.schemas import ReportDetail


def generate_report_pdf(report: ReportDetail) -> bytes:
    """Generates a PDF document for a clinical report."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "HeaderTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0f172a"),
    )
    subtitle_style = ParagraphStyle(
        "HeaderSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#64748b"),
    )
    section_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#0284c7"),
        spaceBefore=12,
        spaceAfter=6,
    )
    body_style = ParagraphStyle(
        "ReportBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#334155"),
    )
    disclaimer_style = ParagraphStyle(
        "Disclaimer",
        parent=styles["Italic"],
        fontName="Helvetica-Oblique",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#94a3b8"),
    )

    story = []

    # Header
    story.append(Paragraph("MediVision AI — Clinical Screening Report", title_style))
    story.append(Paragraph(f"Report ID: {report.id}  |  Generated: {report.created_at[:10]}", subtitle_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#0284c7"), spaceAfter=15))

    # Summary Table
    table_data = [
        [
            Paragraph("<b>Category:</b>", body_style),
            Paragraph(report.category.value.upper(), body_style),
            Paragraph("<b>Severity:</b>", body_style),
            Paragraph(report.severity.value.upper(), body_style),
        ],
        [
            Paragraph("<b>Condition:</b>", body_style),
            Paragraph(report.condition, body_style),
            Paragraph("<b>AI Confidence:</b>", body_style),
            Paragraph(f"{round(report.confidence * 100, 1)}%", body_style),
        ],
    ]

    t = Table(table_data, colWidths=[90, 180, 90, 180])
    t.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
            ("PADDING", (0, 0), (-1, -1), 6),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#e2e8f0")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ])
    )
    story.append(t)
    story.append(Spacer(1, 15))

    # Findings Description
    story.append(Paragraph("Clinical Analysis & Findings", section_style))
    story.append(Paragraph(report.description, body_style))
    story.append(Spacer(1, 15))

    # Recommendations
    story.append(Paragraph("Recommended Action Steps", section_style))
    for rec in report.recommendations:
        story.append(Paragraph(f"• {rec}", body_style))
    story.append(Spacer(1, 20))

    # Footer Disclaimer
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e2e8f0"), spaceAfter=10))
    story.append(Paragraph(f"Notice: {report.disclaimer}", disclaimer_style))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes

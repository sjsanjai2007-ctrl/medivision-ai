"""
Unified Prediction Interface
──────────────────────────────
All prediction requests go through this single entry point.
In production mode, runs the real AI pipeline, saves uploaded images
and Grad-CAM heatmaps to disk, and persists reports in SQLite.
"""
from __future__ import annotations

import io
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional

import cv2
import numpy as np
import torch
from PIL import Image
from loguru import logger

from app.ai.gradcam import GradCAMEngine
from app.ai.model_loader import ModelLoader
from app.ai.preprocessing import ImagePreprocessor
from app.core.config import settings
from app.db.database import SessionLocal
from app.db.models import ReportModel
from app.schemas.schemas import BoundingBox, MedicalCategory, PredictionResult, Severity

UPLOADS_DIR = Path(__file__).resolve().parent.parent.parent / "static" / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# ── Clinical Responses & Recommendations ────────────────────
_DEMO_RESPONSES: dict[str, dict] = {
    "skin": {
        "condition": "Moderate Psoriasis",
        "confidence": 0.94,
        "severity": Severity.MODERATE,
        "description": "Plaque psoriasis identified with characteristic scaly patches on the affected area. The pattern suggests a chronic inflammatory condition requiring dermatological evaluation.",
        "recommendations": [
            "Consult a dermatologist within 2–3 days",
            "Avoid scratching or picking at affected areas",
            "Apply fragrance-free moisturiser 2–3 times daily",
            "Avoid known triggers: stress, alcohol, certain medications",
            "Consider phototherapy evaluation",
        ],
    },
    "eye": {
        "condition": "Mild Conjunctivitis",
        "confidence": 0.89,
        "severity": Severity.MILD,
        "description": "Viral conjunctivitis detected with mild redness and discharge. Highly contagious — immediate hygiene measures recommended.",
        "recommendations": [
            "Wash hands frequently",
            "Avoid touching or rubbing eyes",
            "Apply cool compresses for comfort",
            "Consult an ophthalmologist if symptoms worsen",
            "Avoid sharing towels or pillowcases",
        ],
    },
    "chest": {
        "condition": "Normal Chest X-Ray",
        "confidence": 0.97,
        "severity": Severity.MILD,
        "description": "No significant pathological findings detected. Lung fields appear clear with normal cardiac silhouette.",
        "recommendations": [
            "No immediate medical action required",
            "Maintain annual routine health checkups",
            "Report any new shortness of breath or cough to a physician",
        ],
    },
    "dental": {
        "condition": "Dental Caries",
        "confidence": 0.91,
        "severity": Severity.MODERATE,
        "description": "Localized enamel demineralization observed consistent with early-stage cavity formation.",
        "recommendations": [
            "Schedule a dental checkup for cleaning and filling",
            "Brush twice daily with fluoride toothpaste",
            "Reduce sugary snack and beverage consumption",
        ],
    },
    "oral": {
        "condition": "Aphthous Ulcer",
        "confidence": 0.86,
        "severity": Severity.MILD,
        "description": "Benign mucosal lesion detected. Commonly self-limiting within 7–14 days.",
        "recommendations": [
            "Rinse with warm salt water 3 times daily",
            "Avoid acidic, spicy, or rough foods",
            "Consult a dentist if ulcer persists beyond 2 weeks",
        ],
    },
    "burns": {
        "condition": "Partial-Thickness Burn",
        "confidence": 0.93,
        "severity": Severity.SEVERE,
        "description": "Epidermal and partial dermal damage with blistering. Immediate cooling and sterile dressing required.",
        "recommendations": [
            "Cool with clean room-temperature water (do not use ice)",
            "Cover with sterile non-stick bandage",
            "Seek medical evaluation at a burn clinic or urgent care",
        ],
    },
    "wounds": {
        "condition": "Clean Incised Wound",
        "confidence": 0.88,
        "severity": Severity.MILD,
        "description": "Linear wound with clean margins and minimal surrounding erythema.",
        "recommendations": [
            "Clean gently with mild soap and water",
            "Apply antiseptic ointment and sterile bandage",
            "Monitor for signs of infection (increased redness, warmth, discharge)",
        ],
    },
}


class PredictionService:
    """Unified entry point for AI predictions."""

    async def predict(
        self,
        image_bytes: bytes,
        category: str,
        demo_mode: bool = False,
    ) -> PredictionResult:
        report_id = f"rpt-{uuid.uuid4().hex[:8]}"

        if demo_mode:
            return self._demo_response(category, report_id)

        return await self._real_prediction(image_bytes, category, report_id)

    # ── Demo Mode ───────────────────────────────────────────
    def _demo_response(self, category: str, report_id: str) -> PredictionResult:
        data = _DEMO_RESPONSES.get(category, _DEMO_RESPONSES["skin"])
        logger.info(f"[DEMO] Returning prediction for '{category}'")
        return PredictionResult(
            category=MedicalCategory(category),
            condition=data["condition"],
            confidence=data["confidence"],
            severity=data["severity"],
            description=data["description"],
            recommendations=data["recommendations"],
            bounding_boxes=[
                BoundingBox(x=0.25, y=0.30, width=0.40, height=0.35,
                            label=data["condition"], confidence=data["confidence"])
            ],
            heatmap_url=None,
            report_id=report_id,
        )

    # ── Real AI Pipeline ────────────────────────────────────
    async def _real_prediction(
        self,
        image_bytes: bytes,
        category: str,
        report_id: str,
    ) -> PredictionResult:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        # Save uploaded scan image to disk
        scan_filename = f"{report_id}_scan.jpg"
        scan_filepath = UPLOADS_DIR / scan_filename
        image.save(scan_filepath, format="JPEG", quality=90)
        image_url = f"http://localhost:8000/static/uploads/{scan_filename}"

        # Preprocess for PyTorch model
        preprocessor = ImagePreprocessor(category)
        tensor = torch.from_numpy(preprocessor.preprocess(image)).unsqueeze(0)

        # Load real PyTorch model
        model = ModelLoader.load(category)
        device = next(model.parameters()).device
        tensor = tensor.to(device)

        # PyTorch forward inference
        with torch.no_grad() if category != "chest" else torch.enable_grad():
            output = model(tensor)

        probs = torch.softmax(output, dim=1)[0]
        class_idx = int(probs.argmax().item())
        confidence = float(probs[class_idx].item())

        # Map predicted class to condition name & severity
        condition, severity = self._map_class(category, class_idx)
        data = _DEMO_RESPONSES.get(category, _DEMO_RESPONSES["skin"])

        # Generate real Grad-CAM heatmap
        heatmap_url: Optional[str] = None
        try:
            target_layer = GradCAMEngine.get_target_layer(model, category)
            if target_layer:
                cam_engine = GradCAMEngine(model, target_layer)
                heatmap_bgr = cam_engine.generate(
                    tensor.requires_grad_(True),
                    class_idx,
                    original_size=image.size[::-1]
                )
                heatmap_filename = f"{report_id}_heatmap.jpg"
                heatmap_filepath = UPLOADS_DIR / heatmap_filename
                cv2.imwrite(str(heatmap_filepath), heatmap_bgr)
                heatmap_url = f"http://localhost:8000/static/uploads/{heatmap_filename}"
        except Exception as e:
            logger.warning(f"Grad-CAM generation for {category}: {e}")

        # Persist report directly into SQLite database
        try:
            db = SessionLocal()
            db_report = ReportModel(
                id=report_id,
                category=category,
                condition=condition,
                confidence=confidence,
                severity=severity.value if hasattr(severity, "value") else str(severity),
                image_url=image_url,
                heatmap_url=heatmap_url,
                description=data["description"],
                recommendations=data["recommendations"],
                created_at=datetime.utcnow(),
            )
            db.add(db_report)
            db.commit()
            db.close()
            logger.info(f"✓ Saved report '{report_id}' to SQLite database.")
        except Exception as db_err:
            logger.error(f"Failed to persist report to SQLite: {db_err}")

        return PredictionResult(
            category=MedicalCategory(category),
            condition=condition,
            confidence=confidence,
            severity=severity,
            description=data["description"],
            recommendations=data["recommendations"],
            bounding_boxes=[
                BoundingBox(x=0.25, y=0.30, width=0.40, height=0.35,
                            label=condition, confidence=confidence)
            ],
            heatmap_url=heatmap_url,
            report_id=report_id,
        )

    @staticmethod
    def _map_class(category: str, class_idx: int) -> tuple[str, Severity]:
        """Map predicted class index to human-readable label and severity."""
        mappings: dict[str, list[tuple[str, Severity]]] = {
            "skin": [
                ("Psoriasis", Severity.MODERATE),
                ("Eczema", Severity.MILD),
                ("Melanoma", Severity.CRITICAL),
                ("Acne", Severity.MILD),
                ("Rosacea", Severity.MODERATE),
            ],
            "eye": [
                ("Conjunctivitis", Severity.MILD),
                ("Cataract", Severity.MODERATE),
                ("Glaucoma", Severity.SEVERE),
                ("Diabetic Retinopathy", Severity.SEVERE),
            ],
            "chest": [
                ("Normal", Severity.MILD),
                ("Pneumonia", Severity.SEVERE),
                ("Tuberculosis", Severity.CRITICAL),
                ("Pleural Effusion", Severity.SEVERE),
                ("Cardiomegaly", Severity.MODERATE),
            ],
            "oral": [
                ("Aphthous Ulcer", Severity.MILD),
                ("Leukoplakia", Severity.MODERATE),
                ("Oral Candidiasis", Severity.MODERATE),
                ("OSMF", Severity.SEVERE),
            ],
            "burns": [
                ("Superficial Burn", Severity.MILD),
                ("Partial-Thickness Burn", Severity.SEVERE),
                ("Full-Thickness Burn", Severity.CRITICAL),
                ("Normal Skin", Severity.MILD),
            ],
            "wounds": [
                ("Infected Laceration", Severity.SEVERE),
                ("Clean Wound", Severity.MILD),
                ("Chronic Wound", Severity.MODERATE),
            ],
        }
        classes = mappings.get(category, [("Unknown Condition", Severity.MODERATE)])
        if class_idx < len(classes):
            return classes[class_idx]
        return ("Unknown Condition", Severity.MODERATE)


# Singleton instance
prediction_service = PredictionService()

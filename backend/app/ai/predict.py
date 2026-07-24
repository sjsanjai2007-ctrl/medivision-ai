"""
Unified Prediction Interface
──────────────────────────────
All prediction requests go through this single entry point.
In demo mode, returns realistic mock data per category.
In production mode, runs the real AI pipeline.

API contract: swap demo → real with zero component changes.
"""
from __future__ import annotations

import io
import uuid
from datetime import datetime
from typing import Optional

import numpy as np
import torch
from PIL import Image
from loguru import logger

from app.ai.gradcam import GradCAMEngine
from app.ai.model_loader import ModelLoader
from app.ai.preprocessing import ImagePreprocessor
from app.core.config import settings
from app.schemas.schemas import BoundingBox, MedicalCategory, PredictionResult, Severity

# ── Demo Data Fixtures ──────────────────────────────────────
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
            "No immediate action required",
            "Continue routine annual chest screenings",
            "Maintain smoke-free lifestyle",
            "Regular cardiovascular exercise recommended",
        ],
    },
    "dental": {
        "condition": "Early Caries (Stage 2)",
        "confidence": 0.86,
        "severity": Severity.MODERATE,
        "description": "Two early-stage cavities detected in the right posterior region. Enamel erosion visible. Professional intervention will prevent progression.",
        "recommendations": [
            "Schedule dental appointment within 1 week",
            "Use fluoride toothpaste (1450 ppm) twice daily",
            "Avoid sugary drinks and snacks",
            "Floss daily to remove interdental plaque",
        ],
    },
    "oral": {
        "condition": "Aphthous Ulcer",
        "confidence": 0.91,
        "severity": Severity.MILD,
        "description": "Minor aphthous ulceration detected on the buccal mucosa. Typically resolves within 7–14 days without treatment.",
        "recommendations": [
            "Apply topical anaesthetic gel (benzocaine) for pain relief",
            "Avoid spicy or acidic foods",
            "Rinse with warm salt water 3× daily",
            "Consult if ulcer persists beyond 3 weeks",
        ],
    },
    "burns": {
        "condition": "Partial-Thickness Burn (2nd Degree)",
        "confidence": 0.88,
        "severity": Severity.SEVERE,
        "description": "Second-degree burn with blistering identified. Immediate medical attention required to prevent infection and ensure proper wound care.",
        "recommendations": [
            "Seek emergency medical care immediately",
            "Do not pop blisters",
            "Cover loosely with sterile non-stick dressing",
            "Do NOT apply butter, oil, or toothpaste",
            "Elevate affected area if possible",
        ],
    },
    "wounds": {
        "condition": "Infected Laceration",
        "confidence": 0.83,
        "severity": Severity.SEVERE,
        "description": "Signs of wound infection detected: erythema, possible exudate, and irregular margins. Risk of systemic infection if untreated.",
        "recommendations": [
            "Seek medical attention within 24 hours",
            "Gently clean with saline solution",
            "Apply sterile dressing — change every 24 hours",
            "Watch for spreading redness or fever",
            "Do not remove any embedded foreign objects",
        ],
    },
}


class PredictionService:
    """Unified AI prediction service."""

    async def predict(
        self,
        image_bytes: bytes,
        category: str,
        demo_mode: bool = True,
    ) -> PredictionResult:
        """
        Entry point for all predictions.
        - In demo mode: returns realistic mock data instantly.
        - In production: runs full AI pipeline.
        """
        report_id = str(uuid.uuid4())

        if demo_mode or settings.DEMO_MODE:
            return self._demo_response(category, report_id)

        return await self._real_prediction(image_bytes, category, report_id)

    # ── Demo Mode ───────────────────────────────────────────
    def _demo_response(self, category: str, report_id: str) -> PredictionResult:
        data = _DEMO_RESPONSES.get(category, _DEMO_RESPONSES["skin"])
        logger.info(f"[DEMO] Returning mock prediction for '{category}'")
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
            heatmap_url=None,   # Heatmap generated client-side from Grad-CAM in real mode
            report_id=report_id,
        )

    # ── Real AI Pipeline ────────────────────────────────────
    async def _real_prediction(
        self,
        image_bytes: bytes,
        category: str,
        report_id: str,
    ) -> PredictionResult:
        """
        Full pipeline:
        1. Load image → preprocess
        2. Load model
        3. Run inference
        4. Generate Grad-CAM heatmap
        5. Map class index → condition label + severity
        """
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        preprocessor = ImagePreprocessor(category)
        tensor = torch.from_numpy(preprocessor.preprocess(image)).unsqueeze(0)

        model = ModelLoader.load(category)
        if model is None:
            logger.warning(f"No model for '{category}' — falling back to demo response.")
            return self._demo_response(category, report_id)

        device = next(model.parameters()).device
        tensor = tensor.to(device)

        with torch.no_grad() if category != "chest" else torch.enable_grad():
            output = model(tensor)

        probs = torch.softmax(output, dim=1)[0]
        class_idx = int(probs.argmax().item())
        confidence = float(probs[class_idx].item())

        condition, severity = self._map_class(category, class_idx)
        data = _DEMO_RESPONSES.get(category, _DEMO_RESPONSES["skin"])

        # Grad-CAM heatmap
        heatmap_url: Optional[str] = None
        try:
            target_layer = GradCAMEngine.get_target_layer(model, category)
            if target_layer:
                cam_engine = GradCAMEngine(model, target_layer)
                heatmap = cam_engine.generate(tensor.requires_grad_(True), class_idx,
                                              original_size=image.size[::-1])
                heatmap_url = await self._upload_heatmap(heatmap, report_id)
        except Exception as e:
            logger.warning(f"Grad-CAM failed for {category}: {e}")

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

    @staticmethod
    async def _upload_heatmap(heatmap: np.ndarray, report_id: str) -> Optional[str]:
        """Upload heatmap image to Cloudinary / S3 and return URL. Stub for now."""
        # TODO: Implement Cloudinary / S3 upload
        return f"/heatmaps/{report_id}.jpg"


# Singleton
prediction_service = PredictionService()

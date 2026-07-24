"""
Hospital Recommendation Service
─────────────────────────────────
Matches the predicted medical condition to the best nearby hospital
with the relevant specialist.

In production: queries PostGIS / Google Places API for real nearby hospitals.
"""
from __future__ import annotations

from typing import Optional

from app.schemas.schemas import HospitalSchema

# Condition → recommended specialist mapping
CONDITION_SPECIALIST_MAP: dict[str, str] = {
    # Skin
    "Psoriasis": "Dermatology",
    "Eczema": "Dermatology",
    "Melanoma": "Dermatology",
    "Acne": "Dermatology",
    "Rosacea": "Dermatology",
    # Eye
    "Conjunctivitis": "Ophthalmology",
    "Cataract": "Ophthalmology",
    "Glaucoma": "Ophthalmology",
    "Diabetic Retinopathy": "Ophthalmology",
    # Chest
    "Pneumonia": "Pulmonology",
    "Tuberculosis": "Pulmonology",
    "Pleural Effusion": "Cardiology",
    "Cardiomegaly": "Cardiology",
    # Dental
    "Early Caries": "Dental",
    # Oral
    "Aphthous Ulcer": "ENT",
    "Leukoplakia": "Oncology",
    # Burns / Wounds
    "Partial-Thickness Burn": "Plastic Surgery",
    "Full-Thickness Burn": "Plastic Surgery",
    "Infected Laceration": "Emergency",
}


class HospitalRecommendationService:

    def get_specialist(self, condition: str) -> str:
        for key, specialist in CONDITION_SPECIALIST_MAP.items():
            if key.lower() in condition.lower():
                return specialist
        return "General Medicine"

    async def recommend(
        self,
        condition: str,
        lat: Optional[float] = None,
        lng: Optional[float] = None,
    ) -> Optional[HospitalSchema]:
        """
        Returns the best-matched hospital for the given condition.
        In production: runs a PostGIS radius query filtered by specialist availability.
        """
        from app.api.routes.hospitals import _DEMO_HOSPITALS
        specialist = self.get_specialist(condition)
        matched = [
            h for h in _DEMO_HOSPITALS
            if h.is_open and any(specialist.lower() in s.lower() for s in h.specialties)
        ]
        if not matched:
            matched = [h for h in _DEMO_HOSPITALS if h.is_open]
        return sorted(matched, key=lambda h: (-h.rating, h.distance_km))[0] if matched else None


recommendation_service = HospitalRecommendationService()

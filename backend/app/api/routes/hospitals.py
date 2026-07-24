"""
Hospitals Route
────────────────
Returns nearby hospital data.
In production: integrates with Google Places API + PostGIS radius query.
In demo: returns curated mock dataset.
"""
from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Query

from app.schemas.schemas import HospitalSchema

router = APIRouter()

# ── Demo hospital dataset ───────────────────────────────────
_DEMO_HOSPITALS: List[HospitalSchema] = [
    HospitalSchema(
        id="h-001",
        name="Apollo Hospitals",
        address="21, Greams Lane, Thousand Lights, Chennai 600006",
        rating=4.8,
        reviews=2847,
        distance_km=1.8,
        travel_time_min=7,
        is_open=True,
        specialties=["Dermatology", "Ophthalmology", "Cardiology", "Oncology", "Radiology"],
        phone="+91-44-28290200",
        image_url="/demo/apollo_hospital.jpg",
        lat=13.0569,
        lng=80.2519,
    ),
    HospitalSchema(
        id="h-002",
        name="MIOT International",
        address="4/112, Mount Poonamallee Road, Manapakkam, Chennai 600089",
        rating=4.6,
        reviews=1923,
        distance_km=3.2,
        travel_time_min=12,
        is_open=True,
        specialties=["Orthopaedics", "Neurology", "Dermatology", "Plastic Surgery"],
        phone="+91-44-22492288",
        image_url="/demo/miot_hospital.jpg",
        lat=13.0114,
        lng=80.1647,
    ),
    HospitalSchema(
        id="h-003",
        name="Fortis Malar Hospital",
        address="52, First Main Road, Gandhi Nagar, Adyar, Chennai 600020",
        rating=4.5,
        reviews=1456,
        distance_km=4.7,
        travel_time_min=18,
        is_open=False,
        specialties=["Cardiology", "Nephrology", "Dermatology", "Emergency"],
        phone="+91-44-42893333",
        image_url="/demo/fortis_hospital.jpg",
        lat=13.0062,
        lng=80.2565,
    ),
    HospitalSchema(
        id="h-004",
        name="Sri Ramachandra Medical Centre",
        address="1, Ramachandra Nagar, Porur, Chennai 600116",
        rating=4.7,
        reviews=3102,
        distance_km=6.1,
        travel_time_min=22,
        is_open=True,
        specialties=["Multi-Specialty", "Skin & Dermatology", "Eye Care", "Dental"],
        phone="+91-44-45928600",
        image_url="/demo/sriram_hospital.jpg",
        lat=13.0339,
        lng=80.1559,
    ),
]


@router.get("/", response_model=List[HospitalSchema], summary="List Nearby Hospitals")
async def list_hospitals(
    specialty: Optional[str] = Query(None, description="Filter by specialty"),
    open_only: bool = Query(False, description="Show only hospitals open now"),
    max_distance_km: float = Query(50.0, ge=1, le=100),
) -> List[HospitalSchema]:
    hospitals = [h for h in _DEMO_HOSPITALS if h.distance_km <= max_distance_km]
    if open_only:
        hospitals = [h for h in hospitals if h.is_open]
    if specialty:
        hospitals = [h for h in hospitals if any(specialty.lower() in s.lower() for s in h.specialties)]
    return sorted(hospitals, key=lambda h: h.distance_km)


@router.get("/recommend", response_model=HospitalSchema, summary="Best Match Hospital")
async def recommend_hospital(
    condition: Optional[str] = Query(None),
    specialty: Optional[str] = Query(None),
) -> HospitalSchema:
    """Returns the best-matched open hospital for a given condition."""
    open_hospitals = [h for h in _DEMO_HOSPITALS if h.is_open]
    if specialty:
        matched = [h for h in open_hospitals if any(specialty.lower() in s.lower() for s in h.specialties)]
        if matched:
            return sorted(matched, key=lambda h: (-h.rating, h.distance_km))[0]
    return sorted(open_hospitals, key=lambda h: (-h.rating, h.distance_km))[0]


@router.get("/{hospital_id}", response_model=HospitalSchema, summary="Get Hospital Detail")
async def get_hospital(hospital_id: str) -> HospitalSchema:
    from fastapi import HTTPException
    for h in _DEMO_HOSPITALS:
        if h.id == hospital_id:
            return h
    raise HTTPException(status_code=404, detail=f"Hospital '{hospital_id}' not found.")

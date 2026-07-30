"""
Hospitals Route
────────────────
Returns geolocation-aware nearby hospital data using OpenStreetMap & Overpass API.
"""
from __future__ import annotations

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query

from app.schemas.schemas import HospitalSchema
from app.services.hospital import hospital_search_service

router = APIRouter()


@router.get("/", response_model=List[HospitalSchema], summary="List Nearby Hospitals")
async def list_hospitals(
    specialty: Optional[str] = Query(None, description="Filter by specialty"),
    open_only: bool = Query(False, description="Show only hospitals open now"),
    max_distance_km: float = Query(50.0, ge=1, le=100),
    lat: Optional[float] = Query(None, description="User latitude"),
    lng: Optional[float] = Query(None, description="User longitude"),
    city: Optional[str] = Query(None, description="City name (e.g. Chennai, Mumbai, Delhi)"),
) -> List[HospitalSchema]:
    return await hospital_search_service.search(
        lat=lat,
        lng=lng,
        city=city,
        specialty=specialty,
        open_only=open_only,
        max_distance_km=max_distance_km,
    )


@router.get("/recommend", response_model=HospitalSchema, summary="Best Match Hospital")
async def recommend_hospital(
    condition: Optional[str] = Query(None),
    specialty: Optional[str] = Query(None),
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
) -> HospitalSchema:
    """Returns the best-matched open hospital for a given condition using OpenStreetMap."""
    hospitals = await hospital_search_service.search(lat=lat, lng=lng, specialty=specialty, open_only=True)
    if not hospitals:
        # Retry without open_only filter
        hospitals = await hospital_search_service.search(lat=lat, lng=lng, specialty=specialty)

    if not hospitals:
        raise HTTPException(status_code=404, detail="No nearby hospitals found via OpenStreetMap.")

    return sorted(hospitals, key=lambda h: (-h.rating, h.distance_km))[0]


@router.get("/{hospital_id}", response_model=HospitalSchema, summary="Get Hospital Detail")
async def get_hospital(hospital_id: str, lat: Optional[float] = None, lng: Optional[float] = None) -> HospitalSchema:
    hospitals = await hospital_search_service.search(lat=lat, lng=lng)
    for h in hospitals:
        if h.id == hospital_id:
            return h
    raise HTTPException(status_code=404, detail=f"Hospital '{hospital_id}' not found.")

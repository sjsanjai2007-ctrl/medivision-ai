// ============================================================
// MediVision AI – Hospitals API Client (OpenStreetMap + Overpass)
// GET /api/v1/hospitals/ → Fetch nearby hospitals via OpenStreetMap
// GET /api/v1/hospitals/recommend → Fetch best match hospital
// ============================================================

import { apiRequest } from './client';
import type { Hospital } from '@/lib/types';

export interface ApiHospital {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviews: number;
  distance_km: number;
  travel_time_min: number;
  is_open: boolean;
  specialties: string[];
  phone: string;
  image_url: string;
  lat: number;
  lng: number;
}

export interface FetchHospitalsParams {
  lat?: number;
  lng?: number;
  city?: string;
  specialty?: string;
  open_only?: boolean;
  max_distance_km?: number;
}

export async function listHospitalsApi(params: FetchHospitalsParams = {}): Promise<Hospital[]> {
  const searchParams = new URLSearchParams();
  if (params.lat !== undefined) searchParams.set('lat', params.lat.toString());
  if (params.lng !== undefined) searchParams.set('lng', params.lng.toString());
  if (params.city) searchParams.set('city', params.city);
  if (params.specialty) searchParams.set('specialty', params.specialty);
  if (params.open_only) searchParams.set('open_only', 'true');
  if (params.max_distance_km) searchParams.set('max_distance_km', params.max_distance_km.toString());

  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
  const rawList = await apiRequest<ApiHospital[]>(`/hospitals/${queryString}`);

  return rawList.map((h) => ({
    id: h.id,
    name: h.name,
    imageUrl: h.image_url || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=80',
    rating: h.rating,
    reviewCount: h.reviews,
    distance: h.distance_km,
    travelTime: h.travel_time_min,
    isOpen: h.is_open,
    openHours: h.is_open ? 'Open 24 hours' : 'Closed',
    address: h.address,
    phone: h.phone,
    services: h.specialties,
    specialists: h.specialties,
    lat: h.lat,
    lng: h.lng,
  }));
}

export async function getBestMatchHospitalApi(condition?: string, specialty?: string): Promise<Hospital | null> {
  try {
    const params = new URLSearchParams();
    if (condition) params.set('condition', condition);
    if (specialty) params.set('specialty', specialty);

    const q = params.toString() ? `?${params.toString()}` : '';
    const h = await apiRequest<ApiHospital>(`/hospitals/recommend${q}`);
    return {
      id: h.id,
      name: h.name,
      imageUrl: h.image_url || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=80',
      rating: h.rating,
      reviewCount: h.reviews,
      distance: h.distance_km,
      travelTime: h.travel_time_min,
      isOpen: h.is_open,
      openHours: h.is_open ? 'Open 24 hours' : 'Closed',
      address: h.address,
      phone: h.phone,
      services: h.specialties,
      specialists: h.specialties,
      lat: h.lat,
      lng: h.lng,
    };
  } catch {
    return null;
  }
}

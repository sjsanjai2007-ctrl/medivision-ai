'use client';

// ============================================================
// MediVision AI – Hospitals Page (OpenStreetMap + Overpass API)
// Geolocation-aware live hospital search powered by OpenStreetMap
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin, Clock, Phone, Navigation, Search, RefreshCw,
  LocateFixed, ExternalLink, ShieldCheck, Stethoscope, AlertCircle,
} from 'lucide-react';
import type { Hospital } from '@/lib/types';
import { listHospitalsApi } from '@/lib/api/hospitals';
import { formatDistance, formatTravelTime, getStarArray } from '@/lib/utils';
import { cn } from '@/lib/utils';

function StarRating({ rating }: { rating: number }) {
  const stars = getStarArray(rating);
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} stars`}>
      {stars.map((type, i) => (
        <svg key={i} className={cn('w-3.5 h-3.5', type === 'empty' ? 'star-empty' : 'star-full')}
          viewBox="0 0 24 24" fill={type === 'full' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      ))}
    </span>
  );
}

function HospitalCard({ hospital }: { hospital: Hospital }) {
  const osmMapUrl = `https://www.openstreetmap.org/?mlat=${hospital.lat}&mlon=${hospital.lng}#map=16/${hospital.lat}/${hospital.lng}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}&destination_place_id=${encodeURIComponent(hospital.name)}`;

  return (
    <div
      className="rounded-2xl p-4.5 space-y-3 transition-all hover:scale-[1.01]"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-sm sm:text-base truncate" style={{ color: 'var(--text-primary)' }}>{hospital.name}</p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800 flex-shrink-0">
              OSM Verified
            </span>
          </div>
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>📍 {hospital.address}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <StarRating rating={hospital.rating} />
            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{hospital.rating}</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({hospital.reviewCount.toLocaleString()})</span>
          </div>
        </div>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{
            background: hospital.isOpen ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            color: hospital.isOpen ? '#059669' : '#dc2626',
          }}
        >
          {hospital.isOpen ? '● Open' : '○ Closed'}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-sky-500" />{formatDistance(hospital.distance)}</span>
        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-sky-500" />{formatTravelTime(hospital.travelTime)}</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {hospital.services.slice(0, 4).map((s) => (
          <span key={s} className="text-[11px] px-2.5 py-0.5 rounded-full font-medium"
            style={{ background: 'rgba(14,165,233,0.08)', color: 'var(--primary)' }}>
            {s}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <a
          href={directionsUrl}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105"
          style={{ background: 'var(--primary)', color: 'white' }}
        >
          <Navigation className="w-3.5 h-3.5" /> Directions
        </a>
        <a
          href={osmMapUrl}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105"
          style={{ background: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
        >
          <ExternalLink className="w-3.5 h-3.5" /> View on Map
        </a>
      </div>
    </div>
  );
}

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [locationStatus, setLocationStatus] = useState<string>('Detecting location...');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [cityInput, setCityInput] = useState('');
  const [filter, setFilter] = useState<'all' | 'open'>('all');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('');

  const [visibleCount, setVisibleCount] = useState<number>(6);

  const fetchHospitals = useCallback(async (lat?: number, lng?: number, city?: string) => {
    setIsLoading(true);
    try {
      const list = await listHospitalsApi({
        lat,
        lng,
        city,
        specialty: specialtyFilter || undefined,
        open_only: filter === 'open',
      });
      setHospitals(list);
      setVisibleCount(6);
    } catch {
      setHospitals([]);
    } finally {
      setIsLoading(false);
    }
  }, [filter, specialtyFilter]);

  // Reset pagination on filter or dataset change
  useEffect(() => {
    setVisibleCount(6);
  }, [filter, specialtyFilter, hospitals]);

  // Infinite scroll — load next 6 when user scrolls near page bottom
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 400) {
        setVisibleCount((prev) => (prev < hospitals.length ? prev + 6 : prev));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hospitals.length]);

  // Request browser geolocation on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserCoords({ lat: latitude, lng: longitude });
          setLocationStatus('📍 Using current GPS location');
          fetchHospitals(latitude, longitude);
        },
        () => {
          setLocationStatus('📍 Location permission denied — showing default area');
          fetchHospitals();
        },
        { timeout: 8000, maximumAge: 60000 }
      );
    } else {
      setLocationStatus('📍 Geolocation unavailable — showing default area');
      fetchHospitals();
    }
  }, [fetchHospitals]);

  const handleCitySearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityInput.trim()) return;
    setLocationStatus(`📍 Showing hospitals near ${cityInput.trim()}`);
    fetchHospitals(undefined, undefined, cityInput.trim());
  };

  const handleUseGPS = () => {
    if ('geolocation' in navigator) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserCoords({ lat: latitude, lng: longitude });
          setLocationStatus('📍 Using current GPS location');
          fetchHospitals(latitude, longitude);
        },
        () => {
          setLocationStatus('Unable to retrieve GPS coordinates.');
          setIsLoading(false);
        }
      );
    }
  };

  const displayed = filter === 'open' ? hospitals.filter((h) => h.isOpen) : hospitals;
  const paginated = displayed.slice(0, visibleCount);

  return (
    <>
      <div className="page-wrap space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              Nearby Hospitals
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Live OpenStreetMap
              </span>
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Real-time hospital search powered by OpenStreetMap & Overpass API
            </p>
          </div>

          <button
            onClick={handleUseGPS}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
            style={{ background: 'var(--primary)', color: 'white' }}
          >
            <LocateFixed className="w-3.5 h-3.5" /> Use My Location
          </button>
        </div>

        {/* Location Status & Search Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs px-1" style={{ color: 'var(--text-muted)' }}>
            <span className="font-semibold">{locationStatus}</span>
            <span>{displayed.length} facilities found</span>
          </div>

          <form onSubmit={handleCitySearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search city e.g. Chennai, Mumbai, Delhi, Bengaluru..."
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none border transition-all"
                style={{
                  background: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 whitespace-nowrap"
              style={{ background: 'var(--border-subtle)', color: 'var(--text-primary)' }}
            >
              Search City
            </button>
          </form>
        </div>

        {/* Embedded Interactive OpenStreetMap View */}
        {userCoords && (
          <div className="rounded-2xl overflow-hidden border shadow-sm h-48 relative" style={{ borderColor: 'var(--border-subtle)' }}>
            <iframe
              title="OpenStreetMap Location View"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${userCoords.lng - 0.05}%2C${userCoords.lat - 0.05}%2C${userCoords.lng + 0.05}%2C${userCoords.lat + 0.05}&layer=mapnik&marker=${userCoords.lat}%2C${userCoords.lng}`}
            />
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          {(['all', 'open'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: filter === f ? 'var(--primary)' : 'var(--border-subtle)',
                color: filter === f ? 'white' : 'var(--text-secondary)',
              }}
            >
              {f === 'all' ? 'All Hospitals' : '● Open Now'}
            </button>
          ))}

          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold outline-none border transition-all"
            style={{
              background: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="">All Specialties</option>
            <option value="Dermatology">Skin & Dermatology</option>
            <option value="Ophthalmology">Eye & Ophthalmology</option>
            <option value="Emergency">Emergency Care</option>
            <option value="General Medicine">General Medicine</option>
            <option value="Pediatrics">Pediatrics</option>
          </select>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-36 rounded-2xl animate-pulse" style={{ background: 'var(--bg-surface)' }} />
            ))}
          </div>
        )}

        {/* Hospitals Grid (Batch Rate-Limited 6 items at a time) */}
        {!isLoading && displayed.length > 0 && (
          <div className="space-y-4 pb-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {paginated.map((hospital, idx) => (
                <motion.div key={hospital.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (idx % 6) * 0.05 }}>
                  <HospitalCard hospital={hospital} />
                </motion.div>
              ))}
            </div>

            {/* Pagination / Batch Rate-Limiting Controls */}
            {visibleCount < displayed.length && (
              <div className="flex flex-col items-center justify-center gap-2 pt-4">
                <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Showing {paginated.length} of {displayed.length} facilities (Loaded in batches of 6)
                </p>
                <button
                  onClick={() => setVisibleCount((prev) => Math.min(prev + 6, displayed.length))}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
                  style={{ background: 'var(--border-subtle)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}
                >
                  Load Next 6 Hospitals ↓
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && displayed.length === 0 && (
          <div className="text-center py-12 rounded-3xl space-y-3" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <MapPin className="w-10 h-10 mx-auto" style={{ color: 'var(--text-muted)' }} />
            <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>No hospital facilities found in this radius</p>
            <p className="text-xs max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
              Try searching for a different city or clearing specialty filters to expand the OpenStreetMap search area.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

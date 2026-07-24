'use client';

// ============================================================
// MediVision AI – Hospitals Page with Premium Best Match Card
// ============================================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { MapPin, Clock, Phone, Navigation, Stethoscope } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import SeverityBadge from '@/components/shared/SeverityBadge';
import { DEMO_HOSPITAL_RECOMMENDATION } from '@/lib/constants/demo-data';
import type { Hospital } from '@/lib/types';
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

function HospitalCard({ hospital, highlight = false }: { hospital: Hospital; highlight?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: '0 12px 40px rgba(14,165,233,0.15)' }}
      className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: 'var(--bg-surface)',
        border: highlight ? '2px solid rgba(14,165,233,0.5)' : '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Hospital image */}
      <div className="relative h-44">
        <Image src={hospital.imageUrl} alt={hospital.name} fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        {/* Open/closed badge */}
        <div className="absolute top-3 right-3">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{
              background: hospital.isOpen ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)',
              color: 'white',
            }}>
            {hospital.isOpen ? '● Open Now' : '○ Closed'}
          </span>
        </div>
        {/* Hospital name overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-white font-bold text-base leading-tight">{hospital.name}</p>
          <p className="text-white/70 text-xs mt-0.5 line-clamp-1">{hospital.address}</p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Rating + Stats row */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <StarRating rating={hospital.rating} />
            <span className="text-sm font-bold text-amber-600">{hospital.rating}</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({hospital.reviewCount.toLocaleString()})</span>
          </div>
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{formatDistance(hospital.distance)}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTravelTime(hospital.travelTime)}</span>
          </div>
        </div>

        {/* Services */}
        <div className="flex flex-wrap gap-1.5">
          {hospital.services.slice(0, 4).map((s) => (
            <span key={s} className="text-[11px] font-medium px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(14,165,233,0.08)', color: 'var(--primary)' }}>
              ✔ {s}
            </span>
          ))}
          {hospital.services.length > 4 && (
            <span className="text-[11px] px-2 py-1 rounded-full" style={{ background: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
              +{hospital.services.length - 4} more
            </span>
          )}
        </div>

        {/* Map placeholder */}
        <div className="h-24 rounded-xl overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg,#e0f2fe,#b0e0f9)', border: '1px solid var(--border-subtle)' }}>
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-1 px-2 text-center">
            <MapPin className="w-6 h-6 text-sky-600" />
            <p className="text-xs font-medium text-sky-600 truncate max-w-full">{hospital.name}</p>
          </div>
          {/* Decorative grid */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'linear-gradient(#0ea5e9 1px,transparent 1px),linear-gradient(90deg,#0ea5e9 1px,transparent 1px)',
            backgroundSize: '24px 24px',
          }} />
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(hospital.name + ' ' + hospital.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary py-2.5 text-sm min-h-[44px]"
          >
            <Navigation className="w-4 h-4" /> Directions
          </a>
          <a href={`tel:${hospital.phone}`} className="btn-secondary py-2.5 text-sm min-h-[44px]">
            <Phone className="w-4 h-4" /> Call
          </a>
        </div>
      </div>
    </motion.div>
  );
}

export default function HospitalsPage() {
  const { condition, severity, recommendedSpecialist, bestMatch, nearbyHospitals } = DEMO_HOSPITAL_RECOMMENDATION;
  const [filter, setFilter] = useState<'all' | 'open'>('all');
  const allHospitals = [bestMatch, ...nearbyHospitals];
  const displayed = filter === 'open' ? allHospitals.filter((h) => h.isOpen) : allHospitals;

  return (
    <AppShell>
      <div className="px-4 py-5 max-w-2xl mx-auto lg:max-w-4xl lg:py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Nearby Hospitals</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Based on your screening results</p>
        </div>

        {/* ── BEST MATCH CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg,#0284c7 0%,#0ea5e9 50%,#06b6d4 100%)',
            boxShadow: '0 8px 32px rgba(14,165,233,0.4)',
          }}
        >
          {/* Decorative */}
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
            style={{ background: 'white', transform: 'translate(30%,-30%)' }} />

          <div className="relative z-10 p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Stethoscope className="w-4 h-4 text-white" />
                </div>
                <p className="text-white font-bold text-sm truncate">🩺 Best Match for Your Condition</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/20 text-white whitespace-nowrap flex-shrink-0">⭐ Top Pick</span>
            </div>

            {/* Condition info */}
            <div className="flex flex-wrap items-center justify-between gap-3 sm:flex-nowrap">
              <div className="min-w-0">
                <p className="text-sky-100 text-xs">Condition</p>
                <p className="text-white font-bold text-sm sm:text-base truncate">{condition}</p>
              </div>
              <div className="hidden sm:block h-8 w-px bg-white/20 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sky-100 text-xs">Specialist</p>
                <p className="text-white font-bold text-sm sm:text-base truncate">{recommendedSpecialist}</p>
              </div>
              <SeverityBadge severity={severity} size="sm" />
            </div>

            {/* Best hospital */}
            <div className="rounded-2xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.25)' }}>
              <div className="flex items-start gap-3">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                  <Image src={bestMatch.imageUrl} alt={bestMatch.name} fill className="object-cover" sizes="64px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-extrabold text-base">{bestMatch.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <StarRating rating={bestMatch.rating} />
                    <span className="text-white font-bold text-sm">{bestMatch.rating}</span>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-400/30 text-emerald-100 flex-shrink-0">
                  ● Open
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: '📍', label: 'Distance', value: formatDistance(bestMatch.distance) },
                  { icon: '🕒', label: 'Travel Time', value: formatTravelTime(bestMatch.travelTime) },
                  { icon: '⭐', label: 'Rating', value: `${bestMatch.rating}/5` },
                ].map((stat) => (
                  <div key={stat.label} className="text-center rounded-xl py-2 px-1" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <p className="text-base sm:text-lg">{stat.icon}</p>
                    <p className="text-white font-bold text-xs sm:text-sm truncate">{stat.value}</p>
                    <p className="text-sky-100 text-[9px] sm:text-[10px] truncate">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Services */}
              <div className="flex flex-wrap gap-1.5">
                {bestMatch.services.slice(0, 4).map((s) => (
                  <span key={s} className="text-[11px] px-2.5 py-0.5 rounded-full font-medium"
                    style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                    ✔ {s}
                  </span>
                ))}
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <a href={`https://maps.google.com/?q=${encodeURIComponent(bestMatch.name)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-sm text-white transition-all hover:scale-105 min-h-[44px]"
                  style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <Navigation className="w-4 h-4" /> Get Directions
                </a>
                <a href={`tel:${bestMatch.phone}`}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-sm text-white transition-all hover:scale-105 min-h-[44px]"
                  style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <Phone className="w-4 h-4" /> Call Hospital
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filter bar */}
        <div className="flex gap-2">
          {(['all', 'open'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: filter === f ? 'var(--primary)' : 'var(--border-subtle)',
                color: filter === f ? 'white' : 'var(--text-secondary)',
                boxShadow: filter === f ? '0 2px 12px rgba(14,165,233,0.4)' : 'none',
              }}>
              {f === 'all' ? 'All Hospitals' : '● Open Now'}
            </button>
          ))}
          <span className="ml-auto text-sm self-center" style={{ color: 'var(--text-muted)' }}>
            {displayed.length} found
          </span>
        </div>

        {/* All hospitals */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {displayed.map((hospital, idx) => (
            <motion.div key={hospital.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}>
              <HospitalCard hospital={hospital} highlight={hospital.id === bestMatch.id} />
            </motion.div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

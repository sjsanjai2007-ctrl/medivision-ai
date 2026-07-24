'use client';

// ============================================================
// MediVision AI – Nearby Hospitals Preview (Home Page)
// Shows top 2 hospitals as mini cards
// ============================================================

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Star, ChevronRight, Clock } from 'lucide-react';
import { DEMO_HOSPITALS } from '@/lib/constants/demo-data';
import { formatDistance, formatTravelTime } from '@/lib/utils';

export default function NearbyHospitalsPreview() {
  const hospitals = DEMO_HOSPITALS.slice(0, 2);

  return (
    <section aria-labelledby="nearby-hospitals-title">
      <div className="flex items-center justify-between mb-3">
        <h2 id="nearby-hospitals-title" className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
          Nearby Hospitals
        </h2>
        <Link href="/hospitals" className="text-sm font-semibold flex items-center gap-0.5" style={{ color: 'var(--primary)' }}>
          View all <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {hospitals.map((h, idx) => (
          <motion.div
            key={h.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Link href="/hospitals">
              <div
                className="p-4 rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.99]"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{h.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-semibold text-amber-600">{h.rating}</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({h.reviewCount.toLocaleString()})</span>
                    </div>
                  </div>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      background: h.isOpen ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      color: h.isOpen ? '#059669' : '#dc2626',
                    }}
                  >
                    {h.isOpen ? '● Open' : '○ Closed'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{formatDistance(h.distance)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />{formatTravelTime(h.travelTime)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mt-2">
                  {h.services.slice(0, 2).map((s) => (
                    <span key={s} className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{ background: 'rgba(14,165,233,0.08)', color: 'var(--primary)' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

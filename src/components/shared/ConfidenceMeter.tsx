'use client';

// ============================================================
// MediVision AI – Confidence Meter (Visual Gauge)
// Animated segmented bar — never shows plain text confidence
// ============================================================

import React, { useEffect, useRef, useState } from 'react';
import type { ConfidenceTier } from '@/lib/types';
import { getConfidenceTier, getConfidenceLabel } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ConfidenceMeterProps {
  confidence: number; // 0–1
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const TIER_COLORS: Record<ConfidenceTier, { bar: string; text: string; glow: string }> = {
  very_high: {
    bar: 'linear-gradient(90deg, #10b981, #059669)',
    text: 'text-emerald-600',
    glow: 'rgba(16,185,129,0.3)',
  },
  high: {
    bar: 'linear-gradient(90deg, #0ea5e9, #0284c7)',
    text: 'text-sky-600',
    glow: 'rgba(14,165,233,0.3)',
  },
  moderate: {
    bar: 'linear-gradient(90deg, #f59e0b, #d97706)',
    text: 'text-amber-600',
    glow: 'rgba(245,158,11,0.3)',
  },
  low: {
    bar: 'linear-gradient(90deg, #ef4444, #dc2626)',
    text: 'text-red-600',
    glow: 'rgba(239,68,68,0.3)',
  },
};

const SEGMENT_COUNT = 12;

export default function ConfidenceMeter({
  confidence,
  className,
  showLabel = true,
  size = 'md',
}: ConfidenceMeterProps) {
  const tier = getConfidenceTier(confidence);
  const colors = TIER_COLORS[tier];
  const pct = Math.round(confidence * 100);
  const filledSegments = Math.round((confidence * SEGMENT_COUNT));

  const [displayPct, setDisplayPct] = useState(0);
  const [displayFilled, setDisplayFilled] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const DURATION = 1200;

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startRef.current = null;

    function animate(ts: number) {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / DURATION, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayPct(Math.round(pct * eased));
      setDisplayFilled(Math.round(filledSegments * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    }
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [pct, filledSegments]);

  const barHeight = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm';
  const numSize = size === 'sm' ? 'text-xl' : size === 'lg' ? 'text-4xl' : 'text-3xl';

  return (
    <div className={cn('flex flex-col gap-3', className)} role="meter" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Confidence: ${pct}%`}>
      {showLabel && (
        <div className="flex items-end justify-between">
          <div>
            <p className={cn('font-medium', textSize)} style={{ color: 'var(--text-secondary)' }}>
              Confidence Score
            </p>
          </div>
          <div className="text-right">
            <span className={cn('font-extrabold tabular-nums', numSize, colors.text)}>
              {displayPct}%
            </span>
          </div>
        </div>
      )}

      {/* Segmented bar */}
      <div className="flex gap-1" aria-hidden="true">
        {Array.from({ length: SEGMENT_COUNT }).map((_, i) => {
          const filled = i < displayFilled;
          return (
            <div
              key={i}
              className={cn('flex-1 rounded-full transition-all duration-100', barHeight)}
              style={{
                background: filled ? colors.bar : 'var(--border-default)',
                boxShadow: filled ? `0 0 6px ${colors.glow}` : 'none',
                opacity: filled ? 1 : 0.35,
              }}
            />
          );
        })}
      </div>

      {showLabel && (
        <div className="flex items-center justify-between">
          <span className={cn('font-semibold', textSize, colors.text)}>
            {getConfidenceLabel(tier)}
          </span>
          <div className="flex gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      )}
    </div>
  );
}

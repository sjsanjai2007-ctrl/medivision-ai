'use client';

// ============================================================
// MediVision AI – Severity Badge Component
// ============================================================

import React from 'react';
import type { Severity } from '@/lib/types';
import { getSeverityLabel } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface SeverityBadgeProps {
  severity: Severity;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
}

const DOT_COLORS: Record<Severity, string> = {
  mild: 'bg-emerald-500',
  moderate: 'bg-amber-500',
  severe: 'bg-orange-500',
  critical: 'bg-red-500',
};

const BADGE_CLASSES: Record<Severity, string> = {
  mild: 'badge badge-mild',
  moderate: 'badge badge-moderate',
  severe: 'badge badge-severe',
  critical: 'badge badge-critical',
};

const SIZE_CLASSES = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-3 py-1',
  lg: 'text-sm px-4 py-1.5',
};

export default function SeverityBadge({
  severity,
  size = 'md',
  showDot = true,
  className,
}: SeverityBadgeProps) {
  return (
    <span
      className={cn(
        'whitespace-nowrap flex-shrink-0 inline-flex items-center gap-1.5',
        BADGE_CLASSES[severity],
        SIZE_CLASSES[size],
        className
      )}
      role="status"
      aria-label={`Severity: ${getSeverityLabel(severity)}`}
    >
      {showDot && (
        <span className={cn('inline-block w-1.5 h-1.5 rounded-full flex-shrink-0', DOT_COLORS[severity])} aria-hidden="true" />
      )}
      <span>{getSeverityLabel(severity)}</span>
    </span>
  );
}

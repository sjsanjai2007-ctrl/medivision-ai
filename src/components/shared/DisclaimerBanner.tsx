'use client';

// ============================================================
// MediVision AI – Medical Disclaimer Banner
// Mandatory, non-dismissible on all prediction/report pages
// ============================================================

import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DisclaimerBannerProps {
  variant?: 'default' | 'compact' | 'print';
  className?: string;
}

export default function DisclaimerBanner({
  variant = 'default',
  className,
}: DisclaimerBannerProps) {
  if (variant === 'compact') {
    return (
      <div
        className={cn('disclaimer-banner', className)}
        role="note"
        aria-label="Medical Disclaimer"
      >
        <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#d97706' }} />
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          <strong style={{ color: '#d97706' }}>Disclaimer:</strong> AI-assisted screening only — not a medical diagnosis. Consult a qualified healthcare professional.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-2xl p-4 border',
        className
      )}
      style={{
        background: 'rgba(245,158,11,0.06)',
        borderColor: 'rgba(245,158,11,0.25)',
      }}
      role="note"
      aria-label="Medical Disclaimer"
    >
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(245,158,11,0.12)' }}
        >
          <ShieldAlert className="w-5 h-5" style={{ color: '#d97706' }} />
        </div>
        <div>
          <p className="text-sm font-semibold mb-1" style={{ color: '#d97706' }}>
            Medical Disclaimer
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            MediVision AI provides <strong>AI-assisted clinical screening</strong> for informational
            purposes only. The generated results are <strong>not a medical diagnosis</strong>. Always
            consult a qualified healthcare professional for diagnosis and treatment. In case of a
            medical emergency, contact emergency services immediately.
          </p>
        </div>
      </div>
    </div>
  );
}

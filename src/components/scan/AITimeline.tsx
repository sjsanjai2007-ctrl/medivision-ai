'use client';

// ============================================================
// MediVision AI – AI Processing Timeline Animation
// Shows users each step of the AI pipeline in sequence
// ============================================================

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import type { AIProcessingStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TimelineStep {
  id: string;
  label: string;
  status: AIProcessingStatus;
}

interface AITimelineProps {
  steps: TimelineStep[];
  className?: string;
  autoPlay?: boolean;
  stepDelay?: number; // ms between steps
  onComplete?: () => void;
}

const STEP_DEFINITIONS = [
  { id: 'uploaded', label: 'Image Uploaded', icon: '📤' },
  { id: 'quality_verified', label: 'Quality Verified', icon: '🔍' },
  { id: 'ai_processing', label: 'AI Processing', icon: '🧠' },
  { id: 'disease_detection', label: 'Disease Detection', icon: '🩺' },
  { id: 'explainable_ai', label: 'Explainable AI', icon: '🗺️' },
  { id: 'report_generated', label: 'Report Generated', icon: '📋' },
  { id: 'hospital_recommendation', label: 'Hospital Recommendation', icon: '🏥' },
];

export default function AITimeline({
  steps,
  className,
  autoPlay = false,
  stepDelay = 800,
  onComplete,
}: AITimelineProps) {
  const [activeStep, setActiveStep] = useState(
    steps.findIndex((s) => s.status === 'active')
  );
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(
    new Set(steps.filter((s) => s.status === 'completed').map((s) => s.id))
  );

  useEffect(() => {
    if (!autoPlay) return;
    let current = 0;
    const interval = setInterval(() => {
      if (current < steps.length) {
        setActiveStep(current);
        if (current > 0) {
          setCompletedSteps((prev) => {
            const next = new Set(prev);
            next.add(steps[current - 1].id);
            return next;
          });
        }
        current++;
      } else {
        setCompletedSteps((prev) => {
          const next = new Set(prev);
          next.add(steps[steps.length - 1].id);
          return next;
        });
        setActiveStep(-1);
        clearInterval(interval);
        onComplete?.();
      }
    }, stepDelay);
    return () => clearInterval(interval);
  }, [autoPlay, steps, stepDelay, onComplete]);

  return (
    <div className={cn('flex flex-col', className)} role="list" aria-label="AI processing steps">
      {STEP_DEFINITIONS.map((def, idx) => {
        const step = steps.find((s) => s.id === def.id);
        const isCompleted = completedSteps.has(def.id) || step?.status === 'completed';
        const isActive = activeStep === idx || step?.status === 'active';
        void (!isCompleted && !isActive); // track pending state for future use
        const isLast = idx === STEP_DEFINITIONS.length - 1;

        return (
          <div key={def.id} className="timeline-step" role="listitem">
            {/* Connector line */}
            {!isLast && (
              <div
                className="absolute left-[15px] top-10 w-0.5 h-full transition-colors duration-500"
                style={{
                  background: isCompleted ? '#10b981' : 'var(--border-subtle)',
                  zIndex: 0,
                }}
                aria-hidden="true"
              />
            )}

            {/* Step icon */}
            <div
              className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500"
              style={{
                background: isCompleted
                  ? 'linear-gradient(135deg, #10b981, #059669)'
                  : isActive
                    ? 'linear-gradient(135deg, #0ea5e9, #06b6d4)'
                    : 'var(--border-subtle)',
                boxShadow: isCompleted
                  ? '0 0 12px rgba(16,185,129,0.4)'
                  : isActive
                    ? '0 0 12px rgba(14,165,233,0.5)'
                    : 'none',
              }}
            >
              <AnimatePresence mode="wait">
                {isCompleted ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </motion.div>
                ) : isActive ? (
                  <motion.div
                    key="spinner"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Loader2 className="w-4 h-4 text-white" />
                  </motion.div>
                ) : (
                  <motion.span
                    key="pending"
                    className="text-base"
                    style={{ filter: 'grayscale(1)', opacity: 0.4 }}
                  >
                    {def.icon}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* Step label */}
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-2"
            >
              <span
                className={cn(
                  'text-sm font-medium transition-colors duration-300',
                  isCompleted
                    ? 'text-emerald-600'
                    : isActive
                      ? ''
                      : ''
                )}
                style={{
                  color: isCompleted
                    ? undefined
                    : isActive
                      ? 'var(--primary)'
                      : 'var(--text-muted)',
                  fontWeight: isActive ? 600 : isCompleted ? 600 : 400,
                }}
              >
                {def.label}
              </span>
              {isActive && (
                <motion.span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{
                    background: 'rgba(14,165,233,0.12)',
                    color: 'var(--primary)',
                  }}
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Processing...
                </motion.span>
              )}
              {isCompleted && (
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(16,185,129,0.1)', color: '#059669' }}
                >
                  Done
                </span>
              )}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}

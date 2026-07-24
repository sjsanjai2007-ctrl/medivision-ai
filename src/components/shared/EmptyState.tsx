'use client';

// ============================================================
// MediVision AI – Empty State Component
// ============================================================

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({ icon = '📭', title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn('flex flex-col items-center justify-center text-center py-16 px-6', className)}
    >
      <div className="text-5xl mb-4" aria-hidden="true">{icon}</div>
      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      <p className="text-sm max-w-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}

'use client';

// ============================================================
// MediVision AI – Loading Skeleton Components
// ============================================================

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps { className?: string }

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('skeleton', className)} aria-hidden="true" />;
}

export function CardSkeleton() {
  return (
    <div className="surface-card p-4 space-y-3" aria-busy="true" aria-label="Loading...">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4 rounded-lg" />
          <Skeleton className="h-3 w-1/2 rounded-lg" />
        </div>
      </div>
      <Skeleton className="h-3 w-full rounded-lg" />
      <Skeleton className="h-3 w-4/5 rounded-lg" />
      <Skeleton className="h-8 w-full rounded-xl" />
    </div>
  );
}

export function ReportCardSkeleton() {
  return (
    <div className="surface-card p-4 space-y-3" aria-busy="true">
      <div className="flex gap-3">
        <Skeleton className="w-16 h-16 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3 rounded-lg" />
          <Skeleton className="h-3 w-1/2 rounded-lg" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function HospitalCardSkeleton() {
  return (
    <div className="surface-card overflow-hidden" aria-busy="true">
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-3 w-16 rounded-lg" />
          <Skeleton className="h-3 w-16 rounded-lg" />
        </div>
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-8 flex-1 rounded-xl" />
          <Skeleton className="h-8 flex-1 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="p-4 space-y-4" aria-busy="true" aria-label="Loading page...">
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-36 w-full rounded-2xl" />
    </div>
  );
}

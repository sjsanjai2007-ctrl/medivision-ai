// ============================================================
// MediVision AI – Utility Functions
// ============================================================
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Severity, ConfidenceTier, MedicalCategory } from '@/lib/types';

// ── Tailwind class merge ──────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Confidence helpers ────────────────────────────────────────
export function getConfidenceTier(confidence: number): ConfidenceTier {
  if (confidence >= 0.85) return 'very_high';
  if (confidence >= 0.70) return 'high';
  if (confidence >= 0.55) return 'moderate';
  return 'low';
}

export function getConfidenceLabel(tier: ConfidenceTier): string {
  const labels: Record<ConfidenceTier, string> = {
    very_high: 'Very High Confidence',
    high: 'High Confidence',
    moderate: 'Moderate Confidence',
    low: 'Low Confidence',
  };
  return labels[tier];
}

export function getConfidenceColor(tier: ConfidenceTier): string {
  const colors: Record<ConfidenceTier, string> = {
    very_high: 'text-emerald-500',
    high: 'text-sky-500',
    moderate: 'text-amber-500',
    low: 'text-red-500',
  };
  return colors[tier];
}

export function getConfidenceBgColor(tier: ConfidenceTier): string {
  const colors: Record<ConfidenceTier, string> = {
    very_high: 'bg-emerald-500',
    high: 'bg-sky-500',
    moderate: 'bg-amber-500',
    low: 'bg-red-500',
  };
  return colors[tier];
}

// ── Severity helpers ──────────────────────────────────────────
export function getSeverityColor(severity: Severity): string {
  const colors: Record<Severity, string> = {
    mild: 'text-emerald-600',
    moderate: 'text-amber-600',
    severe: 'text-orange-600',
    critical: 'text-red-600',
  };
  return colors[severity];
}

export function getSeverityBg(severity: Severity): string {
  const colors: Record<Severity, string> = {
    mild: 'bg-emerald-50 border-emerald-200',
    moderate: 'bg-amber-50 border-amber-200',
    severe: 'bg-orange-50 border-orange-200',
    critical: 'bg-red-50 border-red-200',
  };
  return colors[severity];
}

export function getSeverityGradient(severity: Severity): string {
  const gradients: Record<Severity, string> = {
    mild: 'from-emerald-500 to-emerald-600',
    moderate: 'from-amber-500 to-amber-600',
    severe: 'from-orange-500 to-orange-600',
    critical: 'from-red-500 to-red-600',
  };
  return gradients[severity];
}

export function getSeverityLabel(severity: Severity): string {
  const labels: Record<Severity, string> = {
    mild: 'Mild',
    moderate: 'Moderate',
    severe: 'Severe',
    critical: 'Critical',
  };
  return labels[severity];
}

// ── Category helpers ──────────────────────────────────────────
export function getCategoryLabel(category: MedicalCategory): string {
  const labels: Record<MedicalCategory, string> = {
    skin: 'Skin Condition',
    eye: 'Eye Condition',
    oral: 'Oral Health',
    dental: 'Dental',
    burns: 'Burns',
    wounds: 'Wounds',
    chest: 'Chest X-Ray',
  };
  return labels[category];
}

// ── Date/time helpers ─────────────────────────────────────────
export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString));
}

export function formatDateTime(dateString: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

export function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

// ── Distance helpers ──────────────────────────────────────────
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)} km`;
}

export function formatTravelTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ── ID generators ─────────────────────────────────────────────
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ── File helpers ──────────────────────────────────────────────
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isValidImageType(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return validTypes.includes(file.type);
}

export function isValidImageSize(file: File, maxMB = 10): boolean {
  return file.size <= maxMB * 1024 * 1024;
}

// ── Rating helpers ────────────────────────────────────────────
export function getStarArray(rating: number): Array<'full' | 'half' | 'empty'> {
  const stars: Array<'full' | 'half' | 'empty'> = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) stars.push('full');
    else if (rating >= i - 0.5) stars.push('half');
    else stars.push('empty');
  }
  return stars;
}

// ── Urgency helpers ───────────────────────────────────────────
export function getUrgencyLabel(urgency: string): string {
  const labels: Record<string, string> = {
    routine: 'Routine Visit',
    soon: 'Within 1 Week',
    urgent: 'Within 24-48 Hours',
    emergency: 'Immediate Attention',
  };
  return labels[urgency] ?? urgency;
}

export function getUrgencyColor(urgency: string): string {
  const colors: Record<string, string> = {
    routine: 'text-emerald-600',
    soon: 'text-sky-600',
    urgent: 'text-amber-600',
    emergency: 'text-red-600',
  };
  return colors[urgency] ?? 'text-gray-600';
}

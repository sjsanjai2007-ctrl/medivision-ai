// ============================================================
// MediVision AI – Prediction API
// POST /predict/{category}  →  PredictionResult (from backend)
// Maps the backend schema to the richer frontend PredictionResult type.
// ============================================================

import { apiRequest } from './client';
import type { MedicalCategory, PredictionResult, ConfidenceTier, Severity } from '@/lib/types';

// ── Backend schema (matches schemas.py) ───────────────────
interface BackendBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  confidence: number;
}

interface BackendPrediction {
  category: MedicalCategory;
  condition: string;
  confidence: number;
  severity: Severity;
  description: string;
  recommendations: string[];
  bounding_boxes: BackendBoundingBox[];
  heatmap_url: string | null;
  report_id: string;
}

// ── Helpers ───────────────────────────────────────────────

function toConfidenceTier(confidence: number): ConfidenceTier {
  if (confidence >= 0.85) return 'very_high';
  if (confidence >= 0.70) return 'high';
  if (confidence >= 0.55) return 'moderate';
  return 'low';
}

function toUrgency(severity: Severity): PredictionResult['urgency'] {
  switch (severity) {
    case 'critical': return 'emergency';
    case 'severe':   return 'urgent';
    case 'moderate': return 'soon';
    default:         return 'routine';
  }
}

function toSpecialist(category: MedicalCategory): string {
  const map: Record<MedicalCategory, string> = {
    skin:    'Dermatologist',
    eye:     'Ophthalmologist',
    chest:   'Pulmonologist / Radiologist',
    dental:  'Dentist',
    oral:    'Oral Surgeon',
    burns:   'Burn Specialist',
    wounds:  'General Surgeon',
  };
  return map[category] ?? 'Specialist';
}

/** Adapt backend response to the richer frontend PredictionResult shape. */
function adaptPrediction(raw: BackendPrediction, imageUrl: string): PredictionResult {
  return {
    id: raw.report_id,
    category: raw.category,
    condition: raw.condition,
    confidence: raw.confidence,
    confidenceTier: toConfidenceTier(raw.confidence),
    severity: raw.severity,
    affectedArea: 'Identified region',
    description: raw.description,
    aiExplanation: raw.description,
    recommendation: raw.recommendations.join(' '),
    suggestedSpecialist: toSpecialist(raw.category),
    urgency: toUrgency(raw.severity),
    similarConditions: [],
    heatmapUrl: raw.heatmap_url ?? '',
    originalImageUrl: imageUrl,
    boundingBox: raw.bounding_boxes[0]
      ? {
          x: raw.bounding_boxes[0].x,
          y: raw.bounding_boxes[0].y,
          width: raw.bounding_boxes[0].width,
          height: raw.bounding_boxes[0].height,
        }
      : undefined,
    processedAt: new Date().toISOString(),
  };
}

// ── Public API ────────────────────────────────────────────

export async function predictApi(
  file: File,
  category: MedicalCategory,
  demoMode = false,
): Promise<PredictionResult> {
  const form = new FormData();
  form.append('file', file);

  const raw = await apiRequest<BackendPrediction>(
    `/predict/${category}?demo_mode=${demoMode}`,
    { method: 'POST', body: form, formData: true },
  );

  // Build a local object URL for the original image preview
  const imageUrl = URL.createObjectURL(file);
  return adaptPrediction(raw, imageUrl);
}

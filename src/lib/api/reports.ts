// ============================================================
// MediVision AI – Reports API
// GET    /reports          → ReportSummary[]
// GET    /reports/{id}     → ReportDetail
// DELETE /reports/{id}     → { deleted, message }
// ============================================================

import { apiRequest } from './client';
import type { MedicalCategory, Severity } from '@/lib/types';

// ── Backend schemas (mirrors schemas.py) ──────────────────

export interface ApiReportSummary {
  id: string;
  category: MedicalCategory;
  condition: string;
  severity: Severity;
  confidence: number;
  created_at: string;
  image_url: string | null;
}

export interface ApiReportDetail extends ApiReportSummary {
  description: string;
  recommendations: string[];
  heatmap_url: string | null;
  disclaimer: string;
}

// ── Public API ────────────────────────────────────────────

export async function listReportsApi(
  filters?: { category?: string; severity?: string },
): Promise<ApiReportSummary[]> {
  const params = new URLSearchParams();
  if (filters?.category) params.set('category', filters.category);
  if (filters?.severity) params.set('severity', filters.severity);

  const query = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<ApiReportSummary[]>(`/reports/${query}`);
}

export async function getReportApi(reportId: string): Promise<ApiReportDetail> {
  return apiRequest<ApiReportDetail>(`/reports/${reportId}`);
}

export async function deleteReportApi(reportId: string): Promise<{ deleted: string; message: string }> {
  return apiRequest<{ deleted: string; message: string }>(`/reports/${reportId}`, {
    method: 'DELETE',
  });
}

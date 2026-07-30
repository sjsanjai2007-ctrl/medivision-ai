'use client';

// ============================================================
// MediVision AI – Reports Page
// ============================================================

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Search, Download, Trash2, X, ChevronRight, Calendar, RefreshCw } from 'lucide-react';
import SeverityBadge from '@/components/shared/SeverityBadge';
import ConfidenceMeter from '@/components/shared/ConfidenceMeter';
import DisclaimerBanner from '@/components/shared/DisclaimerBanner';
import EmptyState from '@/components/shared/EmptyState';
import { useDemoMode } from '@/lib/providers/DemoModeProvider';
import { listReportsApi, deleteReportApi } from '@/lib/api/reports';
import type { Report } from '@/lib/types';
import { formatDate, getCategoryLabel, getUrgencyLabel, getUrgencyColor } from '@/lib/utils';

export default function ReportsPage() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Report | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const raw = await listReportsApi();
        const mapped: Report[] = raw.map((r) => ({
          id: r.id,
          userId: 'current',
          patientName: 'Patient',
          date: r.created_at,
          category: r.category,
          imageUrl: r.image_url ?? '',
          status: 'completed' as const,
          createdAt: r.created_at,
          updatedAt: r.created_at,
          prediction: {
            id: r.id,
            category: r.category,
            condition: r.condition,
            confidence: r.confidence,
            confidenceTier: r.confidence >= 0.85 ? 'very_high' : r.confidence >= 0.70 ? 'high' : r.confidence >= 0.55 ? 'moderate' : 'low',
            severity: r.severity,
            affectedArea: '',
            description: '',
            aiExplanation: '',
            recommendation: '',
            suggestedSpecialist: '',
            urgency: 'routine' as const,
            similarConditions: [],
            heatmapUrl: '',
            originalImageUrl: r.image_url ?? '',
            processedAt: r.created_at,
          },
        }));
        setReports(mapped);
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : 'Failed to load reports.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() =>
    reports.filter((r) =>
      r.prediction.condition.toLowerCase().includes(query.toLowerCase()) ||
      getCategoryLabel(r.category).toLowerCase().includes(query.toLowerCase())
    ), [reports, query]);

  const deleteReport = async (id: string) => {
    try { await deleteReportApi(id); } catch { /* ignore */ }
    setReports((prev) => prev.filter((r) => r.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  return (
    <>
      <div className="page-wrap">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>My Reports</h1>
          <span className="text-sm px-3 py-1 rounded-full font-medium"
            style={{ background: 'rgba(14,165,233,0.1)', color: 'var(--primary)' }}>
            {reports.length} reports
          </span>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-3 mb-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: 'var(--bg-surface)' }} />
            ))}
          </div>
        )}

        {/* Fetch error banner */}
        {fetchError && !isLoading && (
          <div className="flex items-center gap-2 p-3 rounded-xl text-sm mb-4"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#d97706' }}>
            <RefreshCw className="w-4 h-4 flex-shrink-0" />
            <span>Could not connect to backend — showing demo data. ({fetchError})</span>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by condition or category..."
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
            }}
            aria-label="Search reports"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2" aria-label="Clear search">
              <X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
        </div>

        {/* Report list */}
        {filtered.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No reports found"
            description={query ? `No reports match "${query}"` : 'Start your first AI scan to generate a report'}
            action={<a href="/scan" className="btn-primary">Start Scan</a>}
          />
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((report, idx) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div
                    className="flex gap-3 p-4 rounded-2xl cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                    style={{ background: 'var(--bg-surface)', border: `1px solid ${selected?.id === report.id ? 'rgba(14,165,233,0.5)' : 'var(--border-subtle)'}`, boxShadow: 'var(--shadow-sm)' }}
                    onClick={() => setSelected(selected?.id === report.id ? null : report)}
                    role="button"
                    tabIndex={0}
                    aria-expanded={selected?.id === report.id}
                  >
                    {/* Image */}
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                      <Image
                        src={report.imageUrl || report.prediction?.originalImageUrl || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80'}
                        alt={report.prediction?.condition || 'Report image'}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                            {report.prediction.condition}
                          </p>
                          <p className="text-xs mt-0.5 flex items-center gap-1 truncate" style={{ color: 'var(--text-muted)' }}>
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{formatDate(report.date)} · {getCategoryLabel(report.category)}</span>
                          </p>
                        </div>
                        <SeverityBadge severity={report.prediction.severity} size="sm" />
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-1 rounded-full overflow-hidden min-w-0" style={{ background: 'var(--border-subtle)' }}>
                          <div className="h-full rounded-full" style={{ width: `${report.prediction.confidence * 100}%`, background: 'linear-gradient(90deg,#0ea5e9,#06b6d4)' }} />
                        </div>
                        <span className="text-[10px] font-semibold whitespace-nowrap flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                          {Math.round(report.prediction.confidence * 100)}% conf.
                        </span>
                        <ChevronRight
                          className="w-4 h-4 transition-transform duration-200 flex-shrink-0"
                          style={{ color: 'var(--text-muted)', transform: selected?.id === report.id ? 'rotate(90deg)' : 'none' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {selected?.id === report.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 p-4 rounded-2xl space-y-4"
                          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                          <ConfidenceMeter confidence={report.prediction.confidence} size="sm" />

                          <div>
                            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>AFFECTED AREA</p>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{report.prediction.affectedArea}</p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>AI EXPLANATION</p>
                            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{report.prediction.aiExplanation}</p>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Specialist</p>
                              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{report.prediction.suggestedSpecialist}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Urgency</p>
                              <p className={`text-sm font-bold ${getUrgencyColor(report.prediction.urgency)}`}>
                                {getUrgencyLabel(report.prediction.urgency)}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <button
                              className="btn-secondary flex-1 text-sm py-2"
                              onClick={() => alert('PDF download coming in Phase 5')}
                            >
                              <Download className="w-4 h-4" /> Download PDF
                            </button>
                            <button
                              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                              style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }}
                              onClick={() => deleteReport(report.id)}
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </div>

                          <DisclaimerBanner variant="compact" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </>
  );
}

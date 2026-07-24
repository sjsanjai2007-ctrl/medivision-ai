'use client';

// ============================================================
// MediVision AI – Scan Page (Full Implementation)
// Category Selection → Upload → Quality Check → AI Pipeline → Results
// ============================================================

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Camera, Upload, ImageIcon, CheckCircle2, XCircle,
  RefreshCw, ArrowRight, Eye, FileText, AlertCircle,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import AITimeline from '@/components/scan/AITimeline';
import ConfidenceMeter from '@/components/shared/ConfidenceMeter';
import SeverityBadge from '@/components/shared/SeverityBadge';
import DisclaimerBanner from '@/components/shared/DisclaimerBanner';
import { MEDICAL_CATEGORIES, AI_TIMELINE_STEPS, DEMO_REPORTS } from '@/lib/constants/demo-data';
import { useDemoMode } from '@/lib/providers/DemoModeProvider';
import { predictApi } from '@/lib/api/predict';
import type { MedicalCategory, AITimelineStep, PredictionResult } from '@/lib/types';
import { getCategoryLabel, isValidImageType, isValidImageSize } from '@/lib/utils';
import { cn } from '@/lib/utils';

type ScanStep = 'category' | 'upload' | 'quality' | 'processing' | 'results';
type UploadTab = 'gallery' | 'camera' | 'drag';

export default function ScanPage() {
  const { isDemoMode } = useDemoMode();
  const [step, setStep] = useState<ScanStep>('category');
  const [selectedCategory, setSelectedCategory] = useState<MedicalCategory | null>(null);
  const [uploadTab, setUploadTab] = useState<UploadTab>('gallery');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [timelineSteps, setTimelineSteps] = useState<AITimelineStep[]>(AI_TIMELINE_STEPS);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [qualityErrors, setQualityErrors] = useState<string[]>([]);
  const [predictError, setPredictError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedFileRef = useRef<File | null>(null);

  // Mock prediction (Demo Mode)
  const mockPredict = useCallback(async () => {
    const mockReport = DEMO_REPORTS[0];
    const steps = AI_TIMELINE_STEPS.map((s) => ({ ...s }));

    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, 700 + Math.random() * 300));
      setTimelineSteps((prev) =>
        prev.map((s, idx) => ({
          ...s,
          status: idx < i ? 'completed' : idx === i ? 'active' : 'pending',
        }))
      );
    }
    await new Promise((r) => setTimeout(r, 600));
    setTimelineSteps((prev) => prev.map((s) => ({ ...s, status: 'completed' })));
    setResult(mockReport.prediction);
    setStep('results');
  }, []);

  // Real prediction via FastAPI backend
  const realPredict = useCallback(async () => {
    const file = selectedFileRef.current;
    if (!file || !selectedCategory) return;
    const steps = AI_TIMELINE_STEPS.map((s) => ({ ...s }));

    // Animate first few steps while upload/inference runs in parallel
    const animateSteps = async () => {
      for (let i = 0; i < 3; i++) {
        await new Promise((r) => setTimeout(r, 600 + Math.random() * 300));
        setTimelineSteps((prev) =>
          prev.map((s, idx) => ({
            ...s,
            status: idx < i ? 'completed' : idx === i ? 'active' : 'pending',
          }))
        );
      }
    };

    try {
      const [prediction] = await Promise.all([
        predictApi(file, selectedCategory, false),
        animateSteps(),
      ]);
      // Complete remaining timeline steps
      for (let i = 3; i < steps.length; i++) {
        await new Promise((r) => setTimeout(r, 400));
        setTimelineSteps((prev) =>
          prev.map((s, idx) => ({
            ...s,
            status: idx <= i ? 'completed' : 'pending',
          }))
        );
      }
      setTimelineSteps((prev) => prev.map((s) => ({ ...s, status: 'completed' })));
      setResult(prediction);
      setStep('results');
    } catch (err) {
      setPredictError(err instanceof Error ? err.message : 'Prediction failed. Please try again.');
      setStep('quality'); // Send back so user can retry
    }
  }, [selectedCategory]);

  const handleFileSelect = (file: File) => {
    if (!isValidImageType(file)) {
      setQualityErrors(['Invalid file type. Please upload JPG, PNG, or WebP.']);
      return;
    }
    if (!isValidImageSize(file)) {
      setQualityErrors(['File too large. Maximum size is 10MB.']);
      return;
    }
    selectedFileRef.current = file; // Store for real prediction
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setQualityErrors([]);
    setPredictError(null);
    setStep('quality');
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, []);  

  const startProcessing = () => {
    setStep('processing');
    setPredictError(null);
    setTimelineSteps(AI_TIMELINE_STEPS.map((s) => ({ ...s, status: 'pending' })));
    if (isDemoMode) {
      mockPredict();
    } else {
      realPredict();
    }
  };

  const reset = () => {
    setStep('category');
    setSelectedCategory(null);
    setPreviewUrl(null);
    setResult(null);
    setQualityErrors([]);
    setPredictError(null);
    selectedFileRef.current = null;
    setTimelineSteps(AI_TIMELINE_STEPS);
  };

  return (
    <AppShell>
      <div className="px-4 py-5 max-w-2xl mx-auto lg:max-w-3xl lg:py-8">
        {/* Step Indicator */}
        <div className="flex items-center gap-1.5 sm:gap-2 mb-6 overflow-x-auto no-scrollbar pb-1 max-w-full">
          {(['category', 'upload', 'quality', 'processing', 'results'] as ScanStep[]).map((s, idx) => {
            const stepIdx = ['category', 'upload', 'quality', 'processing', 'results'].indexOf(step);
            const thisIdx = idx;
            const done = thisIdx < stepIdx;
            const active = s === step;
            return (
              <React.Fragment key={s}>
                <div className={cn(
                  'flex-shrink-0 flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300',
                  active ? 'text-white' : done ? '' : ''
                )}
                  style={{
                    background: active
                      ? 'linear-gradient(135deg,#0ea5e9,#06b6d4)'
                      : done
                        ? 'rgba(16,185,129,0.12)'
                        : 'var(--border-subtle)',
                    color: active ? 'white' : done ? '#059669' : 'var(--text-muted)',
                    boxShadow: active ? '0 2px 12px rgba(14,165,233,0.4)' : 'none',
                  }}>
                  {done && <CheckCircle2 className="w-3 h-3" />}
                  <span>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                </div>
                {idx < 4 && (
                  <div className="w-4 h-0.5 flex-shrink-0 rounded-full"
                    style={{ background: done ? '#10b981' : 'var(--border-subtle)' }} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* ── STEP 1: Category Selection ── */}
          {step === 'category' && (
            <motion.div key="category" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Select Category</h1>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Choose the type of medical image you want to analyze</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {MEDICAL_CATEGORIES.map((cat, idx) => (
                  <motion.button
                    key={cat.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => { setSelectedCategory(cat.id); setStep('upload'); }}
                    className="p-4 rounded-2xl text-center transition-all duration-200 cursor-pointer"
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div className="text-3xl mb-2">{cat.icon}</div>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{cat.label}</p>
                    <p className="text-xs mt-1 leading-tight line-clamp-2" style={{ color: 'var(--text-muted)' }}>{cat.description}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Upload ── */}
          {step === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-5">
              <div className="flex items-center gap-3">
                <button onClick={reset} className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>← Back</button>
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Upload Image</h1>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Category: {selectedCategory ? getCategoryLabel(selectedCategory) : ''}</p>
                </div>
              </div>

              {/* Upload tabs */}
              <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--border-subtle)' }}>
                {(['gallery', 'camera', 'drag'] as UploadTab[]).map((tab) => (
                  <button key={tab}
                    onClick={() => setUploadTab(tab)}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                    style={{
                      background: uploadTab === tab ? 'var(--bg-surface)' : 'transparent',
                      color: uploadTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
                      boxShadow: uploadTab === tab ? 'var(--shadow-sm)' : 'none',
                    }}>
                    {tab === 'gallery' ? '📁 Gallery' : tab === 'camera' ? '📷 Camera' : '🖱️ Drop'}
                  </button>
                ))}
              </div>

              {/* Upload area */}
              {uploadTab === 'drag' ? (
                <div
                  className={cn('upload-zone', isDragOver && 'drag-active')}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  aria-label="Drop image here or click to upload"
                >
                  <Upload className="w-10 h-10" style={{ color: 'var(--primary)' }} />
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Drop your image here</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>or click to browse · JPG, PNG, WebP · Max 10MB</p>
                </div>
              ) : (
                <div
                  className="upload-zone"
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  aria-label={uploadTab === 'camera' ? 'Open camera' : 'Browse files'}
                >
                  {uploadTab === 'camera'
                    ? <Camera className="w-10 h-10" style={{ color: 'var(--primary)' }} />
                    : <ImageIcon className="w-10 h-10" style={{ color: 'var(--primary)' }} />
                  }
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {uploadTab === 'camera' ? 'Take a photo' : 'Choose from gallery'}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>JPG, PNG, WebP · Max 10MB</p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                capture={uploadTab === 'camera' ? 'environment' : undefined}
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
                aria-hidden="true"
              />

              {qualityErrors.length > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-xl text-sm"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626' }}>
                  <XCircle className="w-4 h-4 flex-shrink-0" />
                  {qualityErrors[0]}
                </div>
              )}

              {/* Quality tips */}
              <div className="p-4 rounded-2xl space-y-2" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>📸 Tips for best results</p>
                {['Good lighting, no shadows', 'Clear focus, no motion blur', 'Affected area clearly visible', 'Minimum 640×480 resolution'].map((tip) => (
                  <div key={tip} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <CheckCircle2 className="w-3 h-3 flex-shrink-0 text-emerald-500" />
                    {tip}
                  </div>
                ))}
              </div>
              <DisclaimerBanner variant="compact" />
            </motion.div>
          )}

          {/* ── STEP 3: Quality Check ── */}
          {step === 'quality' && previewUrl && (
            <motion.div key="quality" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-5">
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Quality Check</h1>

              <div className="relative rounded-2xl overflow-hidden aspect-video w-full">
                <Image src={previewUrl} alt="Uploaded image" fill className="object-contain" style={{ background: 'var(--border-subtle)' }} />
              </div>

              {/* Quality metrics */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Sharpness', score: 92, pass: true, icon: '🔍' },
                  { label: 'Brightness', score: 87, pass: true, icon: '☀️' },
                  { label: 'Resolution', score: 95, pass: true, icon: '📐' },
                  { label: 'Angle', score: 88, pass: true, icon: '📷' },
                ].map((metric) => (
                  <div key={metric.label} className="p-3 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{metric.icon} {metric.label}</span>
                      {metric.pass
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        : <XCircle className="w-4 h-4 text-red-500" />}
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'var(--border-subtle)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: metric.pass ? 'linear-gradient(90deg,#10b981,#059669)' : '#ef4444' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.score}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                      />
                    </div>
                    <p className="text-xs mt-1 font-semibold" style={{ color: metric.pass ? '#059669' : '#dc2626' }}>{metric.score}%</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl"
                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <p className="text-sm font-medium text-emerald-700">Image quality is excellent. Ready for AI analysis.</p>
              </div>

              {predictError && (
                <div className="flex items-center gap-2 p-3 rounded-xl text-sm"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626' }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {predictError}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep('upload')} className="btn-secondary flex-1">
                  <RefreshCw className="w-4 h-4" /> Retake
                </button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={startProcessing} className="btn-primary flex-1">
                  Analyze <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 4: Processing ── */}
          {step === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <div className="text-center">
                <motion.div
                  className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#0ea5e9,#06b6d4)', boxShadow: '0 0 32px rgba(14,165,233,0.5)' }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-3xl">🧠</span>
                </motion.div>
                <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>AI is analyzing...</h1>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>This usually takes 3–5 seconds</p>
              </div>

              <div className="p-5 rounded-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <AITimeline steps={timelineSteps} />
              </div>
            </motion.div>
          )}

          {/* ── STEP 5: Results ── */}
          {step === 'results' && result && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-5">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Screening Result</h1>
                <button onClick={reset} className="btn-ghost text-sm">New Scan</button>
              </div>

              {/* Main result card */}
              <div className="p-5 rounded-2xl space-y-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-md)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Detected Condition</p>
                    <h2 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{result.condition}</h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{result.affectedArea}</p>
                  </div>
                  <SeverityBadge severity={result.severity} size="md" />
                </div>

                <ConfidenceMeter confidence={result.confidence} />
              </div>

              {/* Heatmap viewer */}
              <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>🗺️ Explainable AI – Grad-CAM Visualization</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="relative h-36 rounded-xl overflow-hidden">
                      <Image
                        src={previewUrl || result.originalImageUrl || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80'}
                        alt="Original image"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <p className="text-xs text-center font-medium" style={{ color: 'var(--text-muted)' }}>Original</p>
                  </div>
                  <div className="space-y-1">
                    <div className="relative h-36 rounded-xl overflow-hidden heatmap-overlay">
                      <Image
                        src={result.heatmapUrl || previewUrl || 'https://images.unsplash.com/photo-1530026405186-ed1f139313f3?w=400&q=80'}
                        alt="Heatmap visualization"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      <div className="absolute inset-0 opacity-40" style={{ background: 'linear-gradient(135deg,transparent,rgba(239,68,68,0.4),rgba(245,158,11,0.3))' }} />
                    </div>
                    <p className="text-xs text-center font-medium" style={{ color: 'var(--text-muted)' }}>Heatmap</p>
                  </div>
                </div>
              </div>

              {/* AI Explanation */}
              <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>🤖 AI Explanation</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{result.aiExplanation}</p>
              </div>

              {/* Similar conditions */}
              <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Similar Conditions Considered</p>
                <div className="space-y-2">
                  {result.similarConditions.map((sc) => (
                    <div key={sc.name} className="flex items-center justify-between gap-2">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{sc.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
                          <div className="h-full rounded-full" style={{ width: `${sc.probability * 100}%`, background: 'var(--border-strong)' }} />
                        </div>
                        <span className="text-xs font-medium w-10 text-right" style={{ color: 'var(--text-muted)' }}>{Math.round(sc.probability * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendation */}
              <div className="p-4 rounded-2xl" style={{ background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.2)' }}>
                <p className="text-sm font-semibold mb-2" style={{ color: 'var(--primary)' }}>💊 Recommendation</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{result.recommendation}</p>
                <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid rgba(14,165,233,0.15)' }}>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Suggested Specialist</p>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{result.suggestedSpecialist}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Urgency</p>
                    <p className="text-sm font-bold capitalize" style={{ color: result.urgency === 'emergency' ? '#dc2626' : result.urgency === 'urgent' ? '#d97706' : '#059669' }}>
                      {result.urgency}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link href="/reports" className="btn-secondary text-center flex items-center justify-center gap-2 min-h-[44px]">
                  <FileText className="w-4 h-4" /> View Report
                </Link>
                <Link href="/hospitals" className="btn-primary text-center flex items-center justify-center gap-2 min-h-[44px]">
                  <Eye className="w-4 h-4" /> Find Hospitals
                </Link>
              </div>

              <DisclaimerBanner />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}

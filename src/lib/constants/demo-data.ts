// ============================================================
// MediVision AI – App Constants & Configuration
// (No demo / mock data — all patient data comes from the API)
// ============================================================

import type {
  CategoryConfig, QuickAction, LanguageOption,
  AITimelineStep, HealthTip,
} from '@/lib/types';

// ── Supported Languages ───────────────────────────────────────
export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English',   nativeName: 'English',    flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi',     nativeName: 'हिन्दी',       flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil',     nativeName: 'தமிழ்',       flag: '🇮🇳' },
  { code: 'te', name: 'Telugu',    nativeName: 'తెలుగు',      flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada',   nativeName: 'ಕನ್ನಡ',       flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം',     flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi',   nativeName: 'मराठी',       flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali',   nativeName: 'বাংলা',       flag: '🇮🇳' },
];

// ── Medical Scan Categories ───────────────────────────────────
export const MEDICAL_CATEGORIES: CategoryConfig[] = [
  {
    id: 'skin',
    label: 'Skin',
    description: 'Rashes, lesions, pigmentation disorders',
    icon: '🩹',
    color: 'text-rose-500',
    gradient: 'from-rose-400 to-pink-600',
    supportedConditions: ['Psoriasis', 'Eczema', 'Melanoma', 'Acne', 'Rosacea'],
  },
  {
    id: 'eye',
    label: 'Eye',
    description: 'Retinal, corneal, and vision conditions',
    icon: '👁️',
    color: 'text-sky-500',
    gradient: 'from-sky-400 to-blue-600',
    supportedConditions: ['Diabetic Retinopathy', 'Glaucoma', 'Cataract'],
  },
  {
    id: 'oral',
    label: 'Oral',
    description: 'Mouth ulcers, lesions, and mucosal health',
    icon: '🦷',
    color: 'text-violet-500',
    gradient: 'from-violet-400 to-purple-600',
    supportedConditions: ['Oral Ulcer', 'Oral Cancer', 'Thrush', 'Leukoplakia'],
  },
  {
    id: 'dental',
    label: 'Dental',
    description: 'Caries, gum disease, and tooth conditions',
    icon: '🦷',
    color: 'text-cyan-500',
    gradient: 'from-cyan-400 to-teal-600',
    supportedConditions: ['Dental Caries', 'Gingivitis', 'Periodontitis'],
  },
  {
    id: 'burns',
    label: 'Burns',
    description: 'Thermal, chemical, and radiation burns',
    icon: '🔥',
    color: 'text-orange-500',
    gradient: 'from-orange-400 to-red-600',
    supportedConditions: ['First Degree', 'Second Degree', 'Third Degree'],
  },
  {
    id: 'wounds',
    label: 'Wounds',
    description: 'Lacerations, abrasions, and wound assessment',
    icon: '🩸',
    color: 'text-red-500',
    gradient: 'from-red-400 to-rose-600',
    supportedConditions: ['Laceration', 'Abrasion', 'Infected Wound'],
  },
  {
    id: 'chest',
    label: 'Chest X-Ray',
    description: 'Pulmonary and thoracic condition screening',
    icon: '🫁',
    color: 'text-indigo-500',
    gradient: 'from-indigo-400 to-blue-600',
    supportedConditions: ['Pneumonia', 'Tuberculosis', 'COVID-19'],
  },
];

// ── AI Processing Timeline Steps ──────────────────────────────
export const AI_TIMELINE_STEPS: AITimelineStep[] = [
  { id: 'uploaded',             label: 'Image Uploaded',         status: 'pending' },
  { id: 'quality_verified',    label: 'Quality Verified',        status: 'pending' },
  { id: 'ai_processing',       label: 'AI Processing',           status: 'pending' },
  { id: 'disease_detection',   label: 'Disease Detection',       status: 'pending' },
  { id: 'explainable_ai',      label: 'Explainable AI',          status: 'pending' },
  { id: 'report_generated',    label: 'Report Generated',        status: 'pending' },
  { id: 'hospital_recommendation', label: 'Hospital Recommendation', status: 'pending' },
];

// ── Quick Actions (AI chat shortcuts) ─────────────────────────
export const QUICK_ACTIONS: QuickAction[] = [
  { id: 'qa-1', label: 'Explain My Report',  icon: '📋', prompt: 'Can you explain my latest screening report in simple terms?' },
  { id: 'qa-2', label: 'Nearby Hospitals',   icon: '🏥', prompt: 'Show me highly rated hospitals near me for my condition.' },
  { id: 'qa-3', label: 'Diet Advice',        icon: '🥗', prompt: 'What foods should I eat or avoid for my detected condition?' },
  { id: 'qa-4', label: 'Medicine Info',      icon: '💊', prompt: 'What medicines are commonly prescribed for my condition?' },
  { id: 'qa-5', label: 'Emergency Signs',    icon: '🚨', prompt: 'What symptoms require emergency medical attention for my condition?' },
];

// ── Health Tips (static educational content) ──────────────────
export const HEALTH_TIPS: HealthTip[] = [
  {
    id: 'tip-1',
    title: 'Daily Sunscreen',
    body: 'Apply SPF 30+ sunscreen every day, even on cloudy days, to protect against UV-induced skin damage.',
    category: 'Skin Health',
    icon: '☀️',
    color: 'from-amber-400 to-orange-500',
  },
  {
    id: 'tip-2',
    title: 'Eye Screen Breaks',
    body: 'Follow the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds.',
    category: 'Eye Health',
    icon: '👁️',
    color: 'from-sky-400 to-blue-500',
  },
  {
    id: 'tip-3',
    title: 'Hydration First',
    body: 'Drink 8–10 glasses of water daily. Hydration is essential for healthy skin, kidney function, and energy levels.',
    category: 'General Health',
    icon: '💧',
    color: 'from-cyan-400 to-teal-500',
  },
  {
    id: 'tip-4',
    title: 'Oral Hygiene',
    body: 'Brush twice daily and floss once. Regular dental check-ups every 6 months prevent 90% of oral diseases.',
    category: 'Dental Health',
    icon: '🦷',
    color: 'from-violet-400 to-purple-500',
  },
  {
    id: 'tip-5',
    title: 'Stress Management',
    body: 'Chronic stress worsens autoimmune skin conditions. Practice 10 minutes of mindfulness daily.',
    category: 'Mental Health',
    icon: '🧘',
    color: 'from-emerald-400 to-green-500',
  },
];

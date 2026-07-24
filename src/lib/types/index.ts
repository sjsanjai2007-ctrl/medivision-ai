// ============================================================
// MediVision AI – Global TypeScript Types
// ============================================================

// ── Medical Categories ────────────────────────────────────────
export type MedicalCategory =
  | 'skin'
  | 'eye'
  | 'oral'
  | 'dental'
  | 'burns'
  | 'wounds'
  | 'chest';

// ── Severity Levels ───────────────────────────────────────────
export type Severity = 'mild' | 'moderate' | 'severe' | 'critical';

// ── Confidence Tiers ─────────────────────────────────────────
export type ConfidenceTier = 'very_high' | 'high' | 'moderate' | 'low';

// ── Image Quality ────────────────────────────────────────────
export interface ImageQualityResult {
  passed: boolean;
  blur: { passed: boolean; score: number; message: string };
  brightness: { passed: boolean; score: number; message: string };
  resolution: { passed: boolean; width: number; height: number; message: string };
  angle: { passed: boolean; score: number; message: string };
}

// ── AI Processing Steps ───────────────────────────────────────
export type AIProcessingStep =
  | 'uploaded'
  | 'quality_verified'
  | 'ai_processing'
  | 'disease_detection'
  | 'explainable_ai'
  | 'report_generated'
  | 'hospital_recommendation';

export type AIProcessingStatus = 'pending' | 'active' | 'completed' | 'error';

export interface AITimelineStep {
  id: AIProcessingStep;
  label: string;
  status: AIProcessingStatus;
}

// ── Prediction Result ─────────────────────────────────────────
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SimilarCondition {
  name: string;
  probability: number;
}

export interface PredictionResult {
  id: string;
  category: MedicalCategory;
  condition: string;
  confidence: number;
  confidenceTier: ConfidenceTier;
  severity: Severity;
  affectedArea: string;
  description: string;
  aiExplanation: string;
  recommendation: string;
  suggestedSpecialist: string;
  urgency: 'routine' | 'soon' | 'urgent' | 'emergency';
  similarConditions: SimilarCondition[];
  heatmapUrl: string;
  originalImageUrl: string;
  boundingBox?: BoundingBox;
  processedAt: string;
}

// ── Report ────────────────────────────────────────────────────
export interface Report {
  id: string;
  userId: string;
  patientName: string;
  date: string;
  category: MedicalCategory;
  imageUrl: string;
  prediction: PredictionResult;
  status: 'completed' | 'processing' | 'failed';
  createdAt: string;
  updatedAt: string;
}

// ── Hospital ──────────────────────────────────────────────────
export interface Hospital {
  id: string;
  name: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  distance: number; // km
  travelTime: number; // minutes
  isOpen: boolean;
  openHours: string;
  address: string;
  phone: string;
  website?: string;
  services: string[];
  specialists: string[];
  placeId?: string;
  lat: number;
  lng: number;
}

export interface HospitalRecommendation {
  condition: string;
  severity: Severity;
  recommendedSpecialist: string;
  bestMatch: Hospital;
  nearbyHospitals: Hospital[];
}

// ── AI Assistant ──────────────────────────────────────────────
export type SupportedLanguage =
  | 'en'
  | 'ta'
  | 'hi'
  | 'te'
  | 'kn'
  | 'ml'
  | 'mr'
  | 'bn';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  language: SupportedLanguage;
  isVoice?: boolean;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  prompt: string;
  action?: 'translate' | 'download' | 'navigate';
}

// ── User & Auth ───────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  healthId: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  allergies?: string[];
  conditions?: string[];
  language: SupportedLanguage;
  theme: 'light' | 'dark' | 'system';
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  isLoading: boolean;
}

// ── Health Tips ───────────────────────────────────────────────
export interface HealthTip {
  id: string;
  title: string;
  body: string;
  category: string;
  icon: string;
  color: string;
}

// ── Category Config ───────────────────────────────────────────
export interface CategoryConfig {
  id: MedicalCategory;
  label: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  supportedConditions: string[];
}

// ── Settings ──────────────────────────────────────────────────
export interface AppSettings {
  language: SupportedLanguage;
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  voiceEnabled: boolean;
  voiceAutoPlay: boolean;
  highContrast: boolean;
  fontSize: 'sm' | 'md' | 'lg';
}

// ── API Response Wrappers ─────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

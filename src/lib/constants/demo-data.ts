// ============================================================
// MediVision AI – Complete Demo / Mock Data
// Realistic, condition-specific data for Demo Mode & Phase 1
// ============================================================

import type {
  User, Report, Hospital, HospitalRecommendation,
  ChatMessage, HealthTip, CategoryConfig, QuickAction,
  LanguageOption, AITimelineStep,
} from '@/lib/types';

// ── Demo User ─────────────────────────────────────────────────
export const DEMO_USER: User = {
  id: 'demo-user-001',
  name: 'Arjun Sharma',
  email: 'arjun.sharma@demo.medivision.ai',
  healthId: 'MV-2026-00142',
  dateOfBirth: '1992-04-15',
  bloodGroup: 'O+',
  allergies: ['Penicillin', 'Dust Mites'],
  conditions: ['Mild Eczema (2024)'],
  language: 'en',
  theme: 'system',
  createdAt: '2026-01-10T08:30:00Z',
};

// ── Supported Languages ───────────────────────────────────────
export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
];

// ── Medical Categories ────────────────────────────────────────
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

// ── AI Processing Timeline ────────────────────────────────────
export const AI_TIMELINE_STEPS: AITimelineStep[] = [
  { id: 'uploaded', label: 'Image Uploaded', status: 'pending' },
  { id: 'quality_verified', label: 'Quality Verified', status: 'pending' },
  { id: 'ai_processing', label: 'AI Processing', status: 'pending' },
  { id: 'disease_detection', label: 'Disease Detection', status: 'pending' },
  { id: 'explainable_ai', label: 'Explainable AI', status: 'pending' },
  { id: 'report_generated', label: 'Report Generated', status: 'pending' },
  { id: 'hospital_recommendation', label: 'Hospital Recommendation', status: 'pending' },
];

// ── Mock Reports ──────────────────────────────────────────────
export const DEMO_REPORTS: Report[] = [
  {
    id: 'rpt-001',
    userId: 'demo-user-001',
    patientName: 'Arjun Sharma',
    date: '2026-07-20',
    category: 'skin',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80',
    status: 'completed',
    createdAt: '2026-07-20T10:15:00Z',
    updatedAt: '2026-07-20T10:17:30Z',
    prediction: {
      id: 'pred-001',
      category: 'skin',
      condition: 'Psoriasis',
      confidence: 0.94,
      confidenceTier: 'very_high',
      severity: 'moderate',
      affectedArea: 'Left Forearm — 12% of visible area',
      description:
        'Psoriasis is a chronic autoimmune skin condition characterized by the rapid buildup of skin cells, resulting in scaling on the skin surface.',
      aiExplanation:
        'The AI model identified hyperkeratotic plaques with silvery scales on an erythematous base, which is highly characteristic of plaque psoriasis. Grad-CAM visualization highlights the affected regions with greatest predictive weight.',
      recommendation:
        'Consult a Dermatologist for topical corticosteroids, vitamin D analogues, or phototherapy. Avoid skin trauma and manage stress.',
      suggestedSpecialist: 'Dermatologist',
      urgency: 'soon',
      similarConditions: [
        { name: 'Eczema', probability: 0.04 },
        { name: 'Seborrheic Dermatitis', probability: 0.02 },
      ],
      heatmapUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&q=80',
      originalImageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80',
      boundingBox: { x: 0.15, y: 0.2, width: 0.6, height: 0.55 },
      processedAt: '2026-07-20T10:17:00Z',
    },
  },
  {
    id: 'rpt-002',
    userId: 'demo-user-001',
    patientName: 'Arjun Sharma',
    date: '2026-07-15',
    category: 'eye',
    imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80',
    status: 'completed',
    createdAt: '2026-07-15T14:30:00Z',
    updatedAt: '2026-07-15T14:32:45Z',
    prediction: {
      id: 'pred-002',
      category: 'eye',
      condition: 'Mild Conjunctivitis',
      confidence: 0.89,
      confidenceTier: 'very_high',
      severity: 'mild',
      affectedArea: 'Conjunctival surface — bilateral',
      description:
        'Conjunctivitis (pink eye) is inflammation of the clear membrane covering the white part of the eye and inner surface of the eyelids.',
      aiExplanation:
        'The DenseNet model detected erythema and conjunctival injection patterns consistent with allergic conjunctivitis. Feature maps highlight periorbital redness and discharge characteristics.',
      recommendation:
        'Antihistamine eye drops, cold compresses, and avoiding allergens. See an Ophthalmologist if symptoms persist beyond 7 days.',
      suggestedSpecialist: 'Ophthalmologist',
      urgency: 'routine',
      similarConditions: [
        { name: 'Dry Eye Syndrome', probability: 0.07 },
        { name: 'Uveitis', probability: 0.04 },
      ],
      heatmapUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&q=80',
      originalImageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80',
      processedAt: '2026-07-15T14:32:00Z',
    },
  },
  {
    id: 'rpt-003',
    userId: 'demo-user-001',
    patientName: 'Arjun Sharma',
    date: '2026-07-08',
    category: 'chest',
    imageUrl: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f3?w=400&q=80',
    status: 'completed',
    createdAt: '2026-07-08T09:00:00Z',
    updatedAt: '2026-07-08T09:03:10Z',
    prediction: {
      id: 'pred-003',
      category: 'chest',
      condition: 'Normal',
      confidence: 0.97,
      confidenceTier: 'very_high',
      severity: 'mild',
      affectedArea: 'No abnormality detected',
      description:
        'The chest X-ray appears within normal limits. Lung fields are clear with no consolidation, effusion, or pneumothorax detected.',
      aiExplanation:
        'Vision Transformer analysis found no pathological patterns. Attention maps show uniform distribution across lung fields, consistent with a healthy respiratory system.',
      recommendation:
        'No immediate action required. Continue routine annual chest screening. Maintain a smoke-free lifestyle.',
      suggestedSpecialist: 'General Physician',
      urgency: 'routine',
      similarConditions: [
        { name: 'Mild Pulmonary Congestion', probability: 0.02 },
        { name: 'Early Pneumonia', probability: 0.01 },
      ],
      heatmapUrl: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f3?w=400&q=80',
      originalImageUrl: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f3?w=400&q=80',
      processedAt: '2026-07-08T09:02:30Z',
    },
  },
];

// ── Mock Hospitals ────────────────────────────────────────────
export const DEMO_HOSPITALS: Hospital[] = [
  {
    id: 'hosp-001',
    name: 'Apollo Hospitals',
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=80',
    rating: 4.8,
    reviewCount: 2847,
    distance: 1.8,
    travelTime: 7,
    isOpen: true,
    openHours: 'Open 24 hours',
    address: '21, Greams Lane, Thousand Lights, Chennai, Tamil Nadu 600006',
    phone: '+91 44 2829 3333',
    website: 'https://apollohospitals.com',
    services: ['Dermatology', 'Skin Biopsy', 'Pharmacy', 'Emergency Care', 'Pathology', 'Radiology'],
    specialists: ['Dermatologist', 'Oncologist', 'Ophthalmologist', 'Pulmonologist'],
    lat: 13.0609,
    lng: 80.2568,
  },
  {
    id: 'hosp-002',
    name: 'MIOT International',
    imageUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&q=80',
    rating: 4.6,
    reviewCount: 1923,
    distance: 3.2,
    travelTime: 12,
    isOpen: true,
    openHours: 'Open 24 hours',
    address: '4/112, Mount Poonamallee Road, Manapakkam, Chennai 600089',
    phone: '+91 44 4200 2288',
    services: ['Dermatology', 'Plastic Surgery', 'Pharmacy', 'Emergency Care', 'ICU'],
    specialists: ['Dermatologist', 'Plastic Surgeon', 'Burns Specialist'],
    lat: 13.0176,
    lng: 80.1708,
  },
  {
    id: 'hosp-003',
    name: 'Fortis Malar Hospital',
    imageUrl: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=400&q=80',
    rating: 4.5,
    reviewCount: 1456,
    distance: 4.7,
    travelTime: 18,
    isOpen: true,
    openHours: '8:00 AM – 10:00 PM',
    address: '52, 1st Main Road, Gandhi Nagar, Adyar, Chennai 600020',
    phone: '+91 44 4289 2222',
    services: ['Dermatology', 'Ophthalmology', 'Dental', 'Pharmacy', 'Pathology'],
    specialists: ['Dermatologist', 'Ophthalmologist', 'Dentist'],
    lat: 13.0002,
    lng: 80.2565,
  },
  {
    id: 'hosp-004',
    name: 'Kauvery Hospital',
    imageUrl: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&q=80',
    rating: 4.4,
    reviewCount: 987,
    distance: 6.1,
    travelTime: 22,
    isOpen: false,
    openHours: 'Opens at 8:00 AM',
    address: '199, Luz Church Road, Mylapore, Chennai 600004',
    phone: '+91 44 4000 6000',
    services: ['General Medicine', 'Dermatology', 'Pharmacy'],
    specialists: ['Dermatologist', 'General Physician'],
    lat: 13.0355,
    lng: 80.2685,
  },
];

export const DEMO_HOSPITAL_RECOMMENDATION: HospitalRecommendation = {
  condition: 'Moderate Psoriasis',
  severity: 'moderate',
  recommendedSpecialist: 'Dermatologist',
  bestMatch: DEMO_HOSPITALS[0],
  nearbyHospitals: DEMO_HOSPITALS.slice(1),
};

// ── Mock Chat Messages ────────────────────────────────────────
export const DEMO_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-001',
    role: 'assistant',
    content:
      "Hello! I'm MediVision AI Assistant. I can help you understand your screening results, answer health questions, and guide you to the right specialist. How can I help you today?",
    timestamp: new Date(Date.now() - 300000).toISOString(),
    language: 'en',
  },
  {
    id: 'msg-002',
    role: 'user',
    content: 'What is Psoriasis?',
    timestamp: new Date(Date.now() - 240000).toISOString(),
    language: 'en',
  },
  {
    id: 'msg-003',
    role: 'assistant',
    content:
      "**Psoriasis** is a chronic autoimmune skin condition that speeds up the life cycle of skin cells. Cells build up rapidly on the surface of the skin, forming scales and red patches that can be itchy and sometimes painful.\n\nKey facts:\n• **Type**: Autoimmune — not contagious\n• **Common areas**: Elbows, knees, scalp, lower back\n• **Triggers**: Stress, infections, certain medications, cold weather\n• **Treatment**: Topical treatments, phototherapy, systemic medications\n\nWould you like to know about treatment options or dietary advice for Psoriasis?",
    timestamp: new Date(Date.now() - 180000).toISOString(),
    language: 'en',
  },
];

// ── Quick Actions ─────────────────────────────────────────────
export const QUICK_ACTIONS: QuickAction[] = [
  { id: 'qa-1', label: 'Explain My Report', icon: '📋', prompt: 'Can you explain my latest screening report in simple terms?' },
  { id: 'qa-2', label: 'Nearby Hospitals', icon: '🏥', prompt: 'Show me highly rated hospitals near me for my condition.' },
  { id: 'qa-3', label: 'Diet Advice', icon: '🥗', prompt: 'What foods should I eat or avoid for my detected condition?' },
  { id: 'qa-4', label: 'Medicine Info', icon: '💊', prompt: 'What medicines are commonly prescribed for my condition?' },
  { id: 'qa-5', label: 'Emergency Signs', icon: '🚨', prompt: 'What symptoms require emergency medical attention for my condition?' },
  { id: 'qa-6', label: 'Translate Report', icon: '🌐', prompt: '', action: 'translate' },
  { id: 'qa-7', label: 'Download Report', icon: '⬇️', prompt: '', action: 'download' },
];

// ── Health Tips ───────────────────────────────────────────────
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

// ── AI Assistant Responses ───────────────────────────────────
export const DEMO_AI_RESPONSES: Record<string, string> = {
  greeting:
    "Hello! 👋 I am your **MediVision AI Health Assistant**. I can help explain your medical scan reports, answer health questions (e.g. about asthma, skin rashes, eye conditions), provide dietary tips, or direct you to nearby specialty hospitals.\n\nHow can I assist you today?",
  asthma:
    "**Asthma** is a chronic condition causing inflammation and narrowing of the bronchial airways.\n\n💡 **Key Clinical Management & Self-Care**:\n• **Keep your rescue inhaler (e.g. Salbutamol)** accessible at all times.\n• **Avoid common triggers**: Smoke, dust mites, strong perfumes, cold air, and animal dander.\n• **Use a spacer** with your inhaler for better drug delivery to the lungs.\n• **Stay updated on flu & pneumococcal vaccinations**.\n\n🚨 **Emergency Signs**: If you experience severe shortness of breath, chest tightness, blue lips/fingernails, or no relief from your inhaler, call 108 or go to the nearest emergency room immediately.",
  default:
    "I understand you are asking about your health. As your MediVision AI Assistant, I can help answer questions regarding respiratory health, skin conditions, eye care, dietary guidelines, or hospital recommendations.\n\nCould you specify your symptom or medical topic so I can provide targeted information?",
  psoriasis:
    "**Psoriasis** is a chronic autoimmune skin condition characterized by rapid skin cell buildup forming silvery scaly plaques. It is **not contagious**.\n\n• **Daily Care**: Apply thick, fragrance-free moisturizers immediately after bathing.\n• **Triggers to Avoid**: Stress, alcohol, skin injuries, cold dry weather.\n• **Treatments**: Topical corticosteroids, phototherapy, and systemic biologics.",
  diet:
    "🥗 **Nutritional & Dietary Guidelines**:\n\n✅ **Recommended**: Anti-inflammatory foods rich in Omega-3 (salmon, walnuts, flaxseeds), leafy greens, berries, turmeric, and high-fiber whole grains.\n❌ **Limit / Avoid**: Refined sugars, ultra-processed foods, alcohol, excessive red meat, and known personal food allergens.",
  hospital:
    "🏥 **Recommended Nearby Hospital**:\n**Apollo Hospitals** (Rating: 4.8★, 1.8 km away)\n• **Specialties**: Dermatology, Cardiology, Respiratory Medicine, Emergency Care\n• **Status**: Open 24 Hours\n\nWould you like me to open Google Maps directions or initiate a call?",
  emergency:
    "🚨 **Urgent Warning Signs**:\nSeek emergency medical care immediately if experiencing:\n• Sudden severe shortness of breath or inability to speak in sentences\n• Chest pain or pressure radiating to arm/jaw\n• Sudden facial numbness, slurred speech, or weakness\n• High fever with severe spreading rash or blistering\n\n**Emergency Helpline**: Call **108** or **112**.",
  thanks:
    "You're very welcome! 😊 I'm always here to assist you with your health and medical questions. Stay healthy!",
};

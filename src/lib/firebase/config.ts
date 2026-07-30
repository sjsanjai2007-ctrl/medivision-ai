// ============================================================
// MediVision AI – Firebase App Configuration
// ============================================================

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDemoFirebaseKeyPlaceholder12345',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'medivision-ai-demo.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'medivision-ai-demo',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'medivision-ai-demo.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789012:web:abcdef123456',
};

// Initialize Firebase once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firebase Auth & Providers
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;

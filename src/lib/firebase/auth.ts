// ============================================================
// MediVision AI – Firebase Auth Helpers
// Handles Email/Password & Google 1-Tap authentication
// ============================================================

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider } from './config';
import type { User } from '@/lib/types';

/** Converts a FirebaseUser instance into MediVision AI User shape */
export function mapFirebaseUser(fbUser: FirebaseUser): User {
  return {
    id: fbUser.uid,
    name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
    email: fbUser.email || '',
    avatar: fbUser.photoURL || undefined,
    healthId: `MV-2026-${fbUser.uid.slice(0, 5).toUpperCase()}`,
    language: 'en',
    theme: 'light',
    createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
  };
}

/** Register a new user with Email and Password */
export async function signUpWithEmail(name: string, email: string, pass: string): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, pass);
  if (name && credential.user) {
    await updateProfile(credential.user, { displayName: name });
  }
  return mapFirebaseUser(credential.user);
}

/** Sign in an existing user with Email and Password */
export async function signInWithEmail(email: string, pass: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, pass);
  return mapFirebaseUser(credential.user);
}

/** Sign in / Register using Google OAuth Popup */
export async function signInWithGoogle(): Promise<User> {
  const credential = await signInWithPopup(auth, googleProvider);
  return mapFirebaseUser(credential.user);
}

/** Sign out current user from Firebase */
export async function logOutFirebase(): Promise<void> {
  await signOut(auth);
}

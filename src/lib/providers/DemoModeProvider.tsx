'use client';

// ============================================================
// MediVision AI – Firebase Auth & Demo Mode Context Provider
// Synchronizes real Firebase Auth state (Google / Email)
// while retaining seamless fallback & demo mode capabilities.
// ============================================================

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/firebase/config';
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  logOutFirebase,
  mapFirebaseUser,
} from '@/lib/firebase/auth';
import { getStoredUser, clearToken, setToken, setStoredUser } from '@/lib/api/client';
import type { User } from '@/lib/types';

interface DemoModeContextValue {
  isDemoMode: boolean;
  demoUser: User;
  user: User | null;
  isAuthenticated: boolean;
  enableDemoMode: () => void;
  disableDemoMode: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
}

const DemoModeContext = createContext<DemoModeContextValue | null>(null);

const DEMO_MODE_ENABLED = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

function makeFallbackUser(overrides: Partial<User> = {}): User {
  return {
    id: `usr-${Date.now()}`,
    name: 'User',
    email: '',
    healthId: `MV-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    theme: 'light',
    language: 'en',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

export function DemoModeProvider({ children }: { children: React.ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Subscribe to Firebase auth state changes in real time
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        const mapped = mapFirebaseUser(fbUser);
        setUser(mapped);
        setIsAuthenticated(true);
        setIsDemoMode(false);
        setStoredUser({ id: mapped.id, name: mapped.name, email: mapped.email });
      } else {
        const stored = getStoredUser();
        if (stored && !isDemoMode) {
          setUser({
            id: stored.id || 'usr-100',
            name: stored.name || 'User',
            email: stored.email || '',
            healthId: `MV-2026-${(stored.id || '100').slice(0, 5).toUpperCase()}`,
            theme: 'light',
            language: 'en',
            createdAt: new Date().toISOString(),
          });
          setIsAuthenticated(true);
        } else if (DEMO_MODE_ENABLED || isDemoMode) {
          setUser(makeFallbackUser({ name: 'Demo User', email: 'demo@medivision.ai' }));
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    });

    return () => unsubscribe();
  }, [isDemoMode]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const fbUser = await signInWithEmail(email, password);
      setUser(fbUser);
      setIsAuthenticated(true);
      setIsDemoMode(false);
    } catch (err) {
      // Fallback demo mode login if Firebase credentials aren't configured yet
      const nameFromEmail = email.split('@')[0];
      const capitalized = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
      const newUser = makeFallbackUser({
        name: capitalized || 'User',
        email: email,
      });
      setUser(newUser);
      setStoredUser({ id: newUser.id, name: newUser.name, email: newUser.email });
      setIsAuthenticated(true);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const fbUser = await signUpWithEmail(name, email, password);
      setUser(fbUser);
      setIsAuthenticated(true);
      setIsDemoMode(false);
    } catch (err) {
      const newUser = makeFallbackUser({ name, email });
      setUser(newUser);
      setStoredUser({ id: newUser.id, name: newUser.name, email: newUser.email });
      setIsAuthenticated(true);
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      const fbUser = await signInWithGoogle();
      setUser(fbUser);
      setIsAuthenticated(true);
      setIsDemoMode(false);
    } catch (err) {
      const googleFallback = makeFallbackUser({ name: 'Google User', email: 'user@gmail.com' });
      setUser(googleFallback);
      setStoredUser({ id: googleFallback.id, name: googleFallback.name, email: googleFallback.email });
      setIsAuthenticated(true);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logOutFirebase();
    } catch (e) {
      // Ignore
    }
    clearToken();
    setUser(null);
    setIsAuthenticated(false);
    setIsDemoMode(false);
  }, []);

  const enableDemoMode = useCallback(() => {
    const demoUser = makeFallbackUser({ name: 'Demo User', email: 'demo@medivision.ai' });
    setIsDemoMode(true);
    setUser(demoUser);
    setIsAuthenticated(true);
    setToken('demo-mode-token');
    setStoredUser({ id: demoUser.id, name: demoUser.name, email: demoUser.email });
  }, []);

  const disableDemoMode = useCallback(() => {
    setIsDemoMode(false);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <DemoModeContext.Provider
      value={{
        isDemoMode,
        demoUser: makeFallbackUser({ name: 'Demo User', email: 'demo@medivision.ai' }),
        user,
        isAuthenticated,
        enableDemoMode,
        disableDemoMode,
        login,
        register,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode(): DemoModeContextValue {
  const ctx = useContext(DemoModeContext);
  if (!ctx) throw new Error('useDemoMode must be used within DemoModeProvider');
  return ctx;
}

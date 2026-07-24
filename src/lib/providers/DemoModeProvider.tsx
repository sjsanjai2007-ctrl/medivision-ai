'use client';

// ============================================================
// MediVision AI – Demo Mode Provider (Phase 3 Enhanced)
// Now also manages JWT auth state alongside demo mode.
// ============================================================

import React, { createContext, useContext, useState, useCallback } from 'react';
import { DEMO_USER } from '@/lib/constants/demo-data';
import { getStoredUser, clearToken, setToken, setStoredUser } from '@/lib/api/client';
import { loginApi, registerApi } from '@/lib/api/auth';
import type { User } from '@/lib/types';

interface DemoModeContextValue {
  isDemoMode: boolean;
  demoUser: User;
  isAuthenticated: boolean;
  enableDemoMode: () => void;
  disableDemoMode: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const DemoModeContext = createContext<DemoModeContextValue | null>(null);

const DEMO_MODE_ENABLED = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export function DemoModeProvider({ children }: { children: React.ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(DEMO_MODE_ENABLED);
  // In demo mode we are always "authenticated" as the demo user.
  // In real mode, restore session from localStorage synchronously (lazy initializer).
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (DEMO_MODE_ENABLED) return true;
    return Boolean(getStoredUser());
  });

  const login = useCallback(async (email: string, password: string) => {
    if (isDemoMode) {
      // Demo mode: skip real API call
      setIsAuthenticated(true);
      return;
    }
    await loginApi(email, password);
    setIsAuthenticated(true);
  }, [isDemoMode]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    if (isDemoMode) {
      setIsAuthenticated(true);
      return;
    }
    await registerApi(name, email, password);
    setIsAuthenticated(true);
  }, [isDemoMode]);

  const logout = useCallback(() => {
    clearToken();
    setIsAuthenticated(false);
  }, []);

  // Expose a no-op setToken/setStoredUser for demo login (keeps token shape consistent)
  const enableDemoMode = useCallback(() => {
    setIsDemoMode(true);
    setIsAuthenticated(true);
    // Give demo mode a fake token so API client headers don't break
    setToken('demo-mode-token');
    setStoredUser({ id: DEMO_USER.id, name: DEMO_USER.name, email: DEMO_USER.email });
  }, []);

  const disableDemoMode = useCallback(() => {
    setIsDemoMode(false);
  }, []);

  return (
    <DemoModeContext.Provider
      value={{
        isDemoMode,
        demoUser: DEMO_USER,
        isAuthenticated,
        enableDemoMode,
        disableDemoMode,
        login,
        register,
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

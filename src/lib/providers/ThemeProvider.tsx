'use client';

// ============================================================
// MediVision AI – Theme Provider (Enforced Light Theme)
// ============================================================

import React, { createContext, useContext, useEffect } from 'react';

type Theme = 'light';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
    root.setAttribute('data-theme', 'light');
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme: 'light',
        resolvedTheme: 'light',
        setTheme: () => {},
        toggleTheme: () => {},
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

'use client';

// ============================================================
// MediVision AI – Root Providers Wrapper
// Composes all app-level providers in correct order
// ============================================================

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './ThemeProvider';
import { DemoModeProvider } from './DemoModeProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <DemoModeProvider>
          {children}
        </DemoModeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

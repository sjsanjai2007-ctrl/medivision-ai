'use client';

// ============================================================
// MediVision AI – Navigation Provider
// Provides navigateTo() — navigates immediately so there is
// no gap between exit and enter (no home-page flash).
// The visual transition is handled by PageTransition (Framer).
// ============================================================

import React, { createContext, useContext, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface NavContextValue {
  navigateTo: (href: string) => void;
}

const NavContext = createContext<NavContextValue>({
  navigateTo: () => {},
});

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // Navigate immediately — AnimatePresence mode="popLayout" handles
  // overlapping enter/exit animations without any manual delay.
  const navigateTo = useCallback(
    (href: string) => {
      router.push(href);
    },
    [router],
  );

  return (
    <NavContext.Provider value={{ navigateTo }}>
      {children}
    </NavContext.Provider>
  );
}

export function useNavigation() {
  return useContext(NavContext);
}

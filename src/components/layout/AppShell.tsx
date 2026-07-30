'use client';

// ============================================================
// MediVision AI – App Shell
// Rendered ONCE in layout.tsx — never remounts on navigation.
// This keeps Header + BottomNav stable so the liquid indicator
// never flashes.
// Auth pages (/login, /register) render without Header/Nav.
// ============================================================

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import BottomNav from './BottomNav';
import PageTransition from './PageTransition';

// Pages that should NOT show the app shell chrome (nav + header)
const AUTH_PATHS = ['/login', '/register'];

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isAuthPage = pathname ? AUTH_PATHS.some((p) => pathname.startsWith(p)) : false;

  // Auth pages: render children directly, no chrome
  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="page-container flex flex-col min-h-dvh">
      {/* Sticky top header */}
      <Header />

      {/* Main content — bottom padding clears the fixed bottom nav */}
      <main
        id="main-content"
        className="flex-1 flex flex-col content-area"
        tabIndex={-1}
      >
        <PageTransition>
          {children}
        </PageTransition>
      </main>

      {/* Floating Liquid Glass Bottom Nav */}
      <BottomNav />
    </div>
  );
}

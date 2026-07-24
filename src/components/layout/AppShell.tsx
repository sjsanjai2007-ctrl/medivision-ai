// ============================================================
// MediVision AI – App Shell
// Liquid Glass top nav + page content
// ============================================================

import React from 'react';
import Header from './Header';
import BottomNav from './BottomNav';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="page-container flex flex-col min-h-dvh">
      {/* Top Header */}
      <Header />

      {/* Main Page Content */}
      <main
        id="main-content"
        className="flex-1 content-area pb-20"
        tabIndex={-1}
      >
        {children}
      </main>

      {/* Floating Liquid Glass Bottom Nav */}
      <BottomNav />
    </div>
  );
}

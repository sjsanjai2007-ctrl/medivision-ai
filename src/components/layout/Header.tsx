'use client';

// ============================================================
// MediVision AI – Top Header Bar
// ============================================================

import React from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bell, Activity, User, LogIn } from 'lucide-react';
import { useDemoMode } from '@/lib/providers/DemoModeProvider';
import Link from 'next/link';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Home',
  '/scan': 'AI Scan',
  '/reports': 'My Reports',
  '/assistant': 'AI Assistant',
  '/hospitals': 'Nearby Hospitals',
  '/profile': 'Profile',
  '/settings': 'Settings',
};

export default function Header() {
  const pathname = usePathname();
  const { user } = useDemoMode();

  const title = (pathname && PAGE_TITLES[pathname]) ?? 'MediVision AI';

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-4 h-16 lg:px-6"
      style={{
        background: 'var(--glass-bg-strong)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {/* Left – Logo (mobile) + Page Title */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)', boxShadow: '0 2px 8px rgba(14,165,233,0.4)' }}
          >
            <Activity className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
        </Link>
        <motion.h1
          key={title}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-lg font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </motion.h1>
      </div>

      {/* Right – Actions & User Avatar */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button
          className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
          style={{ background: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: 'var(--primary)', boxShadow: '0 0 6px rgba(14,165,233,0.6)' }}
          />
        </button>

        {/* User Account / Profile */}
        {user ? (
          <Link
            href="/profile"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all hover:bg-[var(--border-subtle)]"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)' }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-semibold hidden md:inline-block max-w-[100px] truncate" style={{ color: 'var(--text-primary)' }}>
              {user.name.split(' ')[0]}
            </span>
          </Link>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-sky-600 bg-sky-50 dark:bg-sky-950/40 dark:text-sky-400 hover:bg-sky-100 transition-all"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
}

'use client';

// ============================================================
// MediVision AI – Desktop Sidebar Navigation
// ============================================================

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Home, ScanLine, FileText, Bot, MapPin,
  User, Settings, Activity, Shield,
} from 'lucide-react';
import { useDemoMode } from '@/lib/providers/DemoModeProvider';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/scan', label: 'Scan', icon: ScanLine },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/assistant', label: 'AI Assistant', icon: Bot },
  { path: '/hospitals', label: 'Hospitals', icon: MapPin },
  { path: '/profile', label: 'Profile', icon: User },
  { path: '/settings', label: 'Settings', icon: Settings },
] as const;

export default function Sidebar() {
  const pathname = usePathname();
  const { isDemoMode } = useDemoMode();

  return (
    <aside
      className="sidebar hidden md:flex fixed left-0 top-0 h-full w-[260px] z-50 flex-col"
      style={{
        background: 'var(--glass-bg-strong)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderRight: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-lg)',
      }}
      role="navigation"
      aria-label="Sidebar navigation"
    >
      {/* Logo */}
      <div className="px-6 py-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)', boxShadow: '0 4px 16px rgba(14,165,233,0.4)' }}>
            <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-bold text-base leading-tight" style={{ color: 'var(--text-primary)' }}>
              MediVision
            </p>
            <p className="text-xs font-medium" style={{ color: 'var(--primary)' }}>AI Platform</p>
          </div>
        </Link>
        {isDemoMode && (
          <div className="demo-badge mt-3">
            <span>⚡</span> Demo Mode
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <Link key={item.path} href={item.path}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group',
                  isActive
                    ? 'text-white'
                    : 'hover:bg-[var(--border-subtle)]'
                )}
                style={isActive ? {
                  background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
                  boxShadow: '0 4px 16px rgba(14,165,233,0.35)',
                  color: 'white',
                } : { color: 'var(--text-secondary)' }}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                <span className={cn('text-sm font-medium', isActive ? 'text-white' : 'group-hover:text-[var(--text-primary)]')}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-80" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom disclaimer */}
      <div className="px-4 py-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-start gap-2 p-3 rounded-xl"
          style={{ background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.15)' }}>
          <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            AI-assisted screening only. Not a medical diagnosis. Consult a qualified professional.
          </p>
        </div>
      </div>
    </aside>
  );
}

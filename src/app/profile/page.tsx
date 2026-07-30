'use client';

// ============================================================
// MediVision AI – Profile Page (Dynamic Auth & User Profile)
// ============================================================

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  User, Droplets, AlertTriangle, Calendar,
  Shield, ChevronRight, Edit3, LogIn, LogOut, UserPlus,
} from 'lucide-react';
import { useDemoMode } from '@/lib/providers/DemoModeProvider';
import SeverityBadge from '@/components/shared/SeverityBadge';
import { formatDate, timeAgo } from '@/lib/utils';

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useDemoMode();

  const currentUser = user;

  const stats = [
    { label: 'Total Scans', value: '--', icon: '🔬' },
    { label: 'Health Score', value: currentUser ? '87' : '--', icon: '💚', unit: currentUser ? '/100' : '' },
    { label: 'Member Since', value: currentUser ? 'Jan 2026' : '--', icon: '📅' },
  ];

  return (
    <>
      <div className="page-wrap space-y-5">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl p-6 overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#0ea5e9,#06b6d4)', boxShadow: '0 8px 32px rgba(14,165,233,0.35)' }}
        >
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
            style={{ background: 'white', transform: 'translate(30%,-30%)' }} />
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/30"
                style={{ background: 'rgba(255,255,255,0.2)' }}>
                <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>
              </div>
              {currentUser && (
                <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center"
                  aria-label="Edit profile photo">
                  <Edit3 className="w-3 h-3 text-sky-600" />
                </button>
              )}
            </div>

            <div className="flex-1 min-w-0">
              {currentUser ? (
                <>
                  <h1 className="text-white font-extrabold text-xl truncate">{currentUser.name}</h1>
                  <p className="text-sky-100 text-sm truncate">{currentUser.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold flex items-center gap-1">
                      <Shield className="w-3 h-3" /> {currentUser.healthId}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="text-white font-extrabold text-xl">Guest User</h1>
                  <p className="text-sky-100 text-sm">Sign in to view your personal health profile</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Link
                      href="/login"
                      className="px-3.5 py-1.5 rounded-xl bg-white text-sky-950 text-xs font-bold flex items-center gap-1.5 shadow"
                    >
                      <LogIn className="w-3.5 h-3.5" /> Log In
                    </Link>
                    <Link
                      href="/register"
                      className="px-3.5 py-1.5 rounded-xl bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 border border-white/30"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Register
                    </Link>
                  </div>
                </>
              )}
            </div>

            {currentUser && (
              <button
                onClick={logout}
                className="p-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white transition-colors"
                title="Log Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Stats row */}
          <div className="relative z-10 grid grid-cols-3 gap-3 mt-5">
            {stats.map((s) => (
              <div key={s.label} className="text-center rounded-2xl py-3"
                style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
                <p className="text-xl">{s.icon}</p>
                <p className="text-white font-extrabold text-lg leading-tight">
                  {s.value}{s.unit && <span className="text-xs text-sky-200">{s.unit}</span>}
                </p>
                <p className="text-sky-100 text-[10px]">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Medical Info */}
        <div className="rounded-2xl p-4 space-y-3"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Medical Information</p>
          {[
            { icon: <Droplets className="w-4 h-4 text-red-500" />, label: 'Blood Group', value: currentUser?.bloodGroup ?? 'O+' },
            { icon: <Calendar className="w-4 h-4 text-sky-500" />, label: 'Date of Birth', value: currentUser?.dateOfBirth ? formatDate(currentUser.dateOfBirth) : '15 Aug 1994' },
            { icon: <AlertTriangle className="w-4 h-4 text-amber-500" />, label: 'Allergies', value: currentUser?.allergies?.join(', ') ?? 'Penicillin' },
            { icon: <User className="w-4 h-4 text-violet-500" />, label: 'Known Conditions', value: currentUser?.conditions?.join(', ') ?? 'Mild Asthma' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 py-2 border-b last:border-0" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--border-subtle)' }}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Reports */}
        <div className="rounded-2xl p-4"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Recent Scans</p>
            <Link href="/reports" className="text-xs font-semibold flex items-center gap-0.5" style={{ color: 'var(--primary)' }}>
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex items-center justify-between py-3" style={{ color: 'var(--text-muted)' }}>
            <span className="text-sm">Your scan history will appear here.</span>
            <Link href="/reports" className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>View all →</Link>
          </div>
        </div>

        {/* Quick links */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          {[
            { href: '/settings', icon: '⚙️', label: 'Settings', desc: 'Language, theme, notifications' },
            { href: '/assistant', icon: '🤖', label: 'AI Assistant', desc: 'Ask health questions' },
            { href: '/reports', icon: '📋', label: 'All Reports', desc: 'View your scan history' },
          ].map((item, idx, arr) => (
            <Link key={item.href} href={item.href}>
              <div className={`flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--border-subtle)] transition-colors ${idx < arr.length - 1 ? 'border-b' : ''}`}
                style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="text-xl">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

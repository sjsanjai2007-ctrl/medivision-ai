'use client';

// ============================================================
// MediVision AI – Profile Page
// ============================================================

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  User, Droplets, AlertTriangle, Calendar,
  Shield, ChevronRight, Edit3,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { useDemoMode } from '@/lib/providers/DemoModeProvider';
import { DEMO_REPORTS } from '@/lib/constants/demo-data';
import SeverityBadge from '@/components/shared/SeverityBadge';
import { formatDate, timeAgo } from '@/lib/utils';

export default function ProfilePage() {
  const { demoUser } = useDemoMode();

  const stats = [
    { label: 'Total Scans', value: DEMO_REPORTS.length, icon: '🔬' },
    { label: 'Health Score', value: '87', icon: '💚', unit: '/100' },
    { label: 'Member Since', value: 'Jan 2026', icon: '📅' },
  ];

  return (
    <AppShell>
      <div className="px-4 py-5 max-w-2xl mx-auto lg:max-w-3xl lg:py-8 space-y-5">
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
              <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center"
                aria-label="Edit profile photo">
                <Edit3 className="w-3 h-3 text-sky-600" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-white font-extrabold text-xl">{demoUser.name}</h1>
              <p className="text-sky-100 text-sm">{demoUser.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold flex items-center gap-1">
                  <Shield className="w-3 h-3" /> {demoUser.healthId}
                </div>
              </div>
            </div>
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
            { icon: <Droplets className="w-4 h-4 text-red-500" />, label: 'Blood Group', value: demoUser.bloodGroup ?? 'Unknown' },
            { icon: <Calendar className="w-4 h-4 text-sky-500" />, label: 'Date of Birth', value: demoUser.dateOfBirth ? formatDate(demoUser.dateOfBirth) : 'Unknown' },
            { icon: <AlertTriangle className="w-4 h-4 text-amber-500" />, label: 'Allergies', value: demoUser.allergies?.join(', ') ?? 'None' },
            { icon: <User className="w-4 h-4 text-violet-500" />, label: 'Known Conditions', value: demoUser.conditions?.join(', ') ?? 'None' },
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
          <div className="space-y-2">
            {DEMO_REPORTS.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-2 py-2 border-b last:border-0"
                style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                    style={{ background: 'var(--border-subtle)' }}>🔬</div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{r.prediction.condition}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{timeAgo(r.createdAt)}</p>
                  </div>
                </div>
                <SeverityBadge severity={r.prediction.severity} size="sm" showDot={false} />
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          {[
            { href: '/settings', icon: '⚙️', label: 'Settings', desc: 'Language, theme, notifications' },
            { href: '/assistant', icon: '🤖', label: 'AI Assistant', desc: 'Ask health questions' },
            { href: '/reports', icon: '📋', label: 'All Reports', desc: `${DEMO_REPORTS.length} reports available` },
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
    </AppShell>
  );
}

'use client';

// ============================================================
// MediVision AI – Settings Page
// ============================================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Globe, Bell, Mic, Shield, Info,
  ChevronRight, Check, Activity,
} from 'lucide-react';
import { useTheme } from '@/lib/providers/ThemeProvider';
import { SUPPORTED_LANGUAGES } from '@/lib/constants/demo-data';
import type { SupportedLanguage } from '@/lib/types';

interface ToggleProps {
  enabled: boolean;
  onToggle: () => void;
  label: string;
}
function Toggle({ enabled, onToggle, label }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={onToggle}
      className="relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0"
      style={{ background: enabled ? 'var(--primary)' : 'var(--border-default)' }}
    >
      <motion.div
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
        animate={{ left: enabled ? '22px' : '2px' }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

interface SettingRowProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  description?: string;
  right?: React.ReactNode;
  onClick?: () => void;
}
function SettingRow({ icon, iconBg, label, description, right, onClick }: SettingRowProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-[var(--border-subtle)] transition-colors text-left"
      disabled={!onClick && !right}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</p>
        {description && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{description}</p>}
      </div>
      {right ?? (onClick ? <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} /> : null)}
    </button>
  );
}

export default function SettingsPage() {
  useTheme();
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [notifications, setNotifications] = useState(true);
  const [voice, setVoice] = useState(true);
  const [voiceAutoPlay, setVoiceAutoPlay] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);

  const selectedLang = SUPPORTED_LANGUAGES.find((l) => l.code === language)!;

  const sections = [
    {
      title: 'Appearance',
      rows: [
        {
          icon: <Shield className="w-4 h-4 text-sky-400" />,
          iconBg: 'rgba(14,165,233,0.15)',
          label: 'High Contrast',
          description: 'Improved accessibility',
          right: <Toggle enabled={highContrast} onToggle={() => setHighContrast(!highContrast)} label="Toggle high contrast" />,
        },
      ],
    },
    {
      title: 'Language & Voice',
      rows: [
        {
          icon: <Globe className="w-4 h-4 text-emerald-400" />,
          iconBg: 'rgba(16,185,129,0.15)',
          label: 'Language',
          description: `${selectedLang.flag} ${selectedLang.name} – ${selectedLang.nativeName}`,
          onClick: () => setShowLangModal(true),
        },
        {
          icon: <Mic className="w-4 h-4 text-rose-400" />,
          iconBg: 'rgba(244,63,94,0.15)',
          label: 'Voice Input',
          description: 'Enable microphone for voice commands',
          right: <Toggle enabled={voice} onToggle={() => setVoice(!voice)} label="Toggle voice input" />,
        },
        {
          icon: <Mic className="w-4 h-4 text-purple-400" />,
          iconBg: 'rgba(167,139,250,0.15)',
          label: 'Auto-play Voice Response',
          description: 'AI reads responses aloud automatically',
          right: <Toggle enabled={voiceAutoPlay} onToggle={() => setVoiceAutoPlay(!voiceAutoPlay)} label="Toggle voice auto-play" />,
        },
      ],
    },
    {
      title: 'Notifications',
      rows: [
        {
          icon: <Bell className="w-4 h-4 text-amber-400" />,
          iconBg: 'rgba(245,158,11,0.15)',
          label: 'Push Notifications',
          description: 'Report ready, health tips',
          right: <Toggle enabled={notifications} onToggle={() => setNotifications(!notifications)} label="Toggle notifications" />,
        },
      ],
    },
    {
      title: 'About',
      rows: [
        {
          icon: <Activity className="w-4 h-4 text-sky-400" />,
          iconBg: 'rgba(14,165,233,0.15)',
          label: 'MediVision AI',
          description: 'Version 1.0.0 · SIH 2026',
          onClick: undefined,
        },
        {
          icon: <Shield className="w-4 h-4 text-emerald-400" />,
          iconBg: 'rgba(16,185,129,0.15)',
          label: 'Privacy Policy',
          description: 'How we handle your data',
          onClick: () => alert('Privacy policy coming soon'),
        },
        {
          icon: <Info className="w-4 h-4 text-violet-400" />,
          iconBg: 'rgba(124,58,237,0.15)',
          label: 'Medical Disclaimer',
          description: 'AI-assisted screening, not diagnosis',
          onClick: () => alert('MediVision AI provides AI-assisted clinical screening for informational purposes only. Not a substitute for professional medical advice.'),
        },
      ],
    },
  ];

  return (
    <>
      <div className="page-wrap space-y-5">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h1>

        {sections.map((section, sIdx) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sIdx * 0.08 }}
          >
            <p className="text-xs font-bold uppercase tracking-wider mb-2 px-1" style={{ color: 'var(--text-muted)' }}>
              {section.title}
            </p>
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              {section.rows.map((row, rIdx) => (
                <div key={row.label} className={rIdx < section.rows.length - 1 ? 'border-b' : ''} style={{ borderColor: 'var(--border-subtle)' }}>
                  <SettingRow {...row} />
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Demo mode notice */}
        <div className="p-4 rounded-2xl text-center"
          style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <p className="text-sm font-semibold" style={{ color: '#d97706' }}>⚡ Demo Mode Active</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            All AI features use realistic mock data. Enable <code className="px-1 rounded bg-amber-50 text-amber-700 text-[11px]">NEXT_PUBLIC_DEMO_MODE=false</code> for live API.
          </p>
        </div>
      </div>

      {/* Language Modal */}
      {showLangModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={() => setShowLangModal(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 w-full max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Select Language</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {SUPPORTED_LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { setLanguage(l.code); setShowLangModal(false); }}
                  className="flex items-center justify-between w-full px-5 py-3.5 hover:bg-[var(--border-subtle)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{l.flag}</span>
                    <div className="text-left">
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{l.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{l.nativeName}</p>
                    </div>
                  </div>
                  {l.code === language && <Check className="w-4 h-4" style={{ color: 'var(--primary)' }} />}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

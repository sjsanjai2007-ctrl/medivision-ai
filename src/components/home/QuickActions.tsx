'use client';

// ============================================================
// MediVision AI – Quick Scan Button & Emergency Button
// ============================================================

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ScanLine, Bot, Phone } from 'lucide-react';

export function QuickScanButton() {
  return (
    <Link href="/scan">
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="relative overflow-hidden rounded-2xl p-5 cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
          boxShadow: '0 6px 24px rgba(14,165,233,0.35)',
        }}
      >
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
          }}
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
        />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <ScanLine className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <div>
            <p className="text-white font-bold text-base">Start AI Scan</p>
            <p className="text-sky-100 text-sm">Upload a medical image</p>
          </div>
          <div className="ml-auto text-white/60">›</div>
        </div>
      </motion.div>
    </Link>
  );
}

export function AIAssistantShortcut() {
  return (
    <Link href="/assistant">
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="relative overflow-hidden rounded-2xl p-5 cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
          boxShadow: '0 6px 24px rgba(124,58,237,0.35)',
        }}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-base">AI Assistant</p>
            <p className="text-purple-200 text-sm">Ask health questions</p>
          </div>
          <div className="ml-auto text-white/60">›</div>
        </div>
      </motion.div>
    </Link>
  );
}

export function EmergencyButton() {
  return (
    <motion.a
      href="tel:108"
      className="emergency-btn"
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.92 }}
      aria-label="Emergency: Call 108"
      title="Emergency: Call 108"
    >
      <div className="relative">
        <Phone className="w-5 h-5" />
        {/* Pulse rings */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-red-400"
          animate={{ scale: [1, 1.8], opacity: [0.7, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-red-400"
          animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
        />
      </div>
    </motion.a>
  );
}

'use client';

// ============================================================
// MediVision AI – Welcome Card (Home Page)
// ============================================================

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp } from 'lucide-react';
import { useDemoMode } from '@/lib/providers/DemoModeProvider';
import { formatDate } from '@/lib/utils';

export default function WelcomeCard() {
  const { demoUser } = useDemoMode();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const firstName = demoUser.name.split(' ')[0];
  const today = formatDate(new Date().toISOString());

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl p-6"
      style={{
        background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 40%, #06b6d4 100%)',
        boxShadow: '0 8px 32px rgba(14,165,233,0.4)',
      }}
    >
      {/* Background decorative circles */}
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
        style={{ background: 'white', transform: 'translate(30%, -30%)' }} aria-hidden="true" />
      <div className="absolute bottom-0 right-12 w-32 h-32 rounded-full opacity-10"
        style={{ background: 'white', transform: 'translateY(40%)' }} aria-hidden="true" />

      <div className="relative z-10 flex flex-wrap sm:flex-nowrap items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sky-100 text-sm font-medium mb-1">{today}</p>
          <h2 className="text-white text-2xl font-bold mb-1 leading-tight">
            {greeting},<br />{firstName}! 👋
          </h2>
          <p className="text-sky-100 text-sm leading-relaxed mt-2">
            Your health dashboard is ready. Start a scan or check your reports.
          </p>

          <div className="flex items-center gap-2 mt-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.2)' }}>
              <Activity className="w-3.5 h-3.5 text-white" />
              <span className="text-white text-xs font-semibold">Health ID: {demoUser.healthId}</span>
            </div>
          </div>
        </div>

        {/* Health Score Ring */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80" aria-label="Health score 87%">
              <circle cx="40" cy="40" r="34" stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="none" />
              <motion.circle
                cx="40" cy="40" r="34"
                stroke="white"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 34}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - 0.87) }}
                transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-white font-extrabold text-lg leading-none">87</span>
              <span className="text-sky-100 text-xs">Score</span>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-emerald-300" />
            <span className="text-emerald-300 text-xs font-semibold">+3 pts</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

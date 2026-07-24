'use client';

// ============================================================
// MediVision AI – Health Tips Carousel (Home Page)
// ============================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HEALTH_TIPS } from '@/lib/constants/demo-data';

const GRADIENTS: Record<string, string> = {
  'from-amber-400 to-orange-500': 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
  'from-sky-400 to-blue-500': 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
  'from-cyan-400 to-teal-500': 'linear-gradient(135deg, #06b6d4 0%, #0d9488 100%)',
  'from-violet-400 to-purple-500': 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  'from-emerald-400 to-green-500': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
};

export default function HealthTips() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const prev = () => {
    setDirection(-1);
    setCurrent((c) => (c - 1 + HEALTH_TIPS.length) % HEALTH_TIPS.length);
  };
  const next = React.useCallback(() => {
    setDirection(1);
    setCurrent((c) => (c + 1) % HEALTH_TIPS.length);
  }, []);

  // Auto-scroll every 10 seconds (10,000 ms)
  React.useEffect(() => {
    const timer = setInterval(() => {
      next();
    }, 10000);
    return () => clearInterval(timer);
  }, [next, current]);

  const tip = HEALTH_TIPS[current];
  const bgGradient = GRADIENTS[tip.color] || 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)';

  return (
    <section aria-labelledby="health-tips-title">
      <div className="flex items-center justify-between mb-3">
        <h2 id="health-tips-title" className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
          Health Tips
        </h2>
        <div className="flex gap-1">
          <button onClick={prev} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'var(--border-subtle)', color: 'var(--text-secondary)' }} aria-label="Previous tip">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={next} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'var(--border-subtle)', color: 'var(--text-secondary)' }} aria-label="Next tip">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl" style={{ minHeight: 120 }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={tip.id}
            custom={direction}
            variants={{
              enter: (d: number) => ({ x: d * 60, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (d: number) => ({ x: -d * 60, opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="p-5 rounded-2xl"
            style={{
              background: bgGradient,
              boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
            }}
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl" role="img" aria-label={tip.category}>{tip.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white/90 uppercase tracking-wider mb-1">{tip.category}</p>
                <p className="text-white font-extrabold text-base mb-1">{tip.title}</p>
                <p className="text-white/95 text-sm leading-relaxed">{tip.body}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 mt-3" role="tablist" aria-label="Health tips pagination">
        {HEALTH_TIPS.map((_, i) => (
          <button
            key={i}
            onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === current ? 20 : 6,
              height: 6,
              background: i === current ? 'var(--primary)' : 'var(--border-default)',
            }}
            aria-label={`Tip ${i + 1}`}
            aria-selected={i === current}
            role="tab"
          />
        ))}
      </div>
    </section>
  );
}

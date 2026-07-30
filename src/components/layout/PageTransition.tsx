'use client';

// ============================================================
// MediVision AI – Page Transition Wrapper
// key={pathname} forces React to create a NEW element on every
// route change, so the enter animation ALWAYS plays for the
// full 0.5s — no AnimatePresence interruption issues.
// ============================================================

import React from 'react';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}                    // new element on every route change
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      {children}
    </motion.div>
  );
}

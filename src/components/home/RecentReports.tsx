'use client';

// ============================================================
// MediVision AI – Recent Reports (Home Page)
// ============================================================

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { DEMO_REPORTS } from '@/lib/constants/demo-data';
import SeverityBadge from '@/components/shared/SeverityBadge';
import { getCategoryLabel, timeAgo } from '@/lib/utils';

export default function RecentReports() {
  const reports = DEMO_REPORTS.slice(0, 3);

  return (
    <section aria-labelledby="recent-reports-title">
      <div className="flex items-center justify-between mb-3">
        <h2 id="recent-reports-title" className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
          Recent Scans
        </h2>
        <Link href="/reports" className="text-sm font-semibold flex items-center gap-0.5" style={{ color: 'var(--primary)' }}>
          View all <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {reports.map((report, idx) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.4 }}
          >
            <Link href={`/reports?id=${report.id}`}>
              <div
                className="flex gap-3 p-3 rounded-2xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}
              >
                <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                  <Image
                    src={report.imageUrl}
                    alt={report.prediction.condition}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        {report.prediction.condition}
                      </p>
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                        {getCategoryLabel(report.category)} · {timeAgo(report.createdAt)}
                      </p>
                    </div>
                    <SeverityBadge severity={report.prediction.severity} size="sm" />
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full overflow-hidden min-w-0" style={{ background: 'var(--border-subtle)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${report.prediction.confidence * 100}%`,
                          background: 'linear-gradient(90deg, #0ea5e9, #06b6d4)',
                        }}
                      />
                    </div>
                    <p className="text-[10px] whitespace-nowrap flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                      {Math.round(report.prediction.confidence * 100)}% conf.
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

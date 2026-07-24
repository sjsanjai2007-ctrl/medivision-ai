import type { Metadata } from 'next';
import AppShell from '@/components/layout/AppShell';
import WelcomeCard from '@/components/home/WelcomeCard';
import RecentReports from '@/components/home/RecentReports';
import HealthTips from '@/components/home/HealthTips';
import { QuickScanButton, AIAssistantShortcut, EmergencyButton } from '@/components/home/QuickActions';
import NearbyHospitalsPreview from '@/components/home/NearbyHospitalsPreview';

export const metadata: Metadata = {
  title: 'Home – MediVision AI',
  description: 'Your personal AI-assisted clinical screening dashboard. Start a scan, view recent reports, and get smart hospital recommendations.',
};

export default function HomePage() {
  return (
    <AppShell>
      <div className="px-4 py-5 space-y-6 max-w-2xl mx-auto lg:max-w-3xl lg:py-8">
        {/* Welcome Card */}
        <WelcomeCard />

        {/* Quick CTAs */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <QuickScanButton />
          <AIAssistantShortcut />
        </div>

        {/* Recent Scans */}
        <RecentReports />

        {/* Nearby Hospitals preview */}
        <NearbyHospitalsPreview />

        {/* Health Tips */}
        <HealthTips />
      </div>

      {/* Floating Emergency Button */}
      <EmergencyButton />
    </AppShell>
  );
}

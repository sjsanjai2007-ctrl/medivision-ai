import type { Metadata } from 'next';
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
    <>
      <div className="page-wrap space-y-6">

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
    </>
  );
}

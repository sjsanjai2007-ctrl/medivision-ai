import type { Metadata, Viewport } from 'next';
import { Providers } from '@/lib/providers';
import AppShell from '@/components/layout/AppShell';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'MediVision AI – AI-Assisted Clinical Screening',
    template: '%s | MediVision AI',
  },
  description:
    'MediVision AI provides AI-assisted clinical screening using medical images. Get explainable AI reports and smart hospital recommendations. For informational purposes only.',
  keywords: ['AI healthcare', 'clinical screening', 'medical AI', 'skin analysis', 'eye screening', 'MediVision'],
  authors: [{ name: 'MediVision AI Team' }],
  creator: 'MediVision AI',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MediVision AI',
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    siteName: 'MediVision AI',
    title: 'MediVision AI – AI-Assisted Clinical Screening',
    description: 'Professional AI-assisted clinical screening for skin, eye, chest, dental conditions and more.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#f8fafc',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers>
          {/* AppShell lives here — rendered ONCE, never remounts on navigation.
              Header + BottomNav stay stable → indicator never flashes to Home. */}
          <AppShell>
            {children}
          </AppShell>
        </Providers>
      </body>
    </html>
  );
}

import '@livekit/components-styles';
import '@livekit/components-styles/prefabs';
import '../styles/tokens.css';
import '../styles/globals.css';
import '../styles/livekit.css';
import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, JetBrains_Mono, Manrope } from 'next/font/google';

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-display',
  display: 'swap',
});

const ui = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ui',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

const DESCRIPTION =
  'Hainameet is a video calling room with a consensus button. Ask everyone at once, settle it in ten seconds, and leave with the decision written down.';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Hainameet',
    template: '%s',
  },
  description: DESCRIPTION,
  applicationName: 'Hainameet',
  openGraph: {
    title: 'Hainameet',
    description: DESCRIPTION,
    type: 'website',
    images: [{ url: '/images/og.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hainameet',
    description: DESCRIPTION,
    images: ['/images/og.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/images/mark.png', type: 'image/png', sizes: '128x128' },
    ],
    apple: { url: '/images/apple-touch-icon.png', sizes: '180x180' },
  },
};

export const viewport: Viewport = {
  themeColor: '#071d18',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${ui.variable} ${mono.variable}`}>
      <body data-lk-theme="haina">{children}</body>
    </html>
  );
}

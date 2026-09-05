import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';

/**
 * Root layout: document shell and fonts only.
 *
 * The public site's chrome (nav, footer, page transitions) lives in
 * `(site)/layout.tsx`, and the admin portal has its own in `admin/layout.tsx`,
 * so neither inherits the other's furniture.
 */

const display = Fraunces({
  subsets: ['latin'],
  weight: 'variable',
  axes: ['SOFT', 'WONK'],
  variable: '--font-display',
  display: 'swap',
});

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const NAME = 'Mahatma Gandhi Institute of Management Science & Technology';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.mgimst.org'),
  title: {
    default: `MGIMST — ${NAME}`,
    template: `%s — MGIMST`,
  },
  description:
    'MGIMST offers engineering, management, computer application, science, commerce and arts programmes through distance learning, at diploma, bachelor, PG diploma and masters level.',
  keywords: [
    'MGIMST',
    'Mahatma Gandhi Institute',
    'distance learning India',
    'engineering diploma',
    'MBA',
    'BCA',
    'Andhra Pradesh college',
  ],
  openGraph: {
    type: 'website',
    siteName: 'MGIMST',
    title: `MGIMST — ${NAME}`,
    description:
      'Engineering, management, science and commerce programmes delivered through distance learning.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="flex min-h-screen flex-col">{children}</body>
    </html>
  );
}

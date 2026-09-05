import type { NextConfig } from 'next';

/**
 * Headers applied to every response.
 *
 * The admin portal handles student records, so clickjacking and MIME sniffing
 * are closed off site-wide rather than per-route.
 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
];

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    // Every image is local and already capped by scripts/images.mjs.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  // `exceljs` is only used inside route handlers; keeping it external stops it
  // being traced into the client bundle.
  serverExternalPackages: ['exceljs', 'postgres', 'bcryptjs'],

  poweredByHeader: false,

  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        // The admin area must never be cached by a CDN or a shared proxy.
        source: '/admin/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
      {
        source: '/api/admin/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, must-revalidate' }],
      },
      {
        // Media filenames are stable and content is replaced wholesale by the
        // asset pipeline, so it can be cached hard.
        source: '/media/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;

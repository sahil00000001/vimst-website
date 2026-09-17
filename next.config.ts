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
    /* The optimizer emits `max-age` as the larger of this and the upstream
       file's own max-age, and it keys its cache on the request URL. Those URLs
       never change here, because `/media/logo-wordmark.png` keeps its name when
       the artwork inside it is replaced. Thirty days of that meant a visitor who
       had already seen the old logo kept it for thirty days after the new one
       shipped. A minute is enough to absorb a burst of traffic; past that the
       browser asks, and gets a 304 costing a few hundred bytes when nothing has
       changed. */
    minimumCacheTTL: 60,
  },

  // `exceljs` is only used inside route handlers; keeping it external stops it
  // being traced into the client bundle.
  serverExternalPackages: ['exceljs', 'postgres', 'bcryptjs', 'pdf-lib'],

  poweredByHeader: false,

  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        /* Pages. Next marks prerendered HTML `s-maxage=31536000` with nothing
           for the browser, which leaves the browser to guess a freshness
           lifetime of its own. Saying it explicitly is the difference between a
           visitor reliably seeing the current page and usually seeing it: the
           CDN holds the page and is purged on deploy, the browser always asks,
           and the ETag turns that question into a 304 when nothing has moved.

           Excludes the hashed bundles, which keep their own rule, and the API,
           where a shared cache holding a response for a year would be a bug
           rather than a saving. */
        source: '/:path((?!_next/|api/).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate, s-maxage=31536000, stale-while-revalidate=86400',
          },
        ],
      },
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
        /* Media filenames are stable and the asset pipeline replaces the file
           underneath them, which is exactly why this cannot be `immutable`.
           `immutable` is a promise that the bytes at this URL will never
           change, and a browser holding one will not revalidate even on a
           reload. It was a year long, so replacing a photograph in place had no
           effect on anyone who had already loaded the old one.

           The bytes are not immutable, so the header no longer says they are.
           The browser revalidates instead, which is a conditional request
           answered by a 304 costing a few hundred bytes whenever the file has
           not moved.

           No `s-maxage` either, and that is not an oversight. The image
           optimizer is itself a shared cache: it reads this header off the
           source file and emits the longer of it and `minimumCacheTTL` on the
           optimized image the browser actually downloads. An `s-maxage` of a
           year here would be handed straight back out on every
           `/_next/image` response and the staleness would survive the fix.
           Almost nothing fetches these paths directly in any case -- the
           optimizer stands in front of them, and it keeps a cache of its own. */
        source: '/media/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
      {
        /* Filenames under `/_next/static` carry a hash of their own contents,
           so a changed file is a changed URL and `immutable` is honest there.
           Next sets this itself; it is repeated here only so the two rules sit
           next to each other and the difference between them is on the page. */
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;

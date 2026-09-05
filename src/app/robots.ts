import type { MetadataRoute } from 'next';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.mgimst.org';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // The admin portal and its API are never for crawlers.
      disallow: ['/admin', '/admin/', '/api/'],
    },
    sitemap: `${SITE}/sitemap.xml`,
  };
}

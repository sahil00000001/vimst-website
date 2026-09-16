import type { MetadataRoute } from 'next';
import { courses } from '@/lib/content';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.vimst.org';

/** Every public page. The admin area is deliberately absent. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages = [
    { path: '', priority: 1 },
    { path: '/courses', priority: 0.9 },
    { path: '/about', priority: 0.8 },
    { path: '/specializations', priority: 0.7 },
    { path: '/placement', priority: 0.7 },
    { path: '/contact', priority: 0.7 },
    { path: '/enrollment-verification', priority: 0.6 },
    { path: '/photo-gallery', priority: 0.5 },
    { path: '/vision', priority: 0.5 },
    { path: '/mission', priority: 0.5 },
    { path: '/director-message', priority: 0.5 },
    { path: '/quality-policy', priority: 0.5 },
    { path: '/career', priority: 0.5 },
  ];

  return [
    ...staticPages.map((p) => ({
      url: `${SITE}${p.path}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: p.priority,
    })),
    ...courses.map((c) => ({
      url: `${SITE}/courses/${c.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}

/**
 * Social profiles.
 *
 * The original site rendered four social icons all pointing at `href="#"`,
 * which look clickable and do nothing. Rather than carry that over, an entry
 * with no `href` is simply not rendered — so the row grows as real profiles are
 * added and never shows a dead link.
 *
 * To switch one on, replace `null` with the profile URL. They can also be set
 * per-environment without touching this file, via NEXT_PUBLIC_SOCIAL_* env vars.
 */

export type Social = { label: string; href: string | null; d: string };

const fromEnv = (value: string | undefined) => {
  const trimmed = value?.trim();
  return trimmed && /^https?:\/\//.test(trimmed) ? trimmed : null;
};

export const SOCIAL_LINKS: Social[] = [
  {
    label: 'Facebook',
    href: fromEnv(process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK),
    d: 'M9.2 16V9.5H11l.3-2.2H9.2V5.9c0-.63.18-1.06 1.08-1.06h1.15V2.9A15 15 0 0 0 9.75 2.8C8.1 2.8 7 3.8 7 5.66V7.3H5.2v2.2H7V16h2.2Z',
  },
  {
    label: 'X (Twitter)',
    href: fromEnv(process.env.NEXT_PUBLIC_SOCIAL_TWITTER),
    d: 'M15.5 5.3c-.5.22-1.05.37-1.62.44a2.82 2.82 0 0 0 1.24-1.56 5.6 5.6 0 0 1-1.79.68 2.82 2.82 0 0 0-4.8 2.57A8 8 0 0 1 2.7 4.5a2.82 2.82 0 0 0 .87 3.76c-.46-.01-.9-.14-1.28-.35v.04c0 1.37.97 2.5 2.26 2.77-.24.06-.49.1-.75.1-.18 0-.36-.02-.53-.05a2.82 2.82 0 0 0 2.63 1.96A5.66 5.66 0 0 1 2 13.9a8 8 0 0 0 4.32 1.27c5.18 0 8.02-4.3 8.02-8.02v-.37c.55-.4 1.03-.9 1.4-1.47Z',
  },
  {
    label: 'LinkedIn',
    href: fromEnv(process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN),
    d: 'M5.4 15.5V6.8H2.6v8.7h2.8ZM4 5.6a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2Zm11.5 9.9v-4.8c0-2.56-1.37-3.75-3.2-3.75-1.47 0-2.13.81-2.5 1.38V6.8H7c.04.79 0 8.7 0 8.7h2.8v-4.86c0-.25.02-.5.09-.68.2-.5.65-1.01 1.42-1.01 1 0 1.4.76 1.4 1.88v4.67h2.79Z',
  },
  {
    label: 'YouTube',
    href: fromEnv(process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE),
    d: 'M16.2 6.1a1.9 1.9 0 0 0-1.34-1.35C13.68 4.4 9 4.4 9 4.4s-4.68 0-5.86.35A1.9 1.9 0 0 0 1.8 6.1 19.9 19.9 0 0 0 1.45 9.7c0 1.22.12 2.44.35 3.6a1.9 1.9 0 0 0 1.34 1.35c1.18.35 5.86.35 5.86.35s4.68 0 5.86-.35a1.9 1.9 0 0 0 1.34-1.35c.23-1.16.35-2.38.35-3.6 0-1.22-.12-2.44-.35-3.6ZM7.5 11.95v-4.5l3.9 2.25-3.9 2.25Z',
  },
];

/** Only the profiles that actually have a destination. */
export const activeSocialLinks = () =>
  SOCIAL_LINKS.filter((s): s is Social & { href: string } => Boolean(s.href));

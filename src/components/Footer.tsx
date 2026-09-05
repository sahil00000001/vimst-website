import Link from 'next/link';
import { Reveal } from './Motion';
import { Media } from './Media';
import { activeSocialLinks } from '@/lib/social';

const USEFUL = [
  { label: 'About Us', href: '/about' },
  { label: 'Vision', href: '/vision' },
  { label: 'Mission', href: '/mission' },
  { label: "Director's Message", href: '/director-message' },
  { label: 'Quality Policy', href: '/quality-policy' },
  { label: 'Career', href: '/career' },
];

const ADMISSION = [
  { label: 'All Courses', href: '/courses' },
  { label: 'Specializations', href: '/specializations' },
  { label: 'Fee Structure', href: '/fee-structure' },
  { label: 'Payment Modes', href: '/payment-modes' },
  { label: 'Enrollment Verification', href: '/enrollment-verification' },
  { label: 'Placements', href: '/placement' },
];


export function Footer() {
  const socials = activeSocialLinks();

  return (
    <footer className="mt-auto border-t border-rule bg-paper">
      <div className="shell">
        <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-12 lg:gap-10 lg:py-20">
          {/* Identity */}
          <Reveal className="lg:col-span-4" from="up">
            <Media
              src="/media/logo-wordmark.png"
              alt="Mahatma Gandhi Institute of Management Science &amp; Technology"
              width={900}
              height={191}
              className="h-12 w-auto"
            />
            <p className="mt-5 max-w-sm text-[length:var(--text-base)] leading-relaxed text-slate">
              Mahatma Gandhi Institute of Management Science &amp; Technology stands as a
              prestigious beacon of excellence in education, committed to fostering
              innovation and leadership.
            </p>
            {socials.length > 0 && (
              <div className="mt-6 flex items-center gap-2">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`MGIMST on ${s.label}`}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-rule text-slate transition-all duration-300 hover:-translate-y-0.5 hover:border-crimson hover:bg-crimson hover:text-paper"
                  >
                    <svg width="17" height="17" viewBox="0 0 18 18" fill="currentColor" aria-hidden>
                      <path d={s.d} />
                    </svg>
                  </a>
                ))}
              </div>
            )}
          </Reveal>

          <Reveal className="lg:col-span-2" from="up" delay={0.06}>
            <h3 className="mb-4 text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.16em] text-crimson">
              Institute
            </h3>
            <ul className="space-y-2.5">
              {USEFUL.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[length:var(--text-base)] text-graphite transition-colors hover:text-crimson"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="lg:col-span-3" from="up" delay={0.12}>
            <h3 className="mb-4 text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.16em] text-crimson">
              Admission
            </h3>
            <ul className="space-y-2.5">
              {ADMISSION.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[length:var(--text-base)] text-graphite transition-colors hover:text-crimson"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="lg:col-span-3" from="up" delay={0.18}>
            <h3 className="mb-4 text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.16em] text-crimson">
              Contact
            </h3>
            <address className="space-y-3 not-italic text-[length:var(--text-base)] text-graphite">
              <p className="text-slate">Andhra Pradesh, India</p>
              <p>
                <a href="mailto:info@mgimst.org" className="transition-colors hover:text-crimson">
                  info@mgimst.org
                </a>
              </p>
              <p>
                <a
                  href="mailto:verification@mgimst.org"
                  className="transition-colors hover:text-crimson"
                >
                  verification@mgimst.org
                </a>
              </p>
              <p>
                <a href="mailto:admin@mgimst.org" className="transition-colors hover:text-crimson">
                  admin@mgimst.org
                </a>
              </p>
            </address>
            <Link
              href="/contact"
              className="group mt-6 inline-flex items-center gap-2 border-b border-ink pb-1 text-[length:var(--text-sm)] font-medium text-ink transition-colors hover:border-crimson hover:text-crimson"
            >
              Request a callback
              <svg width="13" height="10" viewBox="0 0 13 10" fill="none" aria-hidden>
                <path
                  d="M1 5h10M7.5 1.5L11 5l-3.5 3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </svg>
            </Link>
          </Reveal>
        </div>
      </div>

      <div className="border-t border-rule bg-shell">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-2 px-5 py-5 text-[length:var(--text-sm)] text-slate sm:flex-row sm:px-8">
          <p>
            © {new Date().getFullYear()} Mahatma Gandhi Institute of Management Science &amp;
            Technology. All rights reserved.
          </p>
          <p className="text-mist">ISO 9001:2008 Certified</p>
        </div>
      </div>
    </footer>
  );
}

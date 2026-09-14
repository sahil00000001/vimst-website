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
  { label: 'Check Your Result', href: '/enrollment-verification' },
  { label: 'Placements', href: '/placement' },
];


export function Footer() {
  const socials = activeSocialLinks();

  return (
    <footer className="mt-auto border-t border-rule bg-paper">
      <div className="shell">
        <div className="grid grid-cols-2 gap-x-6 gap-y-9 py-12 lg:grid-cols-12 lg:gap-10 lg:py-20">
          {/* Identity */}
          <Reveal className="col-span-2 lg:col-span-4" from="up">
            <Media
              src="/media/logo-wordmark.png"
              alt="Vivekananda Institute of Management Science and Technology"
              width={1200}
              height={416}
              className="h-16 w-auto sm:h-20"
            />
            <p className="mt-4 max-w-sm text-[length:var(--text-sm)] leading-relaxed text-slate">
              Vivekananda Institute of Management Science and Technology has taught
              engineering, management, science and commerce in Andhra Pradesh since
              1998. Our programmes are delivered through distance learning, so you can
              study for a recognised qualification while you keep working.
            </p>
            {socials.length > 0 && (
              <div className="mt-6 flex items-center gap-2">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`VIMST on ${s.label}`}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-rule text-slate transition-all duration-300 hover:-translate-y-0.5 hover:border-brand hover:bg-brand hover:text-paper"
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
            <h3 className="mb-3 text-[length:var(--text-xs)] font-semibold uppercase tracking-[0.13em] text-brand">
              Institute
            </h3>
            <ul>
              {USEFUL.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="-mx-1 block rounded px-1 py-3 text-[length:var(--text-sm)] text-graphite transition-colors hover:text-brand"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="lg:col-span-3" from="up" delay={0.12}>
            <h3 className="mb-3 text-[length:var(--text-xs)] font-semibold uppercase tracking-[0.13em] text-brand">
              Admission
            </h3>
            <ul>
              {ADMISSION.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="-mx-1 block rounded px-1 py-3 text-[length:var(--text-sm)] text-graphite transition-colors hover:text-brand"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="col-span-2 lg:col-span-3" from="up" delay={0.18}>
            <h3 className="mb-3 text-[length:var(--text-xs)] font-semibold uppercase tracking-[0.13em] text-brand">
              Contact
            </h3>
            <address className="not-italic text-[length:var(--text-sm)] text-graphite">
              <p className="py-2.5 text-slate">Andhra Pradesh, India</p>
              <p>
                <a
                  href="mailto:info@vimst.org"
                  className="-mx-1 block break-all rounded px-1 py-3 transition-colors hover:text-brand"
                >
                  info@vimst.org
                </a>
              </p>
              <p>
                <a
                  href="mailto:verification@vimst.org"
                  className="-mx-1 block break-all rounded px-1 py-3 transition-colors hover:text-brand"
                >
                  verification@vimst.org
                </a>
              </p>
              <p>
                <a
                  href="mailto:admin@vimst.org"
                  className="-mx-1 block break-all rounded px-1 py-3 transition-colors hover:text-brand"
                >
                  admin@vimst.org
                </a>
              </p>
            </address>
            <Link
              href="/contact"
              className="group mt-5 inline-flex min-h-11 items-center gap-2 border-b border-ink pb-1 text-[length:var(--text-sm)] font-medium text-ink transition-colors hover:border-brand hover:text-brand"
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

      {/* The copyright strip is navy, matching the one at the top of the page,
          so the brand closes the page as well as opening it. */}
      <div className="border-t border-brand bg-brand text-paper">
        <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-1.5 px-5 py-5 pr-20 text-[length:var(--text-xs)] text-paper/75 sm:flex-row sm:items-center sm:px-8 sm:pr-8 sm:text-[length:var(--text-sm)]">
          <p>
            © {new Date().getFullYear()} Vivekananda Institute of Management Science and
            Technology. All rights reserved.
          </p>
          <p className="text-gold">ISO 9001:2008 Certified</p>
        </div>
      </div>
    </footer>
  );
}

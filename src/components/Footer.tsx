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

/** The four ways in, each labelled so the right one is obvious at a glance. */
const CONTACT = [
  { label: 'Location', value: 'Andhra Pradesh, India', href: null },
  { label: 'Enquiries', value: 'info@vimst.org', href: 'mailto:info@vimst.org' },
  {
    label: 'Verification',
    value: 'verification@vimst.org',
    href: 'mailto:verification@vimst.org',
  },
  { label: 'Administration', value: 'admin@vimst.org', href: 'mailto:admin@vimst.org' },
];

const ADMISSION = [
  { label: 'All Courses', href: '/courses' },
  { label: 'Specializations', href: '/specializations' },
  { label: 'Check Your Result', href: '/enrollment-verification' },
  { label: 'Placements', href: '/placement' },
];


export function Footer() {
  const socials = activeSocialLinks();

  return (
    <footer className="mt-auto border-t border-rule bg-paper">
      <div className="shell">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 py-9 lg:grid-cols-12 lg:gap-10 lg:py-16">
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
              Established in 1997, Vivekananda Institute of Management Science and
              Technology is committed to accessible, structured and career-oriented
              education. Programmes are offered in Regular and Part-Time modes, so you
              can study for a recognised qualification alongside your other
              commitments.
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
            {/* Two columns, not one. Four single-line entries stacked down the
                left edge of a phone leave the right half of the screen empty
                and push the copyright line most of a screen further down; side
                by side they read as one block and cost half the height. Each
                address is labelled, so what to use each one for is legible
                without opening the contact page. */}
            <address className="grid grid-cols-2 gap-x-5 gap-y-4 not-italic text-[length:var(--text-sm)] text-graphite lg:grid-cols-1 lg:gap-y-0">
              {CONTACT.map((c) => (
                <div key={c.label} className="min-w-0">
                  <p className="text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.12em] text-mist">
                    {c.label}
                  </p>
                  {c.href ? (
                    <a
                      href={c.href}
                      className="-mx-1 mt-0.5 block break-words rounded px-1 py-2 transition-colors hover:text-brand"
                    >
                      {c.value}
                    </a>
                  ) : (
                    <p className="mt-0.5 py-2 text-slate">{c.value}</p>
                  )}
                </div>
              ))}
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
          <p className="text-gold">ISO 9001:2015 Certified</p>
        </div>
      </div>
    </footer>
  );
}

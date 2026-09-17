'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { ACCENT_CLASS } from '@/lib/accents';
import type { NavItem } from '@/lib/nav';
import { Media } from './Media';
import { MobileNav } from './MobileNav';

const EASE = [0.22, 1, 0.36, 1] as const;

export function Navbar({ nav }: { nav: NavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastY = useRef(0);

  /* The header condenses on scroll, and slides away when scrolling down far
     into a page so long course pages get the full viewport back. */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > 420 && y > lastY.current && !open);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [open]);

  /* Any navigation dismisses whatever menu is showing. */
  useEffect(() => {
    setOpen(null);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(null);
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* A short grace period keeps the panel open while the pointer crosses the gap. */
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(null), 160);
  };
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const isActive = (item: NavItem) =>
    item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

  const activeItem = nav.find((i) => i.label === open && i.columns);

  return (
    <>
      {/* Utility strip, in the logo navy so the brand reads from the very
          top of the page rather than starting at the mark. */}
      <div className="hidden border-b border-brand bg-brand text-paper lg:block">
        <div className="shell flex items-center justify-between gap-6 py-1 text-[length:var(--text-xs)]">
          <p className="tracking-wide text-paper/70">
            Andhra Pradesh, India · Established 1997 · ISO 9001:2015 Certified
          </p>
          <div className="flex items-center gap-5">
            <a
              href="mailto:info@vimst.org"
              className="inline-flex min-h-9 items-center text-paper/80 transition-colors hover:text-gold"
            >
              info@vimst.org
            </a>
            <span className="h-3 w-px bg-paper/25" />
            <Link
              href="/enrollment-verification"
              className="inline-flex min-h-9 items-center text-paper/80 transition-colors hover:text-gold"
            >
              Check your result
            </Link>
          </div>
        </div>
      </div>

      <motion.header
        animate={{ y: hidden ? '-100%' : '0%' }}
        transition={{ duration: 0.45, ease: EASE }}
        className={`sticky top-0 z-50 border-b bg-paper/92 backdrop-blur-md transition-[box-shadow,border-color] duration-500 ${
          scrolled ? 'border-rule shadow-[0_1px_28px_rgba(22,21,26,0.07)]' : 'border-transparent'
        }`}
        onMouseLeave={scheduleClose}
      >
        <div
          className={`shell flex items-center justify-between gap-5 transition-all duration-500 ${
            scrolled ? 'py-2.5' : 'py-3.5 sm:py-4'
          }`}
        >
          <Link href="/" className="block shrink-0" aria-label="VIMST home">
            <Media
              src="/media/logo-wordmark.png"
              alt="Vivekananda Institute of Management Science and Technology"
              width={1200}
              height={416}
              priority
              /* The mark is the institute's identity and carries the whole
                 header, so it is sized to whatever the row can actually give
                 it rather than tucked into a corner.

                 On a phone the ceiling is arithmetic. The row holds the mark,
                 a 44px menu button and the gutters, which on a 320px screen
                 leaves about 219px of width; the wordmark is 2.88 times wider
                 than it is tall, so it cannot pass roughly 76px there. The
                 clamp starts just under that and then grows with the viewport,
                 so a 390px phone gets 78px and a 430px one 86px rather than
                 every phone being held down to the narrowest one.

                 The dip at `xl` is deliberate: that is where the eight nav
                 items and the button appear and start competing for the same
                 row. It grows again at `2xl`. */
              className={`w-auto transition-all duration-500 ${
                scrolled
                  ? 'h-14 sm:h-16 lg:h-20 xl:h-16 2xl:h-20'
                  : 'h-[clamp(4.5rem,21vw,6.5rem)] sm:h-[6.5rem] lg:h-28 xl:h-[5.75rem] 2xl:h-28'
              }`}
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Primary">
            {nav.map((item) => {
              const active = isActive(item);
              const hasMenu = Boolean(item.columns);
              const showing = open === item.label;
              return (
                <div
                  key={item.label}
                  onMouseEnter={() => {
                    cancelClose();
                    setOpen(hasMenu ? item.label : null);
                  }}
                >
                  <Link
                    href={item.href}
                    onFocus={() => setOpen(hasMenu ? item.label : null)}
                    aria-expanded={hasMenu ? showing : undefined}
                    /* Tighter horizontal padding at `xl` than at `2xl`: the
                       eight items and the button share the row with the mark,
                       and 4px either side of each item is 64px given back to
                       the logo at the one width where the row is tight. */
                    className={`relative flex items-center gap-1.5 rounded-lg px-2 py-2 text-[length:var(--text-sm)] font-medium tracking-tight transition-colors duration-300 2xl:px-3 ${
                      active || showing ? 'text-brand' : 'text-graphite hover:text-ink'
                    }`}
                  >
                    {showing && (
                      <motion.span
                        layoutId="nav-hover"
                        className="absolute inset-0 rounded-lg bg-linen"
                        transition={{ duration: 0.3, ease: EASE }}
                      />
                    )}
                    <span className="relative z-10">{item.label}</span>
                    {hasMenu && (
                      <motion.svg
                        width="9"
                        height="6"
                        viewBox="0 0 9 6"
                        fill="none"
                        aria-hidden
                        animate={{ rotate: showing ? 180 : 0 }}
                        transition={{ duration: 0.3, ease: EASE }}
                        className="relative z-10 opacity-55"
                      >
                        <path
                          d="M1 1L4.5 4.5L8 1"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                        />
                      </motion.svg>
                    )}
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-x-3 -bottom-0.5 h-px bg-brand"
                        transition={{ duration: 0.45, ease: EASE }}
                      />
                    )}
                  </Link>
                </div>
              );
            })}

            <Link
              href="/contact"
              className="group relative ml-3 inline-flex items-center gap-2 overflow-hidden rounded-full bg-brand px-5 py-2.5 text-[length:var(--text-sm)] font-medium text-paper"
            >
              {/* The brand navy sweeps in from the left on hover. */}
              <span
                aria-hidden
                className="absolute inset-0 origin-left scale-x-0 bg-brand transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
              />
              <span className="relative z-10">Apply Now</span>
              <svg
                width="13"
                height="10"
                viewBox="0 0 13 10"
                fill="none"
                aria-hidden
                className="relative z-10"
              >
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
          </nav>

          {/* Mobile trigger */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-rule text-ink transition-colors hover:border-brand hover:text-brand xl:hidden"
          >
            <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden>
              <path d="M0 1h18M0 6h18M0 11h12" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
        </div>

        {/* Mega menu panel */}
        <AnimatePresence>
          {activeItem && (
            <motion.div
              key={activeItem.label}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: EASE }}
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
              className="absolute inset-x-0 top-full hidden border-y border-rule bg-paper shadow-[0_28px_60px_-30px_rgba(22,21,26,0.28)] xl:block"
            >
              <div className={`shell py-8 ${activeItem.wide ? '' : 'max-w-[460px]'}`}>
                <div
                  className={
                    activeItem.wide
                      ? 'grid grid-cols-2 gap-x-7 gap-y-7 md:grid-cols-3 lg:grid-cols-5'
                      : 'grid grid-cols-1 gap-6'
                  }
                >
                  {activeItem.columns!.map((col, ci) => {
                    const accent = ACCENT_CLASS[col.accent];
                    return (
                      <motion.div
                        key={col.heading}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.03 + ci * 0.025, ease: EASE }}
                      >
                        <div className="mb-2.5 border-b border-rule-soft pb-2">
                          <p
                            className={`flex items-center gap-2 text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.14em] ${accent.text}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 shrink-0 rounded-full ${accent.dot}`}
                              aria-hidden
                            />
                            {col.heading}
                          </p>
                          {col.note && (
                            <p className="mt-1 pl-3.5 text-[length:var(--text-2xs)] text-mist">
                              {col.note}
                            </p>
                          )}
                        </div>
                        <ul className="space-y-0.5">
                          {col.links.map((link) => (
                            <li key={link.href + link.label}>
                              <Link
                                href={link.href}
                                className={`group flex items-center gap-1.5 rounded px-1.5 py-1 text-[length:var(--text-sm)] leading-snug text-graphite transition-colors duration-200 hover:bg-shell ${accent.hoverText}`}
                              >
                                <span
                                  aria-hidden
                                  className={`h-px w-0 shrink-0 transition-all duration-300 group-hover:w-2.5 ${accent.dot}`}
                                />
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <MobileNav nav={nav} open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}

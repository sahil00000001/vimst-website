'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import type { NavItem } from '@/lib/nav';
import { Media } from './Media';

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The menu drawer below the desktop breakpoint.
 *
 * Every item is a plain link, All Courses included. On a desktop that item
 * opens the full programmes menu; here the same list was a dropdown inside a
 * drawer, two tiers deep and taller than the screen, and the courses page
 * already lays every programme out with filters for stream and level. So a
 * tap goes straight there.
 */
export function MobileNav({
  nav,
  open,
  onClose,
}: {
  nav: NavItem[];
  open: boolean;
  onClose: () => void;
}) {
  /* Lock the page behind the drawer while it is showing. */
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-ink/40 backdrop-blur-[3px] xl:hidden"
            aria-hidden
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.45, ease: EASE }}
            className="mg-scroll fixed inset-y-0 right-0 z-[70] flex w-[min(92vw,26rem)] flex-col overflow-y-auto overscroll-contain bg-paper xl:hidden"
            aria-label="Mobile navigation"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-rule bg-paper/95 px-5 py-4 backdrop-blur">
              <Link href="/" onClick={onClose} aria-label="VIMST home">
                <Media
                  src="/media/logo-wordmark.png"
                  alt="VIMST"
                  width={1200}
                  height={416}
                  className="h-12 w-auto"
                />
              </Link>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-rule text-graphite transition-colors hover:border-brand hover:text-brand"
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
                  <path d="M1 1l11 11M12 1L1 12" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 px-5 py-3">
              <ul className="divide-y divide-rule-soft">
                {nav.map((item, index) => (
                  <motion.li
                    key={item.label}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.06 + index * 0.035, ease: EASE }}
                    className="py-0.5"
                  >
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="block py-3 font-display text-[length:var(--text-lg)] text-ink transition-colors hover:text-brand"
                    >
                      {item.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-6 grid gap-2.5">
                <Link
                  href="/contact"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3.5 text-[length:var(--text-sm)] font-medium text-paper transition-colors hover:bg-brand-deep"
                >
                  Apply Now
                  <svg width="13" height="10" viewBox="0 0 13 10" fill="none" aria-hidden>
                    <path
                      d="M1 5h10M7.5 1.5L11 5l-3.5 3.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
                {/* Results have their own item in the list above now, so the
                    second button goes to the other thing people arrive for. */}
                <Link
                  href="/courses"
                  onClick={onClose}
                  className="flex items-center justify-center rounded-full border border-rule px-6 py-3.5 text-[length:var(--text-sm)] font-medium text-ink transition-colors hover:border-ink"
                >
                  Explore all courses
                </Link>
              </div>

              <div className="mt-6 space-y-1 border-t border-rule pt-5 text-[length:var(--text-sm)] text-slate">
                <p>Andhra Pradesh, India</p>
                <a href="mailto:info@vimst.org" className="block hover:text-brand">
                  info@vimst.org
                </a>
                <a href="mailto:admin@vimst.org" className="block hover:text-brand">
                  admin@vimst.org
                </a>
              </div>
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ACCENT_CLASS } from '@/lib/accents';
import type { NavItem } from '@/lib/nav';
import { Media } from './Media';

const EASE = [0.22, 1, 0.36, 1] as const;

export function MobileNav({
  nav,
  open,
  onClose,
}: {
  nav: NavItem[];
  open: boolean;
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [expandedCol, setExpandedCol] = useState<string | null>(null);

  /* Lock the page behind the drawer while it is showing. */
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setExpanded(null);
      setExpandedCol(null);
    }
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
              <Link href="/" onClick={onClose} aria-label="MGIMST home">
                <Media
                  src="/media/logo-wordmark.png"
                  alt="MGIMST"
                  width={900}
                  height={191}
                  className="h-8 w-auto"
                />
              </Link>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-rule text-graphite transition-colors hover:border-crimson hover:text-crimson"
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
                  <path d="M1 1l11 11M12 1L1 12" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 px-5 py-3">
              <ul className="divide-y divide-rule-soft">
                {nav.map((item, index) => {
                  const hasMenu = Boolean(item.columns);
                  const isOpen = expanded === item.label;
                  return (
                    <motion.li
                      key={item.label}
                      initial={{ opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.06 + index * 0.035, ease: EASE }}
                      className="py-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className="flex-1 py-3 font-display text-[length:var(--text-lg)] text-ink transition-colors hover:text-crimson"
                        >
                          {item.label}
                        </Link>
                        {hasMenu && (
                          <button
                            type="button"
                            aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${item.label}`}
                            aria-expanded={isOpen}
                            onClick={() => {
                              setExpanded(isOpen ? null : item.label);
                              setExpandedCol(null);
                            }}
                            className="flex h-11 w-11 items-center justify-center rounded-full text-slate transition-colors hover:bg-linen hover:text-crimson"
                          >
                            <motion.svg
                              width="11"
                              height="7"
                              viewBox="0 0 9 6"
                              fill="none"
                              animate={{ rotate: isOpen ? 180 : 0 }}
                              transition={{ duration: 0.3, ease: EASE }}
                              aria-hidden
                            >
                              <path
                                d="M1 1L4.5 4.5L8 1"
                                stroke="currentColor"
                                strokeWidth="1.4"
                                strokeLinecap="round"
                              />
                            </motion.svg>
                          </button>
                        )}
                      </div>

                      <AnimatePresence initial={false}>
                        {hasMenu && isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: EASE }}
                            className="overflow-hidden"
                          >
                            <ul className="mb-3 space-y-1">
                              {item.columns!.map((col) => {
                                const colKey = `${item.label}::${col.heading}`;
                                const colOpen = expandedCol === colKey;
                                const accent = ACCENT_CLASS[col.accent];
                                /* A single-column menu is flat -- no second tier needed. */
                                const flat = item.columns!.length === 1;

                                if (flat) {
                                  return col.links.map((link) => (
                                    <li key={link.href + link.label}>
                                      <Link
                                        href={link.href}
                                        onClick={onClose}
                                        className={`block border-l-2 py-2 pl-3.5 text-[length:var(--text-base)] text-graphite transition-colors ${accent.border} ${accent.hoverText}`}
                                      >
                                        {link.label}
                                      </Link>
                                    </li>
                                  ));
                                }

                                return (
                                  <li key={colKey}>
                                    <button
                                      type="button"
                                      aria-expanded={colOpen}
                                      onClick={() => setExpandedCol(colOpen ? null : colKey)}
                                      className={`flex w-full items-center justify-between gap-3 border-l-2 py-2.5 pl-3.5 text-left text-[length:var(--text-sm)] font-medium transition-colors ${accent.border} ${
                                        colOpen ? accent.text : 'text-ink'
                                      }`}
                                    >
                                      <span className="min-w-0">
                                        <span className="block truncate">{col.heading}</span>
                                        {col.note && (
                                          <span className="mt-0.5 block text-[length:var(--text-2xs)] font-normal text-mist">
                                            {col.note}
                                          </span>
                                        )}
                                      </span>
                                      <motion.span
                                        animate={{ rotate: colOpen ? 45 : 0 }}
                                        transition={{ duration: 0.25, ease: EASE }}
                                        className="shrink-0 text-slate"
                                      >
                                        <svg
                                          width="11"
                                          height="11"
                                          viewBox="0 0 11 11"
                                          fill="none"
                                          aria-hidden
                                        >
                                          <path
                                            d="M5.5 0v11M0 5.5h11"
                                            stroke="currentColor"
                                            strokeWidth="1.3"
                                          />
                                        </svg>
                                      </motion.span>
                                    </button>

                                    <AnimatePresence initial={false}>
                                      {colOpen && (
                                        <motion.ul
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: 'auto', opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          transition={{ duration: 0.3, ease: EASE }}
                                          className="overflow-hidden pl-3.5"
                                        >
                                          {col.links.map((link) => (
                                            <li key={link.href + link.label}>
                                              <Link
                                                href={link.href}
                                                onClick={onClose}
                                                className={`flex items-center gap-2 py-2 pl-3 text-[length:var(--text-sm)] text-slate transition-colors ${accent.hoverText}`}
                                              >
                                                <span
                                                  aria-hidden
                                                  className={`h-1 w-1 shrink-0 rounded-full ${accent.dot} opacity-50`}
                                                />
                                                {link.label}
                                              </Link>
                                            </li>
                                          ))}
                                        </motion.ul>
                                      )}
                                    </AnimatePresence>
                                  </li>
                                );
                              })}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.li>
                  );
                })}
              </ul>

              <div className="mt-6 grid gap-2.5">
                <Link
                  href="/contact"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-[length:var(--text-sm)] font-medium text-paper transition-colors hover:bg-crimson"
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
                <Link
                  href="/enrollment-verification"
                  onClick={onClose}
                  className="flex items-center justify-center rounded-full border border-rule px-6 py-3.5 text-[length:var(--text-sm)] font-medium text-ink transition-colors hover:border-ink"
                >
                  Check your result
                </Link>
              </div>

              <div className="mt-6 space-y-1 border-t border-rule pt-5 text-[length:var(--text-sm)] text-slate">
                <p>Andhra Pradesh, India</p>
                <a href="mailto:info@mgimst.org" className="block hover:text-crimson">
                  info@mgimst.org
                </a>
                <a href="mailto:admin@mgimst.org" className="block hover:text-crimson">
                  admin@mgimst.org
                </a>
              </div>
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

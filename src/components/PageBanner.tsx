'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Media } from './Media';
import { EASE, WordReveal } from './Motion';

export type Crumb = { label: string; href?: string };

/**
 * Page header: a wide image plate that parallaxes under a white scrim, with
 * the breadcrumb and title on a card that overlaps it.
 *
 * `wide` matches the card to a full-width content card below; the default
 * matches the eight-column body used on pages that carry a sidebar. `attached`
 * leaves the card's bottom edge open so the content card below continues it.
 */
export function PageBanner({
  title,
  eyebrow,
  intro,
  image,
  crumbs = [],
  meta,
  wide = false,
  attached = true,
}: {
  title: string;
  eyebrow?: string;
  intro?: string | null;
  image?: string | null;
  crumbs?: Crumb[];
  meta?: { label: string; value: string }[];
  wide?: boolean;
  attached?: boolean;
}) {
  const plateRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: plateRef,
    offset: ['start start', 'end start'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '26%']);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.06, 1.16]);

  return (
    <section className="relative">
      <div
        ref={plateRef}
        /* 240px of banner on an 844px phone is nearly a third of the screen spent
           before the page has said anything. Two thirds of that still reads as a
           banner, and the card below it starts above the fold. */
        className="relative h-[24vh] min-h-[160px] w-full overflow-hidden bg-linen sm:h-[40vh] sm:min-h-[300px]"
      >
        {image ? (
          <motion.div
            style={{ y: imageY, scale: imageScale }}
            className="absolute -inset-y-[14%] inset-x-0"
          >
            <Media src={image} fill priority sizes="100vw" className="object-cover" />
          </motion.div>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_0%,#ffffff_0%,#f3f1ec_55%,#e9e5db_100%)]" />
        )}
        {/* White scrim keeps the page in the off-white family whatever the photo. */}
        <div className="absolute inset-0 bg-gradient-to-b from-paper/72 via-paper/45 to-shell" />
        <div className="absolute inset-0 bg-gradient-to-r from-paper/60 to-transparent" />
      </div>

      <div className="shell relative -mt-24 pb-2 sm:-mt-32">
        <div className={wide ? '' : 'grid lg:grid-cols-12 lg:gap-14'}>
          <motion.div
            className={wide ? '' : 'lg:col-span-8'}
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: EASE }}
          >
            <div
              className={`border border-rule bg-paper px-5 pb-7 pt-7 shadow-[0_-24px_56px_-44px_rgba(22,21,26,0.45)] sm:px-10 sm:pb-8 sm:pt-10 ${
                attached ? 'rounded-t-2xl border-b-0' : 'rounded-2xl'
              }`}
            >
              {crumbs.length > 0 && (
                <nav aria-label="Breadcrumb" className="mb-4">
                  <ol className="-my-3 flex flex-wrap items-center gap-x-2 text-[length:var(--text-xs)] text-slate">
                    <li>
                      <Link href="/" className="inline-block py-3 transition-colors hover:text-brand">
                        Home
                      </Link>
                    </li>
                    {crumbs.map((c) => (
                      <li key={c.label} className="flex items-center gap-2">
                        <span className="text-mist" aria-hidden>
                          /
                        </span>
                        {c.href ? (
                          <Link href={c.href} className="inline-block py-3 transition-colors hover:text-brand">
                            {c.label}
                          </Link>
                        ) : (
                          <span className="inline-block py-3 text-graphite">{c.label}</span>
                        )}
                      </li>
                    ))}
                  </ol>
                </nav>
              )}

              {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}

              <h1 className="text-[length:var(--text-4xl)]">
                <WordReveal text={title} delay={0.1} />
              </h1>

              {intro && (
                <motion.p
                  className="mt-5 max-w-[62ch] text-[length:var(--text-lg)] leading-relaxed text-slate"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
                >
                  {intro}
                </motion.p>
              )}

              {meta && meta.length > 0 && (
                <motion.dl
                  className="mt-7 grid gap-x-8 gap-y-4 border-t border-rule-soft pt-6 sm:grid-cols-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.45 }}
                >
                  {meta.map((m) => (
                    <div key={m.label}>
                      <dt className="text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.16em] text-mist">
                        {m.label}
                      </dt>
                      <dd className="mt-1 text-[length:var(--text-base)] font-medium text-ink">
                        {m.value}
                      </dd>
                    </div>
                  ))}
                </motion.dl>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

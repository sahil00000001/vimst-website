'use client';

import Link from 'next/link';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Counter, EASE, Magnetic } from './Motion';
import { Media } from './Media';
import { VideoFeature } from './VideoFeature';
import type { VideoSlot } from '@/lib/media';

const INTERVAL = 6400;
const HEADLINE = ['Learning', 'that travels', 'with you.'];

export type HeroStat = { value: number; suffix?: string; label: string; static?: string };

export function Arrow({ className = '' }: { className?: string }) {
  return (
    <svg width="14" height="10" viewBox="0 0 13 10" fill="none" aria-hidden className="shrink-0">
      <path
        d="M1 5h10M7.5 1.5L11 5l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      />
    </svg>
  );
}

export function Hero({
  slides,
  stats,
  video = null,
}: {
  slides: string[];
  stats: HeroStat[];
  /** When a film exists it replaces the carousel: it says more than six stills. */
  video?: VideoSlot | null;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;
  const ref = useRef<HTMLElement>(null);

  /* Copy and image plate drift apart as the hero scrolls away. */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const copyY = useTransform(scrollYProgress, [0, 1], ['0%', '32%']);
  const plateY = useTransform(scrollYProgress, [0, 1], ['0%', '-12%']);
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const washY = useTransform(scrollYProgress, [0, 1], ['0%', '22%']);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count]
  );

  useEffect(() => {
    if (paused || count < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL);
    return () => clearInterval(id);
  }, [paused, count]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-shell"
      /* A single still is not a carousel, and announcing it as one sends a
         screen reader looking for controls that are not there. */
      aria-roledescription={count > 1 ? 'carousel' : undefined}
      aria-label="Campus highlights"
    >
      {/* Ambient wash behind everything, drifting slowly. */}
      <motion.div
        aria-hidden
        style={{ y: washY }}
        className="pointer-events-none absolute -top-1/4 left-1/2 h-[110%] w-[130%] -translate-x-1/2 bg-[radial-gradient(60%_50%_at_30%_25%,rgba(7,33,81,0.06),transparent_70%),radial-gradient(45%_40%_at_80%_15%,rgba(208,158,49,0.1),transparent_70%)]"
      />

      <div className="shell relative grid gap-0 pb-8 pt-8 sm:pt-12 lg:grid-cols-12 lg:gap-10 lg:pb-20 lg:pt-16">
        {/* Copy */}
        <motion.div
          style={{ y: copyY, opacity: fade }}
          className="relative z-10 flex flex-col justify-center lg:col-span-5"
        >
          <motion.p
            className="eyebrow mb-5 sm:mb-7"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            Admissions Open · New Session
          </motion.p>

          <h1 className="font-display text-[length:var(--text-5xl)] leading-[1.04] tracking-[-0.03em]">
            {HEADLINE.map((line, i) => (
              <span key={i} className="block overflow-hidden pb-[0.06em]">
                <motion.span
                  className="block"
                  initial={{ y: '108%' }}
                  animate={{ y: '0%' }}
                  transition={{ duration: 0.95, delay: 0.1 + i * 0.1, ease: EASE }}
                >
                  {i === 2 ? <em className="not-italic text-brand">{line}</em> : line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            className="mt-6 max-w-[38ch] text-[length:var(--text-lg)] leading-relaxed text-slate"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.45, ease: EASE }}
          >
            Engineering, management, science and commerce programmes delivered through
            distance learning, so a degree fits around the work you are already doing.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-col items-stretch gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.58, ease: EASE }}
          >
            <Magnetic className="w-full sm:w-auto">
              <Link
                href="/courses"
                className="group inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-ink px-6 py-4 text-[length:var(--text-sm)] font-medium text-paper transition-colors duration-300 hover:bg-brand sm:w-auto sm:px-7 sm:py-3.5"
              >
                Explore Programmes
                <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Magnetic>
            <Magnetic strength={0.18} className="w-full sm:w-auto">
              <Link
                href="/contact"
                className="inline-flex w-full items-center justify-center rounded-full border border-rule bg-paper px-6 py-4 text-[length:var(--text-sm)] font-medium text-ink transition-colors duration-300 hover:border-ink sm:w-auto sm:px-7 sm:py-3.5"
              >
                Request a Callback
              </Link>
            </Magnetic>
          </motion.div>

          <motion.dl
            className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-rule pt-6 sm:mt-14 sm:gap-6 sm:pt-7"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.75 }}
          >
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="font-display text-[length:var(--text-2xl)] leading-none text-ink">
                  {s.static ?? <Counter value={s.value} suffix={s.suffix} />}
                </dt>
                <dd className="mt-1.5 text-[length:var(--text-2xs)] uppercase tracking-[0.12em] text-mist">
                  {s.label}
                </dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        {/* Imagery */}
        <motion.div
          style={{ y: plateY }}
          className="relative mt-9 lg:col-span-7 lg:mt-0"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <motion.div
            className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-rule bg-linen shadow-lift sm:aspect-[16/10]"
            initial={{ opacity: 0, y: 34, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.05, delay: 0.2, ease: EASE }}
          >
            {/* Over-sized so the parallax shift never exposes an edge. */}
            <motion.div style={{ y: imageY }} className="absolute -inset-y-[12%] inset-x-0">
              {video ? (
                <VideoFeature
                  video={video}
                  priority
                  aspect="absolute inset-0"
                  rounded="rounded-none"
                  className="border-0"
                />
              ) : (
                <AnimatePresence mode="sync">
                  <motion.div
                    key={index}
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: 1.08 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: EASE }}
                  >
                    <Media
                      src={slides[index]}
                      fill
                      priority={index === 0}
                      sizes="(max-width: 1024px) 100vw, 58vw"
                      className="object-cover"
                    />
                  </motion.div>
                </AnimatePresence>
              )}
            </motion.div>

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent" />

            {/* Controls, only meaningful when there is more than one still */}
            <div
              className={`absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 p-3.5 sm:p-5 ${
                video || count < 2 ? 'hidden' : ''
              }`}
            >
              <div className="flex items-center gap-1.5" role="tablist" aria-label="Slides">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    aria-label={`Slide ${i + 1}`}
                    onClick={() => go(i)}
                    className="group flex h-11 items-center px-1.5"
                  >
                    <span
                      className={`block h-[3px] overflow-hidden rounded-full transition-all duration-500 ${
                        i === index ? 'w-9 bg-paper/40' : 'w-3 bg-paper/45 group-hover:bg-paper/80'
                      }`}
                    >
                      {i === index && (
                        <motion.span
                          key={`${index}-${paused}`}
                          className="block h-full origin-left rounded-full bg-paper"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: INTERVAL / 1000, ease: 'linear' }}
                        />
                      )}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                {[
                  { label: 'Previous slide', delta: -1, d: 'M8 1.5L3.5 6 8 10.5' },
                  { label: 'Next slide', delta: 1, d: 'M4 1.5L8.5 6 4 10.5' },
                ].map((b) => (
                  <button
                    key={b.label}
                    type="button"
                    aria-label={b.label}
                    onClick={() => go(index + b.delta)}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-paper/85 text-ink backdrop-blur transition-all duration-300 hover:scale-105 hover:bg-paper hover:text-brand"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                      <path
                        d={b.d}
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

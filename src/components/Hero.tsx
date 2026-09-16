'use client';

import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { EASE } from './Motion';
import { Media } from './Media';
import { VideoFeature } from './VideoFeature';
import type { VideoSlot } from '@/lib/media';

const INTERVAL = 6400;

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

/**
 * The opening band of the home page.
 *
 * It used to run an eyebrow, a three-line display headline, a paragraph, two
 * buttons and a strip of statistics down the left of a full-height image. On a
 * phone that stack alone was two and a half screens before a visitor reached
 * anything about the institute, and the same two calls to action appear again
 * in the header, the drawer and the enquiry section further down the page.
 *
 * What is left is what an institution's front door is actually for: its name,
 * one line saying what it teaches and how, and a picture of the place. The
 * heading is the institute's own name rather than a slogan, which is also the
 * `h1` a search engine should find here.
 */
export function Hero({
  slides,
  video = null,
}: {
  slides: string[];
  /** When a film exists it replaces the carousel: it says more than six stills. */
  video?: VideoSlot | null;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;
  const ref = useRef<HTMLElement>(null);

  /* The picture drifts a little against the frame as the band scrolls away.
     The copy no longer moves with it: at this height there is not enough travel
     for the effect to read as anything but a wobble. */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);

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
      className="relative overflow-hidden bg-paper"
      /* A single still is not a carousel, and announcing it as one sends a
         screen reader looking for controls that are not there. */
      aria-roledescription={count > 1 ? 'carousel' : undefined}
      aria-label="Campus highlights"
    >
      <div className="shell grid gap-6 pb-7 pt-5 sm:gap-8 sm:pb-10 sm:pt-7 lg:grid-cols-12 lg:items-center lg:gap-12 lg:pb-14 lg:pt-10">
        {/* Imagery. First on a phone -- a photograph of the place says where you
            have arrived faster than a line of type does, and it puts something
            recognisable above the fold at any screen height. */}
        <motion.div
          className="order-1 lg:order-2 lg:col-span-7"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <motion.div
            className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-rule bg-linen shadow-lift sm:aspect-[16/9]"
            initial={{ opacity: 0, y: 24, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.95, delay: 0.1, ease: EASE }}
          >
            {/* Over-sized so the parallax shift never exposes an edge. */}
            <motion.div style={{ y: imageY }} className="absolute -inset-y-[10%] inset-x-0">
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
                    initial={{ opacity: 0, scale: 1.06 }}
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

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent" />

            {/* Controls, only meaningful when there is more than one still */}
            <div
              className={`absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 p-3 sm:p-4 ${
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

        {/* Name and one line. Nothing else. */}
        <div className="order-2 lg:order-1 lg:col-span-5">
          <motion.h1
            className="text-[length:var(--text-4xl)] leading-[1.1]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.16, ease: EASE }}
          >
            Vivekananda Institute of Management Science and Technology
          </motion.h1>

          <motion.p
            className="mt-3.5 max-w-[46ch] text-[length:var(--text-base)] leading-relaxed text-slate sm:mt-5 sm:text-[length:var(--text-lg)]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
          >
            Engineering, management, science and commerce, taught by distance learning
            in Andhra Pradesh since 1998 &mdash; so a degree fits around the work you
            are already doing.
          </motion.p>
        </div>
      </div>
    </section>
  );
}

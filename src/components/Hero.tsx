'use client';

import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { EASE } from './Motion';
import { Media } from './Media';
import { VideoFeature } from './VideoFeature';
import type { HeroSlide } from '@/lib/content';
import type { VideoSlot } from '@/lib/media';

/** How long each photograph holds before the next one comes in. */
const INTERVAL = 6000;
/** The crossfade between two photographs, in seconds. */
const FADE = 1.1;
/** A horizontal drag longer than this, in px, turns the carousel on a phone. */
const SWIPE = 40;

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
 * The opening band of the home page: the campus on the left, the notice board
 * on the right.
 *
 * It used to run an eyebrow, a display headline, a paragraph, two buttons and a
 * strip of statistics down the left of a full-height image -- two and a half
 * phone screens before a visitor reached anything about the institute. All of
 * that is gone. What replaces it is the thing people come back to a college
 * site for: what has been announced. The notice board used to sit a screen
 * further down, where a returning applicant had to go looking for it.
 *
 * No visible heading, so the `h1` is carried by a screen-reader-only element.
 * A page still needs one for search engines and for anyone navigating by
 * headings; it just does not need to be set in type here.
 *
 * `children` is the notice board, passed in rather than imported so it stays a
 * server component and out of this file's client bundle.
 */
export function Hero({
  slides,
  video = null,
  children,
}: {
  slides: HeroSlide[];
  /** When a film exists it replaces the carousel: it says more than six stills. */
  video?: VideoSlot | null;
  /** Rendered in the right-hand column beside the picture. */
  children?: ReactNode;
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

  /* Held while the tab is in the background, so nobody comes back to a
     carousel that has raced on without them. */
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  /* A timeout per slide rather than one interval, so a tap on a bar, an
     arrow or a swipe gives the new picture its full time instead of cutting
     it short on the old schedule. */
  const running = !paused && !hidden && count > 1 && !video;
  useEffect(() => {
    if (!running) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % count), INTERVAL);
    return () => clearTimeout(id);
  }, [running, index, count]);

  /* Swipe on a phone. Only a clearly horizontal drag counts, so a thumb
     scrolling the page past the picture never turns it by accident. */
  const touch = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touch.current;
    touch.current = null;
    if (!start || count < 2) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > SWIPE && Math.abs(dx) > Math.abs(dy) * 1.4) go(index + (dx < 0 ? 1 : -1));
  };

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-paper"
      /* A single still is not a carousel, and announcing it as one sends a
         screen reader looking for controls that are not there. */
      aria-roledescription={count > 1 ? 'carousel' : undefined}
      aria-label="Campus highlights"
    >
      <h1 className="sr-only">
        Vivekananda Institute of Management Science and Technology
      </h1>

      <div className="shell grid gap-4 pb-7 pt-5 sm:gap-6 sm:pb-10 sm:pt-7 lg:grid-cols-12 lg:items-stretch lg:gap-8 lg:pb-14 lg:pt-10">
        {/* Imagery. First on a phone too -- a photograph of the place says where
            you have arrived faster than any line of type does, and it puts
            something recognisable above the fold at any screen height. */}
        <motion.div
          /* Sideways drags here belong to the carousel, not the browser:
             without this a swipe to the right is also read as the browser's
             own back gesture and leaves the page. Vertical scrolling is
             untouched. */
          className="touch-pan-y overscroll-x-contain lg:col-span-7"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <motion.div
            /* Wider as the screen gets wider, so the picture and the notice
               board beside it finish at roughly the same line instead of the
               board trailing a few hundred pixels of blank paper. */
            className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-rule bg-linen shadow-lift sm:aspect-[16/9] lg:aspect-[2/1]"
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
                /* Every photograph is mounted from the start and stacked, so
                   the next one has already loaded by the time it is asked
                   for and a crossfade never fades into an empty frame. The
                   one showing drifts slowly closer while it holds; its zoom
                   only resets once it has faded out, so the reset is never
                   seen. */
                slides.map((slide, i) => {
                  const on = i === index;
                  return (
                    <motion.div
                      key={slide.src}
                      className="absolute inset-0"
                      aria-hidden={!on}
                      initial={false}
                      animate={{
                        opacity: on ? 1 : 0,
                        scale: on ? 1.07 : 1,
                        transition: {
                          opacity: { duration: FADE, ease: EASE },
                          scale: on
                            ? { duration: INTERVAL / 1000 + FADE, ease: 'linear' }
                            : { delay: FADE, duration: 0 },
                        },
                      }}
                      style={{ zIndex: on ? 1 : 0 }}
                    >
                      <Media
                        src={slide.src}
                        alt={slide.label}
                        fill
                        priority={i === 0}
                        loading={i === 0 ? undefined : 'eager'}
                        sizes="(max-width: 1024px) 100vw, 58vw"
                        className="object-cover"
                      />
                    </motion.div>
                  );
                })
              )}
            </motion.div>

            {/* Deeper at the foot, where the label and the controls sit, so
                white type reads over a sky or a white lab coat alike. */}
            <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-ink/65 via-ink/10 via-45% to-transparent" />

            {!video && count > 1 && (
              <div className="absolute inset-x-0 bottom-0 z-[3] flex items-end justify-between gap-3 p-3.5 sm:p-5">
                <div className="min-w-0">
                  {/* The label for the picture showing, in the site's gold
                      hairline style, brought in just after the picture. */}
                  <div className="relative h-5 overflow-hidden sm:h-6">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.p
                        key={index}
                        className="flex items-center gap-2 whitespace-nowrap text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.18em] text-paper sm:text-[length:var(--text-xs)]"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.25, ease: EASE } }}
                        exit={{ opacity: 0, y: -8, transition: { duration: 0.3, ease: EASE } }}
                      >
                        <span className="h-px w-5 bg-gold" aria-hidden />
                        {slides[index].label}
                        <span className="font-normal tabular-nums tracking-[0.1em] text-paper/60">
                          {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
                        </span>
                      </motion.p>
                    </AnimatePresence>
                  </div>

                  {/* Progress: the bar for the picture showing fills over its
                      time on screen, so the carousel says when it will move. */}
                  <div className="-mb-3 -ml-1.5 mt-0.5 flex items-center" role="tablist" aria-label="Slides">
                    {slides.map((slide, i) => (
                      <button
                        key={slide.src}
                        type="button"
                        role="tab"
                        aria-selected={i === index}
                        aria-label={`${slide.label}, slide ${i + 1} of ${count}`}
                        onClick={() => go(i)}
                        className="group flex h-9 items-center px-1.5 sm:h-11"
                      >
                        <span
                          className={`block h-[3px] overflow-hidden rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                            i === index ? 'w-10 bg-paper/35 sm:w-12' : 'w-4 bg-paper/50 group-hover:bg-paper/85'
                          }`}
                        >
                          {i === index && (
                            <motion.span
                              key={`${index}-${running}`}
                              className="block h-full origin-left rounded-full bg-paper"
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: running ? 1 : 0 }}
                              transition={{ duration: running ? INTERVAL / 1000 : 0, ease: 'linear' }}
                            />
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Arrows from the small breakpoint up. On a phone the frame is
                    too short to give two 44px buttons room without covering
                    the picture, and a swipe does the same job there. */}
                <div className="hidden shrink-0 items-center gap-2 sm:flex">
                  {[
                    { label: 'Previous slide', delta: -1, d: 'M8 1.5L3.5 6 8 10.5' },
                    { label: 'Next slide', delta: 1, d: 'M4 1.5L8.5 6 4 10.5' },
                  ].map((b) => (
                    <button
                      key={b.label}
                      type="button"
                      aria-label={b.label}
                      onClick={() => go(index + b.delta)}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-paper/30 bg-paper/15 text-paper backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-paper hover:bg-paper hover:text-brand"
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
            )}
          </motion.div>
        </motion.div>

        {/* The notice board, beside the picture from the small breakpoint up.
            On a phone it is not here at all: the home page renders it after
            the Director's Message, where it follows something worth reading
            rather than pushing the whole institute a screen further down. */}
        <motion.div
          className="hidden sm:block lg:col-span-5"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.24, ease: EASE }}
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}

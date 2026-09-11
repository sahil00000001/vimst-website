'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Media } from './Media';
import type { VideoSlot } from '@/lib/media';

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * A video that costs nothing until someone wants it.
 *
 * The poster image is all that loads on arrival — no video bytes, which on a
 * phone on mobile data is the difference between a page that opens and one
 * that stalls. The `<video>` element is only created on the first play.
 *
 * An `ambient` clip is the exception: silent, looping, no controls, treated as
 * moving wallpaper. Those start on their own **unless** the reader has asked
 * for reduced motion, in which case the poster simply stays — an autoplaying
 * loop is exactly the kind of thing that setting exists to stop.
 */
export function VideoFeature({
  video,
  className = '',
  aspect = 'aspect-video',
  rounded = 'rounded-2xl',
  priority = false,
}: {
  video: VideoSlot;
  className?: string;
  aspect?: string;
  rounded?: string;
  priority?: boolean;
}) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(false);
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  const ambient = Boolean(video.ambient) && !reduced;

  // An ambient loop only starts once it is actually on screen; there is no
  // sense decoding frames for something scrolled past.
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ambient || !wrapRef.current) return;
    const el = wrapRef.current;
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: '200px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ambient]);

  useEffect(() => {
    if (!active || !ref.current) return;
    const el = ref.current;
    // Autoplay can still be refused; falling back to the poster is fine.
    el.play().catch(() => {
      if (!ambient) setFailed(true);
    });
  }, [active, ambient]);

  const showVideo = active && !failed;

  return (
    <div
      ref={wrapRef}
      className={`relative overflow-hidden border border-rule bg-linen ${rounded} ${aspect} ${className}`}
    >
      <Media
        src={video.poster}
        alt={ambient ? '' : video.label}
        fill
        priority={priority}
        sizes="(max-width: 1024px) 100vw, 60vw"
        className={`object-cover transition-opacity duration-700 ${
          showVideo ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {showVideo && (
        <video
          ref={ref}
          className="absolute inset-0 h-full w-full object-cover"
          poster={video.poster}
          playsInline
          muted={ambient}
          loop={ambient}
          controls={!ambient}
          preload="auto"
          onError={() => setFailed(true)}
          aria-label={video.label}
        >
          {video.webm && <source src={video.webm} type="video/webm" />}
          <source src={video.src} type="video/mp4" />
        </video>
      )}

      {/* Play affordance, for anything that is not ambient wallpaper. */}
      <AnimatePresence>
        {!ambient && !active && (
          <motion.button
            type="button"
            onClick={() => setActive(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="group absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-t from-ink/45 via-ink/10 to-transparent focus-visible:outline-none"
            aria-label={`Play: ${video.label}`}
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-paper/95 text-ink shadow-[0_12px_40px_-12px_rgba(22,21,26,0.5)] backdrop-blur transition-all duration-300 group-hover:scale-105 group-hover:bg-paper group-focus-visible:ring-2 group-focus-visible:ring-paper sm:h-[72px] sm:w-[72px]">
              <svg width="22" height="24" viewBox="0 0 22 24" fill="currentColor" aria-hidden>
                <path d="M21 10.27a2 2 0 0 1 0 3.46L3.5 23.6A2 2 0 0 1 .5 21.86V2.14A2 2 0 0 1 3.5.4L21 10.27Z" />
              </svg>
            </span>
            <span className="rounded-full bg-ink/55 px-4 py-1.5 text-[length:var(--text-xs)] font-medium text-paper backdrop-blur">
              {video.label}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {failed && (
        <p className="absolute inset-x-0 bottom-0 bg-ink/70 px-4 py-2 text-center text-[length:var(--text-xs)] text-paper">
          This video could not be played.
        </p>
      )}
    </div>
  );
}

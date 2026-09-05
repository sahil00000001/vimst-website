'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { Stagger, StaggerItem } from './Motion';
import { Media } from './Media';

const EASE = [0.22, 1, 0.36, 1] as const;

export type GalleryImage = { src: string; alt: string };

export function Gallery({
  images,
  columns = 3,
  aspect = 'aspect-[4/3]',
}: {
  images: GalleryImage[];
  columns?: 3 | 4 | 5;
  aspect?: string;
}) {
  const [active, setActive] = useState<number | null>(null);

  const step = useCallback(
    (delta: number) =>
      setActive((i) => (i === null ? null : (i + delta + images.length) % images.length)),
    [images.length]
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActive(null);
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [active, step]);

  const cols = {
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
  }[columns];

  return (
    <>
      <Stagger className={`grid grid-cols-1 gap-4 ${cols}`} gap={0.035}>
        {images.map((img, i) => (
          <StaggerItem key={img.src + i}>
            <button
              type="button"
              onClick={() => setActive(i)}
              aria-label={img.alt || `Open image ${i + 1}`}
              className={`group relative block w-full overflow-hidden rounded-xl border border-rule bg-linen ${aspect}`}
            >
              <Media
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 45vw, 30vw"
                className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
              />
              <span className="absolute inset-0 bg-paper/0 transition-colors duration-500 group-hover:bg-paper/10" />
              <span className="absolute bottom-3 right-3 flex h-8 w-8 translate-y-2 items-center justify-center rounded-full bg-paper/92 text-ink opacity-0 backdrop-blur transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path
                    d="M6 1v10M1 6h10"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </button>
          </StaggerItem>
        ))}
      </Stagger>

      <AnimatePresence>
        {active !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm sm:p-8"
            onClick={() => setActive(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Image viewer"
          >
            <button
              type="button"
              onClick={() => setActive(null)}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-paper/15 text-paper transition-colors hover:bg-paper hover:text-ink sm:right-8 sm:top-8"
            >
              <svg width="14" height="14" viewBox="0 0 13 13" fill="none" aria-hidden>
                <path d="M1 1l11 11M12 1L1 12" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>

            {[
              { label: 'Previous', delta: -1, pos: 'left-3 sm:left-8', d: 'M8 1.5L3.5 6 8 10.5' },
              { label: 'Next', delta: 1, pos: 'right-3 sm:right-8', d: 'M4 1.5L8.5 6 4 10.5' },
            ].map((b) => (
              <button
                key={b.label}
                type="button"
                aria-label={b.label}
                onClick={(e) => {
                  e.stopPropagation();
                  step(b.delta);
                }}
                className={`absolute ${b.pos} top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-paper/15 text-paper transition-colors hover:bg-paper hover:text-ink`}
              >
                <svg width="13" height="13" viewBox="0 0 12 12" fill="none" aria-hidden>
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

            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
              className="relative h-[78vh] w-full max-w-5xl"
            >
              <Media
                src={images[active].src}
                alt={images[active].alt}
                fill
                sizes="90vw"
                className="rounded-lg object-contain"
              />
            </motion.div>

            <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[length:var(--text-sm)] tabular-nums text-paper/70">
              {active + 1} / {images.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

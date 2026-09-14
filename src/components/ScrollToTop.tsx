'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/**
 * Back-to-top control.
 *
 * A floating button inevitably covers whatever is beneath it, and on a narrow
 * screen that was body copy — it sat over the news ticker mid-sentence. So it
 * only appears when the reader scrolls **up**, which is when they want it, and
 * gets out of the way again as soon as they read on. That turns a permanent
 * obstruction into one that shows up on intent.
 */
export function ScrollToTop() {
  const [show, setShow] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;

      // Ignore sub-pixel jitter and momentum wobble.
      if (Math.abs(delta) > 4) {
        if (y < 600) setShow(false);
        else if (delta < 0) setShow(true);
        else setShow(false);
        lastY.current = y;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 10 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          className="fixed bottom-5 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-rule bg-paper/95 text-ink shadow-[0_10px_30px_-12px_rgba(22,21,26,0.35)] backdrop-blur transition-colors hover:border-brand hover:text-brand sm:bottom-8 sm:right-8 sm:h-12 sm:w-12"
        >
          <svg width="13" height="13" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path
              d="M6 10.5V1.5M1.5 6L6 1.5 10.5 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

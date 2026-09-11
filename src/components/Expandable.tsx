'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Collapses long passages on a phone behind a "Read more".
 *
 * On a 390px screen a five hundred word section is a very long column of short
 * lines, and the next heading can be two full swipes away. Clamping it keeps a
 * page scannable without hiding anything: the text is all in the HTML, so it
 * is still found by search engines and still read out in full by a screen
 * reader that ignores the visual clamp.
 *
 * The clamp itself is CSS, applied only below the `sm` breakpoint, so the
 * server and the client render exactly the same markup. Only the button is
 * decided in the browser, after measuring whether the content actually
 * overflows, because a "Read more" on a passage that already fits is worse
 * than no button at all.
 */
export function Expandable({
  children,
  /** Collapsed height on mobile. Roughly nine lines of body copy. */
  collapsedClass = 'max-h-[16rem]',
  className = '',
}: {
  children: React.ReactNode;
  collapsedClass?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      // Only ever clamped below `sm`; above it there is nothing to offer.
      if (window.matchMedia('(min-width: 640px)').matches) {
        setOverflows(false);
        return;
      }
      setOverflows(el.scrollHeight - el.clientHeight > 24);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [children]);

  const clamped = overflows && !open;

  return (
    <div className={className}>
      <div
        ref={ref}
        className={`relative overflow-hidden transition-[max-height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:max-h-none sm:overflow-visible ${
          open ? 'max-h-[400rem]' : collapsedClass
        }`}
      >
        {children}

        {/* Fades the cut edge so it reads as "continues" rather than "ends". */}
        {clamped && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-paper to-transparent sm:hidden"
            aria-hidden
          />
        )}
      </div>

      {overflows && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-[length:var(--text-sm)] font-medium text-crimson transition-opacity hover:opacity-70 sm:hidden"
        >
          {open ? 'Show less' : 'Read more'}
          <svg
            width="11"
            height="7"
            viewBox="0 0 9 6"
            fill="none"
            aria-hidden
            className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          >
            <path d="M1 1L4.5 4.5L8 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}

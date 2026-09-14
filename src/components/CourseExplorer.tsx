'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import type { Course } from '@/lib/content';
import { LEVEL_ORDER, STREAM_ORDER } from '@/lib/content';
import { CourseCard } from './CourseCard';

const EASE = [0.22, 1, 0.36, 1] as const;
const ALL = 'All';

function FilterRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 shrink-0 text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.1em] text-mist sm:w-16 sm:tracking-[0.14em]">
        {label}
      </span>
      <div
        className="mg-scroll scroll-hint -my-1 flex flex-1 items-center gap-1.5 overflow-x-auto py-1 sm:flex-wrap sm:gap-2 sm:overflow-visible"
        role="group"
        aria-label={label}
      >
      {[ALL, ...options].map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            aria-pressed={active}
            className={`relative shrink-0 whitespace-nowrap rounded-full px-3.5 py-2.5 text-[length:var(--text-sm)] transition-colors duration-300 sm:px-4 ${
              active ? 'text-paper' : 'text-graphite hover:text-ink'
            }`}
          >
            {active && (
              <motion.span
                layoutId={`filter-${label}`}
                className="absolute inset-0 rounded-full bg-brand"
                transition={{ duration: 0.4, ease: EASE }}
              />
            )}
            <span className="relative z-10">{opt}</span>
          </button>
        );
      })}
      </div>
    </div>
  );
}

export function CourseExplorer({ courses }: { courses: Course[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const [stream, setStream] = useState(params.get('stream') ?? ALL);
  const [level, setLevel] = useState(params.get('level') ?? ALL);
  const [query, setQuery] = useState('');

  /* Keep the URL in step so a filtered view can be linked and shared. */
  const sync = (next: { stream?: string; level?: string }) => {
    const s = next.stream ?? stream;
    const l = next.level ?? level;
    const sp = new URLSearchParams();
    if (s !== ALL) sp.set('stream', s);
    if (l !== ALL) sp.set('level', l);
    const qs = sp.toString();
    startTransition(() => router.replace(qs ? `/courses?${qs}` : '/courses', { scroll: false }));
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter((c) => {
      if (stream !== ALL && c.stream !== stream) return false;
      if (level !== ALL && c.level !== level) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        c.short.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q)
      );
    });
  }, [courses, stream, level, query]);

  const reset = () => {
    setStream(ALL);
    setLevel(ALL);
    setQuery('');
    startTransition(() => router.replace('/courses', { scroll: false }));
  };

  const dirty = stream !== ALL || level !== ALL || query !== '';

  return (
    <div>
      <div className="sticky top-[60px] z-30 -mx-5 mb-8 border-y border-rule bg-shell/95 px-5 py-3.5 backdrop-blur-md sm:top-[68px] sm:mb-10 sm:-mx-8 sm:px-8 sm:py-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3.5">
            <FilterRow
              label="Stream"
              options={[...STREAM_ORDER]}
              value={stream}
              onChange={(v) => {
                setStream(v);
                sync({ stream: v });
              }}
            />
            <FilterRow
              label="Level"
              options={LEVEL_ORDER}
              value={level}
              onChange={(v) => {
                setLevel(v);
                sync({ level: v });
              }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 sm:max-w-xs">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mist"
              >
                <circle cx="6" cy="6" r="4.6" stroke="currentColor" strokeWidth="1.4" />
                <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search programmes"
                aria-label="Search programmes"
                className="w-full rounded-full border border-rule bg-paper py-2.5 pl-10 pr-4 text-[length:var(--text-sm)] text-ink transition-colors placeholder:text-mist focus:border-brand focus:outline-none"
              />
            </div>

            <p className="text-[length:var(--text-sm)] tabular-nums text-slate" aria-live="polite">
              {filtered.length} {filtered.length === 1 ? 'programme' : 'programmes'}
            </p>

            <AnimatePresence>
              {dirty && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  onClick={reset}
                  className="text-[length:var(--text-sm)] text-brand underline underline-offset-4 transition-opacity hover:opacity-70"
                >
                  Clear filters
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-dashed border-rule bg-paper px-8 py-20 text-center"
        >
          <h3 className="text-[length:var(--text-xl)]">No programmes match that</h3>
          <p className="mx-auto mt-3 max-w-sm text-[length:var(--text-base)] text-slate">
            Try a different stream or level, or clear the filters to see everything on offer.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 rounded-full bg-brand px-6 py-3 text-[length:var(--text-sm)] font-medium text-paper transition-colors hover:bg-brand-deep"
          >
            Show all programmes
          </button>
        </motion.div>
      ) : (
        <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((c) => (
              <motion.div
                key={c.slug}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <CourseCard course={c} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';

const EASE = [0.22, 1, 0.36, 1] as const;

export function SpecializationList({ names }: { names: string[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return names;
    return names.filter((n) => n.toLowerCase().includes(q));
  }, [names, query]);

  return (
    <div>
      <div className="mb-9 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 sm:max-w-sm">
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
            placeholder="Search specializations"
            aria-label="Search specializations"
            className="w-full rounded-full border border-rule bg-shell py-2.5 pl-10 pr-4 text-[length:var(--text-sm)] text-ink transition-colors placeholder:text-mist focus:border-brand focus:bg-paper focus:outline-none"
          />
        </div>
        <p className="text-[length:var(--text-sm)] tabular-nums text-slate" aria-live="polite">
          {filtered.length} of {names.length}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-rule px-6 py-16 text-center text-[length:var(--text-base)] text-slate">
          No specialization matches &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <motion.ul
          layout
          className="grid gap-px overflow-hidden rounded-xl border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((name, i) => (
              <motion.li
                key={name}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.28, delay: Math.min(i * 0.008, 0.3), ease: EASE }}
                className="group flex items-baseline gap-3.5 bg-paper px-5 py-4 transition-colors duration-300 hover:bg-shell"
              >
                <span className="w-6 shrink-0 text-[length:var(--text-2xs)] tabular-nums text-mist">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-[length:var(--text-base)] leading-snug text-graphite transition-colors group-hover:text-ink">
                  {name}
                </span>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Banner, Card, PageHeading, Pill, Spinner } from './ui';

const EASE = [0.22, 1, 0.36, 1] as const;

type Stats = {
  studentCount: number;
  resultCount: number;
  publishedCount: number;
  batchCount: number;
  bySemester: { semester: string; count: number }[];
  recent: {
    rollNo: string;
    semester: string;
    percentage: number;
    finalResult: string;
    published: boolean;
    updatedAt: string;
  }[];
};

/** Counts up to `value` once, on mount. */
function Counter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) return setDisplay(0);
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / 900, 1);
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setDisplay(Math.round(eased * value));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <span className="tabular-nums">{display}</span>;
}

const QUICK_LINKS = [
  {
    href: '/admin/import',
    title: 'Bulk upload',
    body: 'Upload an Excel workbook to add or update many students and results at once.',
  },
  {
    href: '/admin/students',
    title: 'Students',
    body: 'Add, edit and search the student register.',
  },
  {
    href: '/admin/results',
    title: 'Results',
    body: 'Enter marks for a single student and publish or withhold a semester.',
  },
];

export function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/admin/stats');
        const json = await res.json();
        if (cancelled) return;
        if (json.ok) setStats(json.stats);
        else setError(json.error ?? 'Could not load statistics.');
      } catch {
        if (!cancelled) setError('Could not reach the server.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const tiles = stats
    ? [
        { label: 'Students', value: stats.studentCount, href: '/admin/students' },
        { label: 'Results', value: stats.resultCount, href: '/admin/results' },
        { label: 'Published', value: stats.publishedCount, href: '/admin/results' },
        { label: 'Batches', value: stats.batchCount, href: '/admin/students' },
      ]
    : [];

  const maxSemester = Math.max(1, ...(stats?.bySemester.map((s) => s.count) ?? [1]));

  return (
    <div>
      <PageHeading
        title="Dashboard"
        description="An overview of the student register and published results."
      />

      {error && (
        <div className="mb-6">
          <Banner tone="error">{error}</Banner>
        </div>
      )}

      {!stats && !error ? (
        <Spinner label="Loading statistics…" />
      ) : (
        stats && (
          <>
            <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {tiles.map((tile, i) => (
                <motion.div
                  key={tile.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
                >
                  <Link
                    href={tile.href}
                    className="group block rounded-xl border border-rule bg-paper p-6 transition-all duration-300 hover:-translate-y-1 hover:border-parchment hover:shadow-lift"
                  >
                    <p className="text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.14em] text-mist">
                      {tile.label}
                    </p>
                    <p className="mt-3 font-display text-[length:var(--text-4xl)] leading-none text-ink transition-colors group-hover:text-crimson">
                      <Counter value={tile.value} />
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-12">
              {/* Results by semester */}
              <Card className="p-6 lg:col-span-5" delay={0.1}>
                <h2 className="mb-1 font-display text-[length:var(--text-xl)]">
                  Results by semester
                </h2>
                <p className="mb-5 text-[length:var(--text-xs)] text-slate">
                  How many result records exist for each semester.
                </p>

                {stats.bySemester.length === 0 ? (
                  <p className="py-8 text-center text-[length:var(--text-sm)] text-mist">
                    No results uploaded yet.
                  </p>
                ) : (
                  <ul className="space-y-2.5">
                    {stats.bySemester.map((s, i) => (
                      <li key={s.semester} className="flex items-center gap-3">
                        <span className="w-10 shrink-0 text-[length:var(--text-xs)] font-medium text-graphite">
                          {s.semester}
                        </span>
                        <span className="h-2 flex-1 overflow-hidden rounded-full bg-linen">
                          <motion.span
                            className="block h-full rounded-full bg-crimson/70"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: s.count / maxSemester }}
                            transition={{ duration: 0.8, delay: 0.2 + i * 0.05, ease: EASE }}
                            style={{ originX: 0 }}
                          />
                        </span>
                        <span className="w-8 shrink-0 text-right text-[length:var(--text-xs)] tabular-nums text-slate">
                          {s.count}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              {/* Recent activity */}
              <Card className="lg:col-span-7" delay={0.16}>
                <div className="flex items-center justify-between gap-4 border-b border-rule px-6 py-4">
                  <h2 className="font-display text-[length:var(--text-xl)]">Recently updated</h2>
                  <Link
                    href="/admin/results"
                    className="text-[length:var(--text-xs)] font-medium text-crimson transition-opacity hover:opacity-70"
                  >
                    View all
                  </Link>
                </div>

                {stats.recent.length === 0 ? (
                  <p className="px-6 py-12 text-center text-[length:var(--text-sm)] text-mist">
                    Nothing uploaded yet. Start with a bulk upload.
                  </p>
                ) : (
                  <ul className="divide-y divide-rule-soft">
                    {stats.recent.map((r, i) => (
                      <motion.li
                        key={`${r.rollNo}-${r.semester}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 + i * 0.04, ease: EASE }}
                        className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-[length:var(--text-sm)] font-medium text-ink">
                            {r.rollNo}
                          </p>
                          <p className="text-[length:var(--text-2xs)] text-mist">
                            Semester {r.semester} · {r.percentage}%
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!r.published && <Pill tone="muted">Unpublished</Pill>}
                          <Pill tone={r.finalResult === 'PASS' ? 'pass' : 'fail'}>
                            {r.finalResult}
                          </Pill>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {QUICK_LINKS.map((q, i) => (
                <motion.div
                  key={q.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.24 + i * 0.06, ease: EASE }}
                >
                  <Link
                    href={q.href}
                    className="group flex h-full flex-col rounded-xl border border-rule bg-paper p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                  >
                    <h3 className="font-display text-[length:var(--text-lg)] text-ink transition-colors group-hover:text-crimson">
                      {q.title}
                    </h3>
                    <p className="mt-2 flex-1 text-[length:var(--text-xs)] leading-relaxed text-slate">
                      {q.body}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-[length:var(--text-xs)] font-medium text-ink">
                      Open
                      <svg width="12" height="9" viewBox="0 0 13 10" fill="none" aria-hidden>
                        <path
                          d="M1 5h10M7.5 1.5L11 5l-3.5 3.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                      </svg>
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </>
        )
      )}
    </div>
  );
}

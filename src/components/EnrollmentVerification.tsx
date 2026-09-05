'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState, type FormEvent } from 'react';
import type { StudentResult } from '@/app/api/verify-enrollment/route';

const EASE = [0.22, 1, 0.36, 1] as const;

const SEMESTERS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

type State =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'error'; message: string }
  | { phase: 'result'; data: StudentResult };

export function EnrollmentVerification() {
  const [state, setState] = useState<State>({ phase: 'idle' });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const params = new URLSearchParams({
      name: String(form.get('name') ?? ''),
      dob: String(form.get('dob') ?? ''),
      rollNo: String(form.get('rollNo') ?? ''),
      semester: String(form.get('semester') ?? ''),
    });

    setState({ phase: 'loading' });

    try {
      const res = await fetch(`/api/verify-enrollment?${params}`);
      const json = await res.json();
      if (json.ok) setState({ phase: 'result', data: json.data });
      else setState({ phase: 'error', message: json.error ?? 'Lookup failed.' });
    } catch {
      setState({
        phase: 'error',
        message: 'We could not reach the results service. Please try again.',
      });
    }
  }

  if (state.phase === 'result') {
    return <Marksheet data={state.data} onBack={() => setState({ phase: 'idle' })} />;
  }

  return (
    <div className="mx-auto max-w-xl">
      <form onSubmit={onSubmit} className="rounded-2xl border border-rule bg-paper p-7 sm:p-9">
        <p className="eyebrow mb-3">Students</p>
        <h2 className="mb-2 text-[length:var(--text-2xl)]">Verify your enrollment</h2>
        <p className="mb-8 text-[length:var(--text-base)] leading-relaxed text-slate">
          Enter your details exactly as they appear on your enrollment record to retrieve
          your semester result.
        </p>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="name">Student name</Label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              className={inputClass}
            />
          </div>

          <div>
            <Label htmlFor="rollNo">Roll number</Label>
            <input id="rollNo" name="rollNo" type="text" required className={inputClass} />
          </div>

          <div>
            <Label htmlFor="semester">Semester</Label>
            <select id="semester" name="semester" required defaultValue="" className={inputClass}>
              <option value="" disabled>
                Select semester
              </option>
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="dob">Date of birth</Label>
            <input id="dob" name="dob" type="date" required className={inputClass} />
          </div>
        </div>

        <AnimatePresence>
          {state.phase === 'error' && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              role="alert"
              className="mt-5 rounded-lg bg-crimson-soft px-4 py-3 text-[length:var(--text-sm)] text-crimson-deep"
            >
              {state.message}
            </motion.p>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={state.phase === 'loading'}
          className="mt-7 inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-ink px-8 py-4 text-[length:var(--text-sm)] font-medium text-paper transition-colors duration-300 hover:bg-crimson disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state.phase === 'loading' ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-paper/30 border-t-paper" />
              Checking records
            </>
          ) : (
            'Verify enrollment'
          )}
        </button>

        <p className="mt-4 text-center text-[length:var(--text-xs)] text-mist">
          Problems with your record? Email{' '}
          <a
            href="mailto:verification@mgimst.org"
            className="text-slate underline underline-offset-2 hover:text-crimson"
          >
            verification@mgimst.org
          </a>
        </p>
      </form>
    </div>
  );
}

const inputClass =
  'w-full rounded-lg border border-rule bg-shell px-4 py-3 text-[length:var(--text-base)] text-ink transition-all duration-300 focus:border-crimson focus:bg-paper focus:outline-none';

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-[length:var(--text-xs)] font-medium uppercase tracking-[0.1em] text-slate"
    >
      {children}
    </label>
  );
}

/* ------------------------------------------------------------------ */

function Marksheet({ data, onBack }: { data: StudentResult; onBack: () => void }) {
  const details: [string, string][] = [
    ['Name of the student', data.name],
    ['Date of birth', data.dob],
    ["Father's name", data.fatherName],
    ['Batch', data.batch],
    ['Semester', data.semester],
    ['Roll no.', data.rollNo],
    ['Class', data.class],
    ['Branch', data.branch],
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE }}
      className="mx-auto max-w-4xl"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <button
          type="button"
          onClick={onBack}
          className="group inline-flex items-center gap-2 text-[length:var(--text-sm)] font-medium text-graphite transition-colors hover:text-crimson"
        >
          <svg width="13" height="10" viewBox="0 0 13 10" fill="none" aria-hidden>
            <path
              d="M12 5H2M5.5 1.5L2 5l3.5 3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />
          </svg>
          Check another record
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-full border border-rule bg-paper px-5 py-2.5 text-[length:var(--text-sm)] font-medium text-ink transition-colors hover:border-ink"
        >
          Print marksheet
        </button>
      </div>

      <article className="overflow-hidden rounded-2xl border border-rule bg-paper print:border-0">
        <header className="border-b border-rule bg-linen px-6 py-8 text-center sm:px-10">
          <h2 className="font-display text-[length:var(--text-2xl)] text-crimson">
            Mahatma Gandhi
          </h2>
          <p className="mt-1 text-[length:var(--text-xs)] uppercase tracking-[0.18em] text-graphite">
            Institute of Management Science &amp; Technology
          </p>
          <p className="mt-4 inline-block rounded-full bg-paper px-4 py-1 text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.16em] text-crimson">
            Statement of marks
          </p>
        </header>

        <dl className="grid gap-px border-b border-rule bg-rule sm:grid-cols-2">
          {details.map(([label, value]) => (
            <div key={label} className="bg-paper px-6 py-4">
              <dt className="text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.14em] text-mist">
                {label}
              </dt>
              <dd className="mt-1 text-[length:var(--text-base)] text-ink">{value || '—'}</dd>
            </div>
          ))}
        </dl>

        {data.result.length > 0 && (
          <div className="mg-scroll overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="bg-linen">
                  {['Subject code', 'Subject', 'Total marks', 'Obtained', 'Marks in words'].map(
                    (h) => (
                      <th
                        key={h}
                        className="border-b border-rule px-5 py-3 text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.12em] text-slate"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {data.result.map((row, i) => (
                  <tr key={`${row.subjectCode}-${i}`} className="border-b border-rule-soft last:border-0">
                    <td className="px-5 py-3 text-[length:var(--text-sm)] tabular-nums text-slate">
                      {row.subjectCode}
                    </td>
                    <td className="px-5 py-3 text-[length:var(--text-base)] text-ink">{row.subject}</td>
                    <td className="px-5 py-3 text-[length:var(--text-sm)] tabular-nums text-graphite">
                      {row.totalMarks}
                    </td>
                    <td className="px-5 py-3 text-[length:var(--text-sm)] font-medium tabular-nums text-ink">
                      {row.obtainedMarks}
                    </td>
                    <td className="px-5 py-3 text-[length:var(--text-sm)] text-slate">{row.marksInWord}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="grid gap-px border-t border-rule bg-rule sm:grid-cols-3">
          {[
            ['Total marks in words', data.totalMarksInWord],
            ['Percentage', data.percentage],
            ['Final result', data.finalResult],
          ].map(([label, value]) => (
            <div key={label} className="bg-shell px-6 py-5">
              <p className="text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.14em] text-mist">
                {label}
              </p>
              <p className="mt-1.5 font-display text-[length:var(--text-lg)] text-ink">{value || '—'}</p>
            </div>
          ))}
        </div>

        <footer className="px-6 py-10 text-right sm:px-10">
          <p className="inline-block border-t border-ink pt-2 text-[length:var(--text-xs)] uppercase tracking-[0.14em] text-graphite">
            Signature of the Principal
          </p>
        </footer>
      </article>
    </motion.div>
  );
}

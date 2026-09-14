'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState, type FormEvent } from 'react';
import type { MarksheetData } from '@/lib/marksheet-pdf';
import type { SemesterSummary, StudentSummary } from '@/lib/results';

const EASE = [0.22, 1, 0.36, 1] as const;

type State =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'error'; message: string }
  | { phase: 'chooser'; student: StudentSummary; semesters: SemesterSummary[] }
  | { phase: 'marksheet'; data: MarksheetData };

type Identity = { rollNo: string; dob: string };

const inputClass =
  'w-full rounded-lg border border-rule bg-shell px-4 py-3 text-[length:var(--text-base)] text-ink transition-all duration-300 focus:border-brand focus:bg-paper focus:outline-none';

export function EnrollmentVerification() {
  const [state, setState] = useState<State>({ phase: 'idle' });
  const [identity, setIdentity] = useState<Identity>({ rollNo: '', dob: '' });

  async function lookup(next: Identity, semester?: string) {
    setIdentity(next);
    setState({ phase: 'loading' });

    const params = new URLSearchParams({ rollNo: next.rollNo, dob: next.dob });
    if (semester) params.set('semester', semester);

    try {
      const res = await fetch(`/api/verify-enrollment?${params}`);
      const json = await res.json();

      if (!json.ok) {
        setState({ phase: 'error', message: json.error ?? 'Lookup failed.' });
        return;
      }
      if (semester) setState({ phase: 'marksheet', data: json.data });
      else setState({ phase: 'chooser', student: json.student, semesters: json.semesters });
    } catch {
      setState({
        phase: 'error',
        message: 'We could not reach the results service. Please try again.',
      });
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    lookup({
      rollNo: String(form.get('rollNo') ?? '').trim(),
      dob: String(form.get('dob') ?? ''),
    });
  }

  const pdfHref = (semester: string) =>
    `/api/result-pdf?${new URLSearchParams({ ...identity, semester })}`;

  if (state.phase === 'marksheet') {
    return (
      <Marksheet
        data={state.data}
        pdfHref={pdfHref(state.data.semester)}
        onBack={() => lookup(identity)}
      />
    );
  }

  if (state.phase === 'chooser') {
    return (
      <SemesterChooser
        student={state.student}
        semesters={state.semesters}
        onOpen={(s) => lookup(identity, s)}
        pdfHref={pdfHref}
        onReset={() => setState({ phase: 'idle' })}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="mx-auto max-w-xl"
    >
      <form onSubmit={onSubmit} className="rounded-2xl border border-rule bg-paper p-7 sm:p-9">
        <p className="eyebrow mb-3">Students</p>
        <h2 className="mb-2 text-[length:var(--text-2xl)]">Check your result</h2>
        <p className="mb-8 text-[length:var(--text-base)] leading-relaxed text-slate">
          Enter your enrollment number and date of birth. You will see every semester published
          for you, and can download any of them as a PDF.
        </p>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="rollNo"
              className="mb-2 block text-[length:var(--text-xs)] font-medium uppercase tracking-[0.1em] text-slate"
            >
              Enrollment number<span className="ml-1 text-brand">*</span>
            </label>
            <input
              id="rollNo"
              name="rollNo"
              type="text"
              required
              autoFocus
              autoComplete="off"
              placeholder="e.g. VIM2024001"
              defaultValue={identity.rollNo}
              className={`${inputClass} font-medium tracking-wide placeholder:font-normal placeholder:tracking-normal placeholder:text-mist`}
            />
          </div>

          <div>
            <label
              htmlFor="dob"
              className="mb-2 block text-[length:var(--text-xs)] font-medium uppercase tracking-[0.1em] text-slate"
            >
              Date of birth<span className="ml-1 text-brand">*</span>
            </label>
            <input
              id="dob"
              name="dob"
              type="date"
              required
              defaultValue={identity.dob}
              className={inputClass}
            />
          </div>
        </div>

        <AnimatePresence>
          {state.phase === 'error' && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              role="alert"
              className="mt-5 rounded-lg bg-brand-soft px-4 py-3 text-[length:var(--text-sm)] text-brand-deep"
            >
              {state.message}
            </motion.p>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={state.phase === 'loading'}
          className="mt-7 inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-brand px-8 py-4 text-[length:var(--text-sm)] font-medium text-paper transition-colors duration-300 hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state.phase === 'loading' ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-paper/30 border-t-paper" />
              Checking records
            </>
          ) : (
            'Check result'
          )}
        </button>

        <p className="mt-4 text-center text-[length:var(--text-xs)] text-mist">
          Problems with your record? Email{' '}
          <a
            href="mailto:verification@vimst.org"
            className="-my-3 inline-block py-3 text-slate underline underline-offset-2 hover:text-brand"
          >
            verification@vimst.org
          </a>
        </p>
      </form>
    </motion.div>
  );
}

/* ------------------------------------------------------------------
   Semester chooser
   ------------------------------------------------------------------ */

function SemesterChooser({
  student,
  semesters,
  onOpen,
  pdfHref,
  onReset,
}: {
  student: StudentSummary;
  semesters: SemesterSummary[];
  onOpen: (semester: string) => void;
  pdfHref: (semester: string) => string;
  onReset: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="mx-auto max-w-3xl"
    >
      <div className="overflow-hidden rounded-2xl border border-rule bg-paper">
        <div className="border-b border-rule bg-linen px-6 py-6 sm:px-8">
          <p className="eyebrow mb-3">Record found</p>
          <h2 className="font-display text-[length:var(--text-2xl)]">{student.name}</h2>
          <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-[length:var(--text-sm)]">
            {[
              ['Enrollment no.', student.rollNo],
              ['Class', student.className],
              ['Branch', student.branch],
              ['Batch', student.batch],
            ]
              .filter(([, v]) => v)
              .map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[length:var(--text-2xs)] uppercase tracking-[0.12em] text-mist">
                    {label}
                  </dt>
                  <dd className="mt-0.5 text-graphite">{value}</dd>
                </div>
              ))}
          </dl>
        </div>

        {semesters.length === 0 ? (
          <div className="px-6 py-14 text-center sm:px-8">
            <h3 className="font-display text-[length:var(--text-xl)]">
              No results published yet
            </h3>
            <p className="mx-auto mt-3 max-w-sm text-[length:var(--text-sm)] text-slate">
              Your record exists, but no semester has been published for you so far. Please check
              again after the results are announced.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-rule-soft">
            {semesters.map((s, i) => (
              <motion.li
                key={s.semester}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.06 + i * 0.05, ease: EASE }}
                className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-shell sm:px-8"
              >
                <div className="min-w-0">
                  <p className="font-display text-[length:var(--text-lg)] text-ink">
                    Semester {s.semester}
                  </p>
                  <p className="mt-0.5 text-[length:var(--text-xs)] text-mist">
                    {s.subjectCount} subject{s.subjectCount === 1 ? '' : 's'} · {s.percentage}%
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className={`rounded-full px-3 py-1 text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.1em] ${
                      s.finalResult === 'PASS'
                        ? 'bg-[#e9f4ec] text-[#1d6b38]'
                        : 'bg-brand-soft text-brand-deep'
                    }`}
                  >
                    {s.finalResult}
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpen(s.semester)}
                    className="rounded-full bg-brand px-5 py-2.5 text-[length:var(--text-xs)] font-medium text-paper transition-colors hover:bg-brand-deep"
                  >
                    View
                  </button>
                  <a
                    href={pdfHref(s.semester)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-rule px-5 py-2.5 text-[length:var(--text-xs)] font-medium text-ink transition-colors hover:border-ink"
                  >
                    <DownloadIcon />
                    PDF
                  </a>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mx-auto mt-6 block text-[length:var(--text-sm)] font-medium text-graphite transition-colors hover:text-brand"
      >
        ← Check a different enrollment number
      </button>
    </motion.div>
  );
}

/* ------------------------------------------------------------------
   Marksheet
   ------------------------------------------------------------------ */

function Marksheet({
  data,
  pdfHref,
  onBack,
}: {
  data: MarksheetData;
  pdfHref: string;
  onBack: () => void;
}) {
  const details: [string, string][] = [
    ['Name of the student', data.name],
    ['Enrollment no.', data.rollNo],
    ["Father's name", data.fatherName || '-'],
    ['Date of birth', data.dob],
    ['Class', data.className || '-'],
    ['Batch', data.batch || '-'],
    ['Branch', data.branch || '-'],
    ['Semester', data.semester],
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
          className="group inline-flex items-center gap-2 text-[length:var(--text-sm)] font-medium text-graphite transition-colors hover:text-brand"
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
          All semesters
        </button>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-full border border-rule bg-paper px-5 py-2.5 text-[length:var(--text-sm)] font-medium text-ink transition-colors hover:border-ink"
          >
            Print
          </button>
          <a
            href={pdfHref}
            className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-[length:var(--text-sm)] font-medium text-paper transition-colors hover:bg-brand-deep"
          >
            <DownloadIcon />
            Download PDF
          </a>
        </div>
      </div>

      <article className="overflow-hidden rounded-2xl border border-rule bg-paper print:border-0">
        <header className="border-b border-rule bg-linen px-6 py-8 text-center sm:px-10">
          <h2 className="font-display text-[length:var(--text-2xl)] text-brand">
            Vivekananda
          </h2>
          <p className="mt-1 text-[length:var(--text-xs)] uppercase tracking-[0.18em] text-graphite">
            Institute of Management Science and Technology
          </p>
          <p className="mt-4 inline-block rounded-full bg-paper px-4 py-1 text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.16em] text-brand">
            Statement of marks
          </p>
        </header>

        <dl className="grid gap-px border-b border-rule bg-rule sm:grid-cols-2">
          {details.map(([label, value]) => (
            <div key={label} className="bg-paper px-6 py-4">
              <dt className="text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.14em] text-mist">
                {label}
              </dt>
              <dd className="mt-1 text-[length:var(--text-base)] text-ink">{value}</dd>
            </div>
          ))}
        </dl>

        {data.subjects.length > 0 && (
          <div className="mg-scroll overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-left">
              <thead>
                <tr className="bg-linen">
                  {['Code', 'Subject', 'Max', 'Obtained', 'Result'].map((h, i) => (
                    <th
                      key={h}
                      className={`border-b border-rule px-5 py-3 text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.12em] text-slate ${
                        i > 1 ? 'text-right' : ''
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.subjects.map((row, i) => {
                  const ratio = row.totalMarks > 0 ? row.obtainedMarks / row.totalMarks : 0;
                  return (
                    <tr
                      key={`${row.subjectCode}-${i}`}
                      className="border-b border-rule-soft last:border-0"
                    >
                      <td className="px-5 py-3 text-[length:var(--text-sm)] tabular-nums text-slate">
                        {row.subjectCode || '-'}
                      </td>
                      <td className="px-5 py-3 text-[length:var(--text-base)] text-ink">
                        {row.subject}
                      </td>
                      <td className="px-5 py-3 text-right text-[length:var(--text-sm)] tabular-nums text-graphite">
                        {row.totalMarks}
                      </td>
                      <td className="px-5 py-3 text-right text-[length:var(--text-sm)] font-medium tabular-nums text-ink">
                        {row.obtainedMarks}
                      </td>
                      <td
                        className={`px-5 py-3 text-right text-[length:var(--text-xs)] font-medium ${
                          ratio >= 0.35 ? 'text-[#1d6b38]' : 'text-brand'
                        }`}
                      >
                        {ratio >= 0.35 ? 'Pass' : 'Fail'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-linen font-medium">
                  <td className="px-5 py-3" />
                  <td className="px-5 py-3 text-[length:var(--text-sm)] uppercase tracking-[0.1em] text-slate">
                    Total
                  </td>
                  <td className="px-5 py-3 text-right text-[length:var(--text-sm)] tabular-nums text-ink">
                    {data.totalMarks}
                  </td>
                  <td className="px-5 py-3 text-right text-[length:var(--text-sm)] tabular-nums text-ink">
                    {data.obtainedMarks}
                  </td>
                  <td className="px-5 py-3 text-right text-[length:var(--text-sm)] tabular-nums text-ink">
                    {data.percentage}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        <div className="grid gap-px border-t border-rule bg-rule sm:grid-cols-3">
          {[
            ['Total marks in words', data.totalMarksInWord],
            ['Percentage', `${data.percentage}%`],
            ['Final result', data.finalResult],
          ].map(([label, value]) => (
            <div key={label} className="bg-shell px-6 py-5">
              <p className="text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.14em] text-mist">
                {label}
              </p>
              <p
                className={`mt-1.5 font-display text-[length:var(--text-lg)] ${
                  label === 'Final result' && data.finalResult !== 'PASS'
                    ? 'text-brand'
                    : 'text-ink'
                }`}
              >
                {value}
              </p>
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

function DownloadIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 20 20" fill="none" aria-hidden className="shrink-0">
      <path
        d="M10 3v10m0 0 3.5-3.5M10 13 6.5 9.5M3.5 14v2.5a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V14"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

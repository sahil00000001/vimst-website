'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useRef, useState, type DragEvent } from 'react';
import { Banner, Button, Card, PageHeading, Pill } from './ui';

const EASE = [0.22, 1, 0.36, 1] as const;

type Issue = { sheet: string; row: number; message: string };

type Preview = {
  summary: {
    studentsInFile: number;
    studentsNew: number;
    studentsUpdated: number;
    resultsInFile: number;
    subjectRows: number;
    orphanRollNos: string[];
  };
  students: { rollNo: string; name: string; dob: string; batch: string }[];
  results: {
    rollNo: string;
    semester: string;
    subjectCount: number;
    percentage: number;
    finalResult: string;
  }[];
  issues: Issue[];
};

type Committed = {
  summary: {
    studentsWritten: number;
    studentsInFile: number;
    resultsWritten: number;
    resultsInFile: number;
    skippedResults: string[];
  };
  issues: Issue[];
};

const STEPS = ['Choose file', 'Review', 'Upload'] as const;

export function BulkUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [committed, setCommitted] = useState<Committed | null>(null);

  const step = committed ? 2 : preview ? 1 : 0;

  function reset() {
    setFile(null);
    setPreview(null);
    setCommitted(null);
    setError(null);
    setIssues([]);
    if (inputRef.current) inputRef.current.value = '';
  }

  function choose(next: File | null) {
    setPreview(null);
    setCommitted(null);
    setError(null);
    setIssues([]);
    setFile(next);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) choose(dropped);
  }

  async function send(mode: 'preview' | 'commit') {
    if (!file) return;

    setBusy(true);
    setError(null);

    const body = new FormData();
    body.append('file', file);
    body.append('mode', mode);

    try {
      const res = await fetch('/api/admin/import', { method: 'POST', body });
      const json = await res.json();

      if (!json.ok) {
        setError(json.error ?? 'The upload failed.');
        setIssues(json.issues ?? []);
        return;
      }

      if (mode === 'preview') setPreview(json as Preview);
      else setCommitted(json as Committed);
    } catch {
      setError('Could not reach the server. The file may be too large.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeading
        title="Bulk upload"
        description="Add or update many students and results in one go from an Excel workbook. Uploading the same roll number again updates that record rather than duplicating it."
        action={
          <a
            href="/api/admin/template"
            className="inline-flex items-center gap-2 rounded-lg border border-rule bg-paper px-4 py-2.5 text-[length:var(--text-sm)] font-medium text-ink transition-colors hover:border-ink"
          >
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path
                d="M10 3v10m0 0 3.5-3.5M10 13 6.5 9.5M3.5 14v2.5a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Download template
          </a>
        }
      />

      {/* Stepper */}
      <div className="mb-6 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[length:var(--text-2xs)] font-semibold transition-colors duration-300 ${
                i <= step ? 'bg-crimson text-paper' : 'bg-linen text-mist'
              }`}
            >
              {i + 1}
            </span>
            <span
              className={`hidden text-[length:var(--text-xs)] font-medium transition-colors sm:block ${
                i <= step ? 'text-ink' : 'text-mist'
              }`}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <span className="h-px flex-1 overflow-hidden bg-rule">
                <motion.span
                  className="block h-full bg-crimson"
                  initial={false}
                  animate={{ scaleX: i < step ? 1 : 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  style={{ originX: 0 }}
                />
              </span>
            )}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {error && (
          <div className="mb-4">
            <Banner tone="error" onDismiss={() => setError(null)}>
              {error}
            </Banner>
          </div>
        )}
      </AnimatePresence>

      {/* Step 3: done */}
      {committed ? (
        <Card className="p-7">
          <motion.span
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#e9f4ec] text-[#1d6b38]"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <motion.path
                d="M5 12.5l4.5 4.5L19 7.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              />
            </svg>
          </motion.span>

          <h2 className="font-display text-[length:var(--text-2xl)]">Upload complete</h2>
          <p className="mt-2 text-[length:var(--text-sm)] text-slate">
            {committed.summary.studentsWritten} student record
            {committed.summary.studentsWritten === 1 ? '' : 's'} and{' '}
            {committed.summary.resultsWritten} result
            {committed.summary.resultsWritten === 1 ? '' : 's'} written.
          </p>

          {committed.summary.skippedResults.length > 0 && (
            <div className="mt-5">
              <Banner tone="info">
                <p className="font-medium">
                  {committed.summary.skippedResults.length} result
                  {committed.summary.skippedResults.length === 1 ? '' : 's'} skipped: no matching
                  student.
                </p>
                <p className="mt-1 text-[length:var(--text-xs)]">
                  {committed.summary.skippedResults.slice(0, 12).join(', ')}
                  {committed.summary.skippedResults.length > 12 ? ' …' : ''}
                </p>
              </Banner>
            </div>
          )}

          <IssueList issues={committed.issues} />

          <div className="mt-6 flex flex-wrap gap-2.5">
            <Button type="button" onClick={reset}>
              Upload another file
            </Button>
            <a
              href="/admin/results"
              className="inline-flex items-center rounded-lg border border-rule bg-paper px-4 py-2.5 text-[length:var(--text-sm)] font-medium text-ink transition-colors hover:border-ink"
            >
              View results
            </a>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {/* Drop zone */}
            <Card className="p-6">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors duration-300 ${
                  dragging ? 'border-crimson bg-crimson-soft/40' : 'border-rule bg-shell'
                }`}
              >
                <motion.div
                  animate={{ y: dragging ? -4 : 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-paper text-crimson"
                >
                  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden>
                    <path
                      d="M10 13.5V3.5m0 0L6.5 7M10 3.5 13.5 7M3.5 13v3a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.div>

                {file ? (
                  <>
                    <p className="font-display text-[length:var(--text-lg)] text-ink">
                      {file.name}
                    </p>
                    <p className="mt-1 text-[length:var(--text-xs)] text-mist">
                      {(file.size / 1024).toFixed(0)} KB
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-display text-[length:var(--text-lg)] text-ink">
                      Drop an .xlsx workbook here
                    </p>
                    <p className="mt-1 text-[length:var(--text-xs)] text-mist">
                      or choose one from your computer. Up to 8 MB
                    </p>
                  </>
                )}

                <input
                  ref={inputRef}
                  type="file"
                  accept=".xlsx"
                  className="sr-only"
                  onChange={(e) => choose(e.target.files?.[0] ?? null)}
                />

                <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => inputRef.current?.click()}
                  >
                    {file ? 'Choose a different file' : 'Choose file'}
                  </Button>
                  {file && !preview && (
                    <Button type="button" onClick={() => send('preview')} loading={busy}>
                      Review this file
                    </Button>
                  )}
                  {file && preview && (
                    <Button type="button" onClick={() => send('commit')} loading={busy}>
                      Confirm and upload
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Preview */}
            <AnimatePresence>
              {preview && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="mt-4 space-y-4"
                >
                  <Card className="p-6">
                    <h2 className="mb-4 font-display text-[length:var(--text-xl)]">
                      What this file will do
                    </h2>

                    <div className="grid gap-px overflow-hidden rounded-lg border border-rule bg-rule sm:grid-cols-4">
                      {[
                        { label: 'New students', value: preview.summary.studentsNew },
                        { label: 'Updated students', value: preview.summary.studentsUpdated },
                        { label: 'Results', value: preview.summary.resultsInFile },
                        { label: 'Subject rows', value: preview.summary.subjectRows },
                      ].map((x) => (
                        <div key={x.label} className="bg-paper px-4 py-3.5">
                          <p className="text-[length:var(--text-2xs)] uppercase tracking-[0.12em] text-mist">
                            {x.label}
                          </p>
                          <p className="mt-1 font-display text-[length:var(--text-2xl)] tabular-nums text-ink">
                            {x.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {preview.summary.orphanRollNos.length > 0 && (
                      <div className="mt-4">
                        <Banner tone="info">
                          <p className="font-medium">
                            {preview.summary.orphanRollNos.length} roll number
                            {preview.summary.orphanRollNos.length === 1 ? '' : 's'} in the Marks
                            sheet have no student record and will be skipped.
                          </p>
                          <p className="mt-1 text-[length:var(--text-xs)]">
                            {preview.summary.orphanRollNos.slice(0, 12).join(', ')}
                            {preview.summary.orphanRollNos.length > 12 ? ' …' : ''}
                          </p>
                        </Banner>
                      </div>
                    )}

                    {preview.results.length > 0 && (
                      <div className="mt-5">
                        <p className="mb-2 text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.12em] text-slate">
                          Sample of the results found
                        </p>
                        <ul className="divide-y divide-rule-soft rounded-lg border border-rule">
                          {preview.results.map((r) => (
                            <li
                              key={`${r.rollNo}-${r.semester}`}
                              className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5"
                            >
                              <span className="text-[length:var(--text-sm)] text-graphite">
                                <span className="font-medium text-ink">{r.rollNo}</span> · semester{' '}
                                {r.semester} · {r.subjectCount} subject
                                {r.subjectCount === 1 ? '' : 's'}
                              </span>
                              <span className="flex items-center gap-2">
                                <span className="text-[length:var(--text-xs)] tabular-nums text-slate">
                                  {r.percentage}%
                                </span>
                                <Pill tone={r.finalResult === 'PASS' ? 'pass' : 'fail'}>
                                  {r.finalResult}
                                </Pill>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card>

                  <Card className="p-6">
                    <IssueList issues={preview.issues} inline />
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {!preview && issues.length > 0 && (
              <Card className="mt-4 p-6">
                <IssueList issues={issues} inline />
              </Card>
            )}
          </div>

          {/* Instructions */}
          <div className="lg:col-span-5">
            <Card className="p-6" delay={0.1}>
              <h2 className="mb-1 font-display text-[length:var(--text-xl)]">
                How the workbook is read
              </h2>
              <p className="mb-5 text-[length:var(--text-xs)] leading-relaxed text-slate">
                Download the template. It has the columns already set up, plus an example row on
                each sheet.
              </p>

              <div className="space-y-5">
                <div>
                  <p className="mb-2 text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.12em] text-crimson">
                    Sheet: Students
                  </p>
                  <code className="block overflow-x-auto rounded-lg bg-shell px-3.5 py-2.5 text-[length:var(--text-2xs)] text-graphite">
                    rollNo | name | fatherName | dob | batch | class | branch
                  </code>
                  <p className="mt-2 text-[length:var(--text-xs)] leading-relaxed text-slate">
                    <strong className="font-medium text-graphite">rollNo</strong>,{' '}
                    <strong className="font-medium text-graphite">name</strong> and{' '}
                    <strong className="font-medium text-graphite">dob</strong> are required. Dates
                    can be YYYY-MM-DD, DD/MM/YYYY, or a real Excel date cell.
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.12em] text-crimson">
                    Sheet: Marks
                  </p>
                  <code className="block overflow-x-auto rounded-lg bg-shell px-3.5 py-2.5 text-[length:var(--text-2xs)] text-graphite">
                    rollNo | semester | subjectCode | subject | totalMarks | obtainedMarks
                  </code>
                  <p className="mt-2 text-[length:var(--text-xs)] leading-relaxed text-slate">
                    One row per subject. Repeat the roll number and semester for each. Semester
                    accepts I–VIII or 1–8.
                  </p>
                </div>

                <ul className="space-y-2 border-t border-rule-soft pt-4">
                  {[
                    'Totals, percentage and pass/fail are calculated on upload.',
                    'A subject scoring under 35% fails that semester.',
                    'Results whose roll number has no student record are skipped.',
                    'Review always runs first. Nothing is written until you confirm.',
                  ].map((t) => (
                    <li
                      key={t}
                      className="flex gap-2.5 text-[length:var(--text-xs)] leading-relaxed text-slate"
                    >
                      <span
                        className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-crimson/50"
                        aria-hidden
                      />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function IssueList({ issues, inline }: { issues: Issue[]; inline?: boolean }) {
  if (issues.length === 0) {
    return inline ? (
      <p className="text-[length:var(--text-sm)] text-slate">
        Every row was read successfully. No issues found.
      </p>
    ) : null;
  }

  return (
    <div className={inline ? '' : 'mt-5'}>
      <p className="mb-2.5 text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.12em] text-crimson">
        {issues.length} row{issues.length === 1 ? '' : 's'} could not be read
      </p>
      <ul className="mg-scroll max-h-64 space-y-1.5 overflow-y-auto rounded-lg bg-shell p-3">
        {issues.map((issue, i) => (
          <li key={i} className="text-[length:var(--text-xs)] leading-relaxed text-graphite">
            <span className="font-medium text-crimson-deep">
              {issue.sheet} row {issue.row}
            </span>{' '}
            · {issue.message}
          </li>
        ))}
      </ul>
      <p className="mt-2.5 text-[length:var(--text-xs)] text-mist">
        These rows are skipped. Everything else still uploads.
      </p>
    </div>
  );
}

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import {
  Banner,
  Button,
  ConfirmModal,
  EmptyState,
  Field,
  Modal,
  PageHeading,
  Pill,
  Spinner,
  inputClass,
} from './ui';

const EASE = [0.22, 1, 0.36, 1] as const;
const SEMESTERS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

type Subject = {
  subjectCode: string;
  subject: string;
  totalMarks: number | string;
  obtainedMarks: number | string;
};

type Result = {
  _id: string;
  rollNo: string;
  semester: string;
  subjects: Subject[];
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  finalResult: string;
  published: boolean;
  studentName: string | null;
};

const BLANK_SUBJECT: Subject = {
  subjectCode: '',
  subject: '',
  totalMarks: 100,
  obtainedMarks: '',
};

export function ResultsManager() {
  const [items, setItems] = useState<Result[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [semester, setSemester] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rollNo, setRollNo] = useState('');
  const [sem, setSem] = useState('I');
  const [published, setPublished] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([{ ...BLANK_SUBJECT }]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Result | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [publishing, setPublishing] = useState<{ publish: boolean } | null>(null);
  const [publishBusy, setPublishBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (query.trim()) params.set('q', query.trim());
      if (semester) params.set('semester', semester);

      const res = await fetch(`/api/admin/results?${params}`);
      const json = await res.json();
      if (json.ok) {
        setItems(json.items);
        setTotal(json.total);
        setPages(json.pages);
      } else {
        setError(json.error ?? 'Could not load results.');
      }
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }, [page, query, semester]);

  useEffect(() => {
    const id = setTimeout(load, query ? 300 : 0);
    return () => clearTimeout(id);
  }, [load, query]);

  useEffect(() => setPage(1), [query, semester]);

  function openCreate() {
    setEditingId(null);
    setRollNo('');
    setSem('I');
    setPublished(true);
    setSubjects([{ ...BLANK_SUBJECT }]);
    setFormError(null);
    setEditorOpen(true);
  }

  function openEdit(result: Result) {
    setEditingId(result._id);
    setRollNo(result.rollNo);
    setSem(result.semester);
    setPublished(result.published);
    setSubjects(result.subjects.map((s) => ({ ...s })));
    setFormError(null);
    setEditorOpen(true);
  }

  /* Totals shown live in the editor, using the same rule the server applies. */
  const preview = (() => {
    const rows = subjects.filter((s) => s.subject.trim());
    const totalMarks = rows.reduce((a, s) => a + (Number(s.totalMarks) || 0), 0);
    const obtained = rows.reduce((a, s) => a + (Number(s.obtainedMarks) || 0), 0);
    const percentage = totalMarks > 0 ? Math.round((obtained / totalMarks) * 10000) / 100 : 0;
    const failed = rows.some(
      (s) => Number(s.totalMarks) > 0 && Number(s.obtainedMarks) / Number(s.totalMarks) < 0.35
    );
    return {
      totalMarks,
      obtained,
      percentage,
      finalResult: rows.length === 0 ? '—' : failed || percentage < 35 ? 'FAIL' : 'PASS',
    };
  })();

  async function save() {
    setSaving(true);
    setFormError(null);

    const payload = {
      rollNo,
      semester: sem,
      published,
      subjects: subjects
        .filter((s) => s.subject.trim())
        .map((s) => ({
          subjectCode: s.subjectCode,
          subject: s.subject,
          totalMarks: Number(s.totalMarks),
          obtainedMarks: Number(s.obtainedMarks),
        })),
    };

    try {
      const res = await fetch(
        editingId ? `/api/admin/results/${editingId}` : '/api/admin/results',
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const json = await res.json();

      if (json.ok) {
        setEditorOpen(false);
        setNotice(`${payload.rollNo} — semester ${payload.semester} saved.`);
        load();
      } else {
        setFormError(json.error ?? 'Could not save.');
      }
    } catch {
      setFormError('Could not reach the server.');
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      const res = await fetch(`/api/admin/results/${deleting._id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.ok) {
        setNotice(`${deleting.rollNo} — semester ${deleting.semester} deleted.`);
        setDeleting(null);
        load();
      } else {
        setError(json.error ?? 'Could not delete.');
      }
    } catch {
      setError('Could not reach the server.');
    } finally {
      setDeleteBusy(false);
    }
  }

  async function applyPublish() {
    if (!publishing || !semester) return;
    setPublishBusy(true);
    try {
      const res = await fetch('/api/admin/results/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ semester, publish: publishing.publish }),
      });
      const json = await res.json();
      if (json.ok) {
        setNotice(
          json.changed === 0
            ? `Semester ${semester} was already ${publishing.publish ? 'published' : 'withheld'}.`
            : `${json.changed} result${json.changed === 1 ? '' : 's'} ${
                publishing.publish ? 'published' : 'withheld'
              }.`
        );
        setPublishing(null);
        load();
      } else {
        setError(json.error ?? 'Could not update.');
        setPublishing(null);
      }
    } catch {
      setError('Could not reach the server.');
      setPublishing(null);
    } finally {
      setPublishBusy(false);
    }
  }

  const updateSubject = (index: number, patch: Partial<Subject>) =>
    setSubjects((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  return (
    <div>
      <PageHeading
        title="Results"
        description="Semester marks. Anything not published stays hidden from the public verification page."
        action={
          <div className="flex flex-wrap gap-2.5">
            <a
              href={`/api/admin/export${semester ? `?semester=${semester}` : ''}`}
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
              Export
            </a>
            <Button type="button" onClick={openCreate}>
              Add result
            </Button>
          </div>
        }
      />

      <AnimatePresence>
        {error && (
          <div className="mb-4">
            <Banner tone="error" onDismiss={() => setError(null)}>
              {error}
            </Banner>
          </div>
        )}
        {notice && (
          <div className="mb-4">
            <Banner tone="success" onDismiss={() => setNotice(null)}>
              {notice}
            </Banner>
          </div>
        )}
      </AnimatePresence>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 sm:max-w-sm">
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
            placeholder="Search by roll number"
            aria-label="Search results"
            className={`${inputClass} pl-10`}
          />
        </div>

        <select
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          aria-label="Filter by semester"
          className={`${inputClass} w-auto min-w-[9rem]`}
        >
          <option value="">All semesters</option>
          {SEMESTERS.map((s) => (
            <option key={s} value={s}>
              Semester {s}
            </option>
          ))}
        </select>

        <p className="text-[length:var(--text-xs)] tabular-nums text-slate" aria-live="polite">
          {total} result{total === 1 ? '' : 's'}
        </p>

        {/* Results are entered over days and announced at once, so the useful
            action is releasing a whole semester. */}
        {semester && total > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              type="button"
              className="px-3 py-1.5"
              loading={publishBusy === true}
              onClick={() => setPublishing({ publish: true })}
            >
              Publish semester {semester}
            </Button>
            <Button
              variant="ghost"
              type="button"
              className="px-3 py-1.5"
              onClick={() => setPublishing({ publish: false })}
            >
              Withhold
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <Spinner label="Loading results…" />
      ) : items.length === 0 ? (
        <EmptyState
          title={query || semester ? 'No results match that' : 'No results yet'}
          description={
            query || semester
              ? 'Try a different roll number or semester.'
              : 'Enter marks for one student here, or upload a workbook from the Bulk upload screen.'
          }
          action={
            query || semester ? (
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setQuery('');
                  setSemester('');
                }}
              >
                Clear filters
              </Button>
            ) : (
              <Button type="button" onClick={openCreate}>
                Add the first result
              </Button>
            )
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-rule bg-paper">
          <div className="mg-scroll overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left">
              <thead>
                <tr className="bg-linen">
                  {['Roll no.', 'Student', 'Semester', 'Subjects', 'Marks', 'Result', ''].map(
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
                <AnimatePresence initial={false}>
                  {items.map((r, i) => (
                    <motion.tr
                      key={r._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, delay: Math.min(i * 0.02, 0.2), ease: EASE }}
                      className="border-b border-rule-soft transition-colors last:border-0 hover:bg-shell"
                    >
                      <td className="px-5 py-3 text-[length:var(--text-sm)] font-medium text-ink">
                        {r.rollNo}
                      </td>
                      <td className="px-5 py-3 text-[length:var(--text-sm)] text-graphite">
                        {r.studentName ?? <span className="text-mist">Unknown</span>}
                      </td>
                      <td className="px-5 py-3 text-[length:var(--text-sm)] text-slate">
                        {r.semester}
                      </td>
                      <td className="px-5 py-3 text-[length:var(--text-sm)] tabular-nums text-slate">
                        {r.subjects.length}
                      </td>
                      <td className="px-5 py-3 text-[length:var(--text-sm)] tabular-nums text-graphite">
                        {r.obtainedMarks}/{r.totalMarks}
                        <span className="ml-1.5 text-mist">({r.percentage}%)</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Pill tone={r.finalResult === 'PASS' ? 'pass' : 'fail'}>
                            {r.finalResult}
                          </Pill>
                          {!r.published && <Pill tone="muted">Hidden</Pill>}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            type="button"
                            className="px-2.5 py-1.5"
                            onClick={() => openEdit(r)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            type="button"
                            className="px-2.5 py-1.5 text-crimson"
                            onClick={() => setDeleting(r)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-between gap-4 border-t border-rule px-5 py-3">
              <Button
                variant="secondary"
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5"
              >
                Previous
              </Button>
              <p className="text-[length:var(--text-xs)] tabular-nums text-slate">
                Page {page} of {pages}
              </p>
              <Button
                variant="secondary"
                type="button"
                disabled={page >= pages}
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                className="px-3 py-1.5"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Editor */}
      <Modal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editingId ? `Edit ${rollNo} — semester ${sem}` : 'Add result'}
        wide
      >
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Roll number" htmlFor="r-roll" required>
              <input
                id="r-roll"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                required
                className={inputClass}
              />
            </Field>

            <Field label="Semester" htmlFor="r-sem" required>
              <select
                id="r-sem"
                value={sem}
                onChange={(e) => setSem(e.target.value)}
                className={inputClass}
              >
                {SEMESTERS.map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Visibility" htmlFor="r-pub" hint="Hidden results stay off the public page.">
              <select
                id="r-pub"
                value={published ? 'yes' : 'no'}
                onChange={(e) => setPublished(e.target.value === 'yes')}
                className={inputClass}
              >
                <option value="yes">Published</option>
                <option value="no">Hidden</option>
              </select>
            </Field>
          </div>

          {/* Subjects */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.12em] text-slate">
                Subjects
              </p>
              <Button
                variant="secondary"
                type="button"
                className="px-3 py-1.5"
                onClick={() => setSubjects((r) => [...r, { ...BLANK_SUBJECT }])}
              >
                Add subject
              </Button>
            </div>

            <div className="space-y-2">
              {subjects.map((s, i) => (
                <div
                  key={i}
                  className="grid items-center gap-2 rounded-lg border border-rule bg-shell p-2.5 sm:grid-cols-[7rem_1fr_5.5rem_5.5rem_2.25rem]"
                >
                  <input
                    value={s.subjectCode}
                    onChange={(e) => updateSubject(i, { subjectCode: e.target.value })}
                    placeholder="Code"
                    aria-label={`Subject ${i + 1} code`}
                    className={inputClass}
                  />
                  <input
                    value={s.subject}
                    onChange={(e) => updateSubject(i, { subject: e.target.value })}
                    placeholder="Subject name"
                    aria-label={`Subject ${i + 1} name`}
                    className={inputClass}
                  />
                  <input
                    type="number"
                    min={1}
                    value={s.totalMarks}
                    onChange={(e) => updateSubject(i, { totalMarks: e.target.value })}
                    placeholder="Total"
                    aria-label={`Subject ${i + 1} total marks`}
                    className={inputClass}
                  />
                  <input
                    type="number"
                    min={0}
                    value={s.obtainedMarks}
                    onChange={(e) => updateSubject(i, { obtainedMarks: e.target.value })}
                    placeholder="Got"
                    aria-label={`Subject ${i + 1} obtained marks`}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    aria-label={`Remove subject ${i + 1}`}
                    disabled={subjects.length === 1}
                    onClick={() => setSubjects((r) => r.filter((_, x) => x !== i))}
                    className="flex h-9 w-9 items-center justify-center justify-self-end rounded-lg text-slate transition-colors hover:bg-crimson-soft hover:text-crimson disabled:opacity-30"
                  >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
                      <path d="M1 1l11 11M12 1L1 12" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Live totals */}
          <div className="grid gap-px overflow-hidden rounded-lg border border-rule bg-rule sm:grid-cols-4">
            {[
              { label: 'Total marks', value: preview.totalMarks },
              { label: 'Obtained', value: preview.obtained },
              { label: 'Percentage', value: `${preview.percentage}%` },
              { label: 'Result', value: preview.finalResult },
            ].map((x) => (
              <div key={x.label} className="bg-paper px-4 py-3">
                <p className="text-[length:var(--text-2xs)] uppercase tracking-[0.12em] text-mist">
                  {x.label}
                </p>
                <p className="mt-1 font-display text-[length:var(--text-lg)] text-ink">{x.value}</p>
              </div>
            ))}
          </div>

          <AnimatePresence>{formError && <Banner tone="error">{formError}</Banner>}</AnimatePresence>

          <div className="flex justify-end gap-2.5">
            <Button variant="secondary" type="button" onClick={() => setEditorOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={save} loading={saving}>
              {editingId ? 'Save changes' : 'Add result'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={Boolean(publishing)}
        onClose={() => setPublishing(null)}
        onConfirm={applyPublish}
        loading={publishBusy}
        confirmLabel={publishing?.publish ? 'Publish' : 'Withhold'}
        title={publishing?.publish ? 'Publish semester' : 'Withhold semester'}
        body={
          publishing?.publish
            ? `Publish every semester ${semester} result? Students will be able to see and download them immediately.`
            : `Withhold every semester ${semester} result? They disappear from the public result page until published again.`
        }
      />

      <ConfirmModal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        loading={deleteBusy}
        title="Delete result"
        body={`Delete the semester ${deleting?.semester ?? ''} result for ${deleting?.rollNo ?? ''}? This cannot be undone.`}
      />
    </div>
  );
}

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  Banner,
  Button,
  ConfirmModal,
  EmptyState,
  Field,
  Modal,
  PageHeading,
  Spinner,
  inputClass,
} from './ui';

const EASE = [0.22, 1, 0.36, 1] as const;

type Student = {
  _id: string;
  rollNo: string;
  name: string;
  fatherName: string;
  dob: string;
  batch: string;
  className: string;
  branch: string;
};

const BLANK: Omit<Student, '_id'> = {
  rollNo: '',
  name: '',
  fatherName: '',
  dob: '',
  batch: '',
  className: '',
  branch: '',
};

export function StudentsManager() {
  const [items, setItems] = useState<Student[]>([]);
  const [batches, setBatches] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [batch, setBatch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [editing, setEditing] = useState<Student | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Student | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (query.trim()) params.set('q', query.trim());
      if (batch) params.set('batch', batch);

      const res = await fetch(`/api/admin/students?${params}`);
      const json = await res.json();
      if (json.ok) {
        setItems(json.items);
        setTotal(json.total);
        setPages(json.pages);
        setBatches(json.batches);
      } else {
        setError(json.error ?? 'Could not load students.');
      }
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }, [page, query, batch]);

  /* Debounced so typing in the search box does not fire a request per keystroke. */
  useEffect(() => {
    const id = setTimeout(load, query ? 300 : 0);
    return () => clearTimeout(id);
  }, [load, query]);

  useEffect(() => setPage(1), [query, batch]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;

    setSaving(true);
    setFormError(null);

    const url = editing
      ? `/api/admin/students/${encodeURIComponent(editing.rollNo)}`
      : '/api/admin/students';

    try {
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (json.ok) {
        setEditing(null);
        setCreating(false);
        setNotice(editing ? `${data.rollNo} updated.` : `${data.rollNo} added.`);
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
      const res = await fetch(`/api/admin/students/${encodeURIComponent(deleting.rollNo)}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.ok) {
        setNotice(
          `${deleting.rollNo} removed${
            json.removedResults ? `, along with ${json.removedResults} result(s)` : ''
          }.`
        );
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

  const current = editing ?? BLANK;
  const formOpen = creating || Boolean(editing);

  return (
    <div>
      <PageHeading
        title="Students"
        description="The student register. Roll number, name and date of birth are what a student enters to look up a result."
        action={
          <Button
            type="button"
            onClick={() => {
              setCreating(true);
              setFormError(null);
            }}
          >
            Add student
          </Button>
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

      {/* Filters */}
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
            placeholder="Search roll number, name or branch"
            aria-label="Search students"
            className={`${inputClass} pl-10`}
          />
        </div>

        <select
          value={batch}
          onChange={(e) => setBatch(e.target.value)}
          aria-label="Filter by batch"
          className={`${inputClass} w-auto min-w-[10rem]`}
        >
          <option value="">All batches</option>
          {batches.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        <p className="text-[length:var(--text-xs)] tabular-nums text-slate" aria-live="polite">
          {total} student{total === 1 ? '' : 's'}
        </p>
      </div>

      {loading ? (
        <Spinner label="Loading students…" />
      ) : items.length === 0 ? (
        <EmptyState
          title={query || batch ? 'No students match that' : 'No students yet'}
          description={
            query || batch
              ? 'Try a different search or clear the batch filter.'
              : 'Add a student by hand, or upload a workbook from the Bulk upload screen.'
          }
          action={
            query || batch ? (
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setQuery('');
                  setBatch('');
                }}
              >
                Clear filters
              </Button>
            ) : (
              <Button type="button" onClick={() => setCreating(true)}>
                Add the first student
              </Button>
            )
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-rule bg-paper">
          <div className="mg-scroll overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="bg-linen">
                  {['Roll no.', 'Name', 'Date of birth', 'Batch', 'Branch', ''].map((h) => (
                    <th
                      key={h}
                      className="border-b border-rule px-5 py-3 text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.12em] text-slate"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {items.map((s, i) => (
                    <motion.tr
                      key={s._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, delay: Math.min(i * 0.02, 0.2), ease: EASE }}
                      className="border-b border-rule-soft transition-colors last:border-0 hover:bg-shell"
                    >
                      <td className="px-5 py-3 text-[length:var(--text-sm)] font-medium text-ink">
                        {s.rollNo}
                      </td>
                      <td className="px-5 py-3 text-[length:var(--text-sm)] text-graphite">
                        {s.name}
                        {s.fatherName && (
                          <span className="block text-[length:var(--text-2xs)] text-mist">
                            s/o {s.fatherName}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-[length:var(--text-sm)] tabular-nums text-slate">
                        {s.dob}
                      </td>
                      <td className="px-5 py-3 text-[length:var(--text-sm)] text-slate">
                        {s.batch || '-'}
                      </td>
                      <td className="px-5 py-3 text-[length:var(--text-sm)] text-slate">
                        {s.branch || '-'}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            type="button"
                            className="px-2.5 py-1.5"
                            onClick={() => {
                              setEditing(s);
                              setFormError(null);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            type="button"
                            className="px-2.5 py-1.5 text-crimson"
                            onClick={() => setDeleting(s)}
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

      {/* Add / edit */}
      <Modal
        open={formOpen}
        onClose={() => {
          setEditing(null);
          setCreating(false);
        }}
        title={editing ? `Edit ${editing.rollNo}` : 'Add student'}
        wide
      >
        <form onSubmit={save} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Roll number"
              htmlFor="rollNo"
              required
              hint={editing ? 'The roll number cannot be changed.' : 'Stored in uppercase.'}
            >
              <input
                id="rollNo"
                name="rollNo"
                defaultValue={current.rollNo}
                readOnly={Boolean(editing)}
                required
                className={inputClass}
              />
            </Field>

            <Field label="Date of birth" htmlFor="dob" required>
              <input
                id="dob"
                name="dob"
                type="date"
                defaultValue={current.dob}
                required
                className={inputClass}
              />
            </Field>

            <Field label="Student name" htmlFor="name" required>
              <input
                id="name"
                name="name"
                defaultValue={current.name}
                required
                className={inputClass}
              />
            </Field>

            <Field label="Father's name" htmlFor="fatherName">
              <input
                id="fatherName"
                name="fatherName"
                defaultValue={current.fatherName}
                className={inputClass}
              />
            </Field>

            <Field label="Batch" htmlFor="batch" hint="For example 2024-2028.">
              <input id="batch" name="batch" defaultValue={current.batch} className={inputClass} />
            </Field>

            <Field label="Class" htmlFor="className">
              <input
                id="className"
                name="className"
                defaultValue={current.className}
                className={inputClass}
              />
            </Field>

            <Field label="Branch" htmlFor="branch" className="sm:col-span-2">
              <input
                id="branch"
                name="branch"
                defaultValue={current.branch}
                className={inputClass}
              />
            </Field>
          </div>

          <AnimatePresence>{formError && <Banner tone="error">{formError}</Banner>}</AnimatePresence>

          <div className="flex justify-end gap-2.5 pt-1">
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setEditing(null);
                setCreating(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editing ? 'Save changes' : 'Add student'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        loading={deleteBusy}
        title="Delete student"
        body={`Delete ${deleting?.name ?? ''} (${deleting?.rollNo ?? ''})? Every result stored for this student is deleted too. This cannot be undone.`}
      />
    </div>
  );
}

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ROLES, ROLE_DESCRIPTION, ROLE_LABEL, type Role } from '@/lib/roles';
import {
  Banner,
  Button,
  ConfirmModal,
  Field,
  Modal,
  PageHeading,
  Pill,
  Spinner,
  inputClass,
} from './ui';

const EASE = [0.22, 1, 0.36, 1] as const;

type Staff = {
  username: string;
  name: string;
  role: Role;
  createdAt: string;
  lastLoginAt: string | null;
};

export function StaffManager() {
  const [items, setItems] = useState<Staff[]>([]);
  const [currentUser, setCurrentUser] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState(false);
  const [deleting, setDeleting] = useState<Staff | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  /* Shown once after a create or reset — it is never retrievable again. */
  const [issued, setIssued] = useState<{ username: string; password: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/staff');
      const json = await res.json();
      if (json.ok) {
        setItems(json.items);
        setCurrentUser(json.currentUser);
      } else {
        setError(json.error ?? 'Could not load staff.');
      }
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;

    setSaving(true);
    setFormError(null);

    const url = editing
      ? `/api/admin/staff/${encodeURIComponent(editing.username)}`
      : '/api/admin/staff';

    try {
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, resetPassword: editing ? resetPassword : undefined }),
      });
      const json = await res.json();

      if (json.ok) {
        if (json.password) {
          setIssued({ username: json.staff.username, password: json.password });
        } else {
          setNotice(`${json.staff.username} updated.`);
        }
        setCreating(false);
        setEditing(null);
        setResetPassword(false);
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
      const res = await fetch(`/api/admin/staff/${encodeURIComponent(deleting.username)}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.ok) {
        setNotice(`${deleting.username} removed.`);
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

  const formOpen = creating || Boolean(editing);

  return (
    <div>
      <PageHeading
        title="Staff"
        description="Who can sign in, and what they may do. Management has full access; teachers enter and publish marks but cannot delete student records or manage accounts."
        action={
          <Button
            type="button"
            onClick={() => {
              setCreating(true);
              setFormError(null);
            }}
          >
            Add account
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

      {loading ? (
        <Spinner label="Loading staff…" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-rule bg-paper">
          <div className="mg-scroll overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="bg-linen">
                  {['Name', 'Username', 'Role', 'Last signed in', ''].map((h) => (
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
                {items.map((s, i) => (
                  <motion.tr
                    key={s.username}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.2), ease: EASE }}
                    className="border-b border-rule-soft transition-colors last:border-0 hover:bg-shell"
                  >
                    <td className="px-5 py-3 text-[length:var(--text-sm)] font-medium text-ink">
                      {s.name}
                      {s.username === currentUser && (
                        <span className="ml-2 text-[length:var(--text-2xs)] font-normal text-mist">
                          (you)
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-[length:var(--text-sm)] text-graphite">
                      {s.username}
                    </td>
                    <td className="px-5 py-3">
                      <Pill tone={s.role === 'management' ? 'pass' : 'neutral'}>
                        {ROLE_LABEL[s.role]}
                      </Pill>
                    </td>
                    <td className="px-5 py-3 text-[length:var(--text-sm)] text-slate">
                      {s.lastLoginAt ? new Date(s.lastLoginAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          type="button"
                          className="px-2.5 py-1.5"
                          onClick={() => {
                            setEditing(s);
                            setResetPassword(false);
                            setFormError(null);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          type="button"
                          className="px-2.5 py-1.5 text-brand disabled:opacity-30"
                          disabled={s.username === currentUser}
                          onClick={() => setDeleting(s)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / edit */}
      <Modal
        open={formOpen}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        title={editing ? `Edit ${editing.username}` : 'Add account'}
      >
        <form onSubmit={save} className="space-y-4">
          <Field
            label="Username"
            htmlFor="username"
            required
            hint={editing ? 'The username cannot be changed.' : 'Lowercase letters, numbers, dot, dash or underscore.'}
          >
            <input
              id="username"
              name="username"
              defaultValue={editing?.username ?? ''}
              readOnly={Boolean(editing)}
              required
              className={inputClass}
            />
          </Field>

          <Field label="Full name" htmlFor="name" required>
            <input
              id="name"
              name="name"
              defaultValue={editing?.name ?? ''}
              required
              className={inputClass}
            />
          </Field>

          <Field label="Role" htmlFor="role" required>
            <select
              id="role"
              name="role"
              defaultValue={editing?.role ?? 'teacher'}
              className={inputClass}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}: {ROLE_DESCRIPTION[r]}
                </option>
              ))}
            </select>
          </Field>

          {editing && (
            <label className="flex items-start gap-2.5 rounded-lg bg-shell px-4 py-3">
              <input
                type="checkbox"
                checked={resetPassword}
                onChange={(e) => setResetPassword(e.target.checked)}
                className="mt-0.5"
              />
              <span className="text-[length:var(--text-sm)] text-graphite">
                Reset this account&rsquo;s password
                <span className="mt-0.5 block text-[length:var(--text-2xs)] text-mist">
                  A new password is generated and shown once.
                </span>
              </span>
            </label>
          )}

          {(!editing || resetPassword) && (
            <Field
              label="Password"
              htmlFor="password"
              hint="Leave blank to generate one. Minimum 10 characters."
            >
              <input
                id="password"
                name="password"
                type="text"
                autoComplete="new-password"
                minLength={10}
                className={inputClass}
              />
            </Field>
          )}

          <AnimatePresence>{formError && <Banner tone="error">{formError}</Banner>}</AnimatePresence>

          <div className="flex justify-end gap-2.5 pt-1">
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setCreating(false);
                setEditing(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editing ? 'Save changes' : 'Create account'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Password handover */}
      <Modal open={Boolean(issued)} onClose={() => setIssued(null)} title="Password">
        <p className="text-[length:var(--text-sm)] leading-relaxed text-graphite">
          Give this to <strong className="font-medium text-ink">{issued?.username}</strong>. It is
          shown once and cannot be retrieved again, only reset.
        </p>
        <p className="mt-4 select-all rounded-lg bg-shell px-4 py-4 text-center font-mono text-[length:var(--text-lg)] tracking-wide text-ink">
          {issued?.password}
        </p>
        <div className="mt-5 flex justify-end gap-2.5">
          <Button
            variant="secondary"
            type="button"
            onClick={() => {
              if (issued) navigator.clipboard?.writeText(issued.password);
            }}
          >
            Copy
          </Button>
          <Button type="button" onClick={() => setIssued(null)}>
            Done
          </Button>
        </div>
      </Modal>

      <ConfirmModal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        loading={deleteBusy}
        title="Delete account"
        body={`Delete ${deleting?.name ?? ''} (${deleting?.username ?? ''})? They will lose access immediately. Student and result records are not affected.`}
      />
    </div>
  );
}

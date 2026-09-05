'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, type ReactNode } from 'react';

const EASE = [0.22, 1, 0.36, 1] as const;

/* ------------------------------------------------------------------
   Page furniture
   ------------------------------------------------------------------ */

export function PageHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="mb-7 flex flex-wrap items-end justify-between gap-4"
    >
      <div>
        <h1 className="font-display text-[length:var(--text-3xl)]">{title}</h1>
        {description && (
          <p className="mt-2 max-w-[62ch] text-[length:var(--text-sm)] text-slate">
            {description}
          </p>
        )}
      </div>
      {action}
    </motion.div>
  );
}

export function Card({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      className={`rounded-xl border border-rule bg-paper ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------
   Form controls
   ------------------------------------------------------------------ */

export const inputClass =
  'w-full rounded-lg border border-rule bg-shell px-3.5 py-2.5 text-[length:var(--text-sm)] text-ink transition-colors duration-200 placeholder:text-mist focus:border-crimson focus:bg-paper focus:outline-none disabled:opacity-60';

export function Field({
  label,
  htmlFor,
  required,
  hint,
  children,
  className = '',
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.12em] text-slate"
      >
        {label}
        {required && <span className="ml-1 text-crimson">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-[length:var(--text-2xs)] text-mist">{hint}</p>}
    </div>
  );
}

export function Button({
  children,
  variant = 'primary',
  loading,
  className = '',
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
}) {
  const styles = {
    primary: 'bg-ink text-paper hover:bg-crimson',
    secondary: 'border border-rule bg-paper text-ink hover:border-ink',
    danger: 'border border-crimson/30 bg-crimson-soft text-crimson-deep hover:bg-crimson hover:text-paper',
    ghost: 'text-graphite hover:bg-linen hover:text-ink',
  }[variant];

  return (
    <button
      {...rest}
      disabled={rest.disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[length:var(--text-sm)] font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${styles} ${className}`}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current/30 border-t-current" />
      )}
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------
   Feedback
   ------------------------------------------------------------------ */

export function Banner({
  tone,
  children,
  onDismiss,
}: {
  tone: 'error' | 'success' | 'info';
  children: ReactNode;
  onDismiss?: () => void;
}) {
  const styles = {
    error: 'bg-crimson-soft text-crimson-deep',
    success: 'bg-[#e9f4ec] text-[#1d6b38]',
    info: 'bg-linen text-graphite',
  }[tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start justify-between gap-4 rounded-lg px-4 py-3 text-[length:var(--text-sm)] ${styles}`}
    >
      <div className="min-w-0">{children}</div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 opacity-60 transition-opacity hover:opacity-100"
        >
          <svg width="12" height="12" viewBox="0 0 13 13" fill="none" aria-hidden>
            <path d="M1 1l11 11M12 1L1 12" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </button>
      )}
    </motion.div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-rule bg-paper px-8 py-16 text-center">
      <h3 className="font-display text-[length:var(--text-xl)]">{title}</h3>
      <p className="mx-auto mt-2.5 max-w-sm text-[length:var(--text-sm)] text-slate">
        {description}
      </p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-[length:var(--text-sm)] text-slate">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-rule border-t-crimson" />
      {label}
    </div>
  );
}

export function Pill({
  tone = 'neutral',
  children,
}: {
  tone?: 'neutral' | 'pass' | 'fail' | 'muted';
  children: ReactNode;
}) {
  const styles = {
    neutral: 'bg-linen text-graphite',
    pass: 'bg-[#e9f4ec] text-[#1d6b38]',
    fail: 'bg-crimson-soft text-crimson-deep',
    muted: 'bg-linen text-mist',
  }[tone];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.1em] ${styles}`}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------
   Modal
   ------------------------------------------------------------------ */

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto p-4 sm:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/45 backdrop-blur-[2px]"
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.99 }}
            transition={{ duration: 0.35, ease: EASE }}
            className={`relative my-auto w-full rounded-2xl border border-rule bg-paper shadow-lift ${
              wide ? 'max-w-3xl' : 'max-w-lg'
            }`}
          >
            <div className="flex items-center justify-between gap-4 border-b border-rule px-6 py-4">
              <h2 className="font-display text-[length:var(--text-xl)]">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate transition-colors hover:bg-linen hover:text-ink"
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
                  <path d="M1 1l11 11M12 1L1 12" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/** Confirmation dialog for destructive actions. */
export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel = 'Delete',
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  body: string;
  confirmLabel?: string;
  loading?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-[length:var(--text-sm)] leading-relaxed text-graphite">{body}</p>
      <div className="mt-6 flex justify-end gap-2.5">
        <Button variant="secondary" onClick={onClose} type="button">
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading} type="button">
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

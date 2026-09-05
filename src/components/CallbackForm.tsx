'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState, type FormEvent } from 'react';

const EASE = [0.22, 1, 0.36, 1] as const;
const ENQUIRY_ADDRESS = 'info@mgimst.org';

type Status = 'idle' | 'sending' | 'sent' | 'handoff' | 'error';

const FIELDS = [
  { name: 'name', label: 'Full name', type: 'text', required: true, autoComplete: 'name' },
  { name: 'email', label: 'Email address', type: 'email', required: true, autoComplete: 'email' },
  { name: 'phone', label: 'Phone number', type: 'tel', required: false, autoComplete: 'tel' },
  { name: 'course', label: 'Course of interest', type: 'text', required: false, autoComplete: 'off' },
] as const;

/** Opens the visitor's mail client with the enquiry pre-composed. */
function mailtoHandoff(data: Record<string, string>) {
  const body = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    data.phone ? `Phone: ${data.phone}` : null,
    data.course ? `Course of interest: ${data.course}` : null,
    '',
    data.message,
  ]
    .filter(Boolean)
    .join('\n');

  const subject = `Website enquiry — ${data.name}${data.course ? ` (${data.course})` : ''}`;
  window.location.href = `mailto:${ENQUIRY_ADDRESS}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}

export function CallbackForm({ compact }: { compact?: boolean }) {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;

    setStatus('sending');
    setError(null);

    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (json.ok) {
        setStatus('sent');
        form.reset();
        return;
      }

      /* No mail provider configured -- hand the enquiry to the mail client. */
      if (json.configured === false) {
        mailtoHandoff(data);
        setStatus('handoff');
        return;
      }

      setError(json.error ?? 'Something went wrong. Please try again.');
      setStatus('error');
    } catch {
      setError('We could not reach the server. Please email us directly.');
      setStatus('error');
    }
  }

  const done = status === 'sent' || status === 'handoff';

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-rule bg-paper ${
        compact ? 'p-6 sm:p-7' : 'p-7 sm:p-9'
      }`}
    >
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="py-6 text-center"
          >
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.08, ease: EASE }}
              className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-crimson-soft text-crimson"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                <motion.path
                  d="M5 12.5l4.5 4.5L19 7.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
                />
              </svg>
            </motion.span>

            <h3 className="text-[length:var(--text-2xl)]">
              {status === 'sent' ? 'Enquiry received' : 'Almost there'}
            </h3>
            <p className="mx-auto mt-3 max-w-sm text-[length:var(--text-base)] leading-relaxed text-slate">
              {status === 'sent'
                ? 'Thank you. One of our counsellors will be in touch with you shortly.'
                : `We have opened your email app with the enquiry ready to send to ${ENQUIRY_ADDRESS}. Send it and a counsellor will reply shortly.`}
            </p>
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="mt-6 text-[length:var(--text-sm)] font-medium text-ink underline decoration-rule underline-offset-4 transition-colors hover:text-crimson"
            >
              Send another enquiry
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={onSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            noValidate
          >
            <p className="eyebrow mb-3">Admissions</p>
            <h3 className="mb-2 text-[clamp(1.3rem,2.2vw,1.6rem)]">Request a callback</h3>
            <p className="mb-7 text-[length:var(--text-base)] leading-relaxed text-slate">
              Tell us what you are considering and a counsellor will get back to you.
            </p>

            <div className="grid gap-5 sm:grid-cols-2">
              {FIELDS.map((f) => (
                <div key={f.name} className={f.name === 'name' ? 'sm:col-span-2' : ''}>
                  <label
                    htmlFor={f.name}
                    className="mb-2 block text-[length:var(--text-xs)] font-medium uppercase tracking-[0.1em] text-slate"
                  >
                    {f.label}
                    {f.required && <span className="ml-1 text-crimson">*</span>}
                  </label>
                  <input
                    id={f.name}
                    name={f.name}
                    type={f.type}
                    required={f.required}
                    autoComplete={f.autoComplete}
                    className="w-full rounded-lg border border-rule bg-shell px-4 py-3 text-[length:var(--text-base)] text-ink transition-all duration-300 placeholder:text-mist focus:border-crimson focus:bg-paper focus:outline-none"
                  />
                </div>
              ))}

              <div className="sm:col-span-2">
                <label
                  htmlFor="message"
                  className="mb-2 block text-[length:var(--text-xs)] font-medium uppercase tracking-[0.1em] text-slate"
                >
                  Your query<span className="ml-1 text-crimson">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  className="w-full resize-y rounded-lg border border-rule bg-shell px-4 py-3 text-[length:var(--text-base)] text-ink transition-all duration-300 placeholder:text-mist focus:border-crimson focus:bg-paper focus:outline-none"
                />
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
                className="mt-4 rounded-lg bg-crimson-soft px-4 py-3 text-[length:var(--text-sm)] text-crimson-deep"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="group mt-7 inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-ink px-8 py-4 text-[length:var(--text-sm)] font-medium text-paper transition-colors duration-300 hover:bg-crimson disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === 'sending' ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-paper/30 border-t-paper" />
                  Sending
                </>
              ) : (
                <>
                  Submit enquiry
                  <svg width="14" height="10" viewBox="0 0 13 10" fill="none" aria-hidden>
                    <path
                      d="M1 5h10M7.5 1.5L11 5l-3.5 3.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </svg>
                </>
              )}
            </button>

            <p className="mt-4 text-center text-[length:var(--text-xs)] text-mist">
              Or email us at{' '}
              <a
                href={`mailto:${ENQUIRY_ADDRESS}`}
                className="text-slate underline underline-offset-2 transition-colors hover:text-crimson"
              >
                {ENQUIRY_ADDRESS}
              </a>
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

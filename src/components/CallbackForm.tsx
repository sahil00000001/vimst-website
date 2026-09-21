'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState, type FormEvent } from 'react';

const EASE = [0.22, 1, 0.36, 1] as const;
const ENQUIRY_ADDRESS = 'info@vimst.org';

type Status = 'idle' | 'sending' | 'sent' | 'handoff' | 'error';

/**
 * A mobile number is how a callback actually happens, so it is required rather
 * than optional. "Course of interest" is gone: it asked the visitor to name the
 * very thing they came here to be advised about, and whatever they are weighing
 * up fits in the query box below anyway.
 */
const FIELDS = [
  { name: 'name', label: 'Full name', type: 'text', required: true, autoComplete: 'name' },
  { name: 'email', label: 'Email address', type: 'email', required: true, autoComplete: 'email' },
  { name: 'phone', label: 'Mobile number', type: 'tel', required: true, autoComplete: 'tel' },
] as const;

/** Opens the visitor's mail client with the enquiry pre-composed. */
function mailtoHandoff(data: Record<string, string>) {
  const body = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Mobile: ${data.phone}`,
    '',
    data.message,
  ]
    .filter(Boolean)
    .join('\n');

  const subject = `Website enquiry · ${data.name}`;
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
    /* Kept deliberately small at both ends. On a phone the card is held to a
       narrower measure and given less of everything -- padding, gaps, field
       height -- so the whole enquiry sits in about one screen instead of two.
       On a wide screen it is still a four-field form rather than a page: at
       the old padding and field height it stood two thirds of a screen tall
       beside a three-line paragraph. */
    <div
      className={`relative mx-auto w-full max-w-[21rem] overflow-hidden rounded-2xl border border-rule bg-paper sm:max-w-[30rem] ${
        compact ? 'p-4 sm:p-5' : 'p-5 sm:p-6'
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
            className="py-4 text-center sm:py-5"
          >
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.08, ease: EASE }}
              className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-brand-soft text-brand sm:h-12 sm:w-12"
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
            <p className="mx-auto mt-2.5 max-w-sm text-[length:var(--text-sm)] leading-relaxed text-slate sm:mt-3 sm:text-[length:var(--text-base)]">
              {status === 'sent'
                ? 'Thank you. One of our counsellors will be in touch with you shortly.'
                : `We have opened your email app with the enquiry ready to send to ${ENQUIRY_ADDRESS}. Send it and a counsellor will reply shortly.`}
            </p>
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="mt-5 text-[length:var(--text-sm)] font-medium text-ink sm:mt-6 underline decoration-rule underline-offset-4 transition-colors hover:text-brand"
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
            <p className="eyebrow mb-2 sm:mb-2.5">Admissions</p>
            <h3 className="mb-1.5 text-[length:var(--text-xl)] sm:mb-2 sm:text-[clamp(1.2rem,1.7vw,1.4rem)]">
              Request a callback
            </h3>
            <p className="mb-4 text-[length:var(--text-sm)] leading-relaxed text-slate sm:mb-5 sm:text-[length:var(--text-base)]">
              Tell us what you are considering and a counsellor will get back to you.
            </p>

            <div className="grid gap-3 sm:grid-cols-2 sm:gap-3.5">
              {FIELDS.map((f) => (
                <div key={f.name} className={f.name === 'name' ? 'sm:col-span-2' : ''}>
                  <label
                    htmlFor={f.name}
                    className="mb-1.5 block text-[length:var(--text-2xs)] font-medium uppercase tracking-[0.1em] text-slate sm:text-[length:var(--text-xs)]"
                  >
                    {f.label}
                    {f.required && <span className="ml-1 text-brand">*</span>}
                  </label>
                  <input
                    id={f.name}
                    name={f.name}
                    type={f.type}
                    required={f.required}
                    autoComplete={f.autoComplete}
                    className="w-full rounded-lg border border-rule bg-shell px-3 py-2.5 text-[length:var(--text-sm)] text-ink transition-all duration-300 placeholder:text-mist focus:border-brand focus:bg-paper focus:outline-none sm:px-3.5 sm:py-2 sm:text-[length:var(--text-base)]"
                  />
                </div>
              ))}

              <div className="sm:col-span-2">
                <label
                  htmlFor="message"
                  className="mb-1.5 block text-[length:var(--text-2xs)] font-medium uppercase tracking-[0.1em] text-slate sm:text-[length:var(--text-xs)]"
                >
                  Your query<span className="ml-1 text-brand">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  required
                  /* Three rows of an empty box is mostly air on a wide screen,
                     and the field grows as it is typed into either way. */
                  className="w-full resize-y rounded-lg border border-rule bg-shell px-3 py-2.5 text-[length:var(--text-sm)] text-ink transition-all duration-300 placeholder:text-mist focus:border-brand focus:bg-paper focus:outline-none sm:h-[4.75rem] sm:px-3.5 sm:py-2 sm:text-[length:var(--text-base)]"
                />
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
                className="mt-3.5 rounded-lg bg-brand-soft px-3.5 py-2.5 text-[length:var(--text-sm)] text-brand-deep sm:mt-4 sm:px-4 sm:py-3"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="group mt-5 inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-brand px-6 py-3 text-[length:var(--text-sm)] font-medium text-paper sm:mt-5 sm:px-8 sm:py-3 transition-colors duration-300 hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
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

          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

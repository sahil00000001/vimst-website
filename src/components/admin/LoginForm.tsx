'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, type FormEvent } from 'react';
import { Media } from '../Media';
import { Banner, Button, Field, inputClass } from './ui';

const EASE = [0.22, 1, 0.36, 1] as const;

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (json.ok) {
        // A full refresh so the layout picks up the new session cookie.
        router.replace(next && next.startsWith('/admin') ? next : '/admin');
        router.refresh();
        return;
      }

      setError(json.error ?? 'Sign in failed.');
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="w-full max-w-md"
    >
      <div className="mb-8 text-center">
        <Link href="/" className="inline-block" aria-label="Back to the public site">
          <Media
            src="/media/logo-wordmark.png"
            alt="MGIMST"
            width={900}
            height={191}
            priority
            className="mx-auto h-11 w-auto"
          />
        </Link>
      </div>

      <div className="rounded-2xl border border-rule bg-paper p-7 shadow-lift sm:p-9">
        <p className="eyebrow mb-3">Staff only</p>
        <h1 className="mb-2 font-display text-[length:var(--text-2xl)]">Sign in</h1>
        <p className="mb-7 text-[length:var(--text-sm)] leading-relaxed text-slate">
          Manage students, publish semester results and run bulk uploads.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Username" htmlFor="username" required>
            <input
              id="username"
              name="username"
              type="text"
              required
              autoComplete="username"
              autoFocus
              className={inputClass}
            />
          </Field>

          <Field label="Password" htmlFor="password" required>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className={inputClass}
            />
          </Field>

          <AnimatePresence>{error && <Banner tone="error">{error}</Banner>}</AnimatePresence>

          <Button type="submit" loading={loading} className="w-full py-3">
            {loading ? 'Signing in' : 'Sign in'}
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-[length:var(--text-xs)] text-mist">
        <Link href="/" className="transition-colors hover:text-crimson">
          ← Back to the website
        </Link>
      </p>
    </motion.div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ROLE_LABEL, type Role } from '@/lib/roles';
import { Media } from '../Media';

const EASE = [0.22, 1, 0.36, 1] as const;

type NavEntry = { href: string; label: string; d: string; management?: boolean };

const NAV: NavEntry[] = [
  {
    href: '/admin',
    label: 'Dashboard',
    d: 'M3 9.5 10 3l7 6.5V17a1 1 0 0 1-1 1h-4v-5H8v5H4a1 1 0 0 1-1-1V9.5Z',
  },
  {
    href: '/admin/students',
    label: 'Students',
    d: 'M10 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-7 7.5c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5',
  },
  {
    href: '/admin/results',
    label: 'Results',
    d: 'M5 2.5h7l3.5 3.5v11.5a.5.5 0 0 1-.5.5H5a.5.5 0 0 1-.5-.5v-15a.5.5 0 0 1 .5-.5Zm7 0V6h3.5M7.5 10h5M7.5 13.5h5',
  },
  {
    href: '/admin/import',
    label: 'Bulk upload',
    d: 'M10 13.5V3.5m0 0L6.5 7M10 3.5 13.5 7M3.5 13v3a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-3',
  },
  {
    href: '/admin/staff',
    label: 'Staff',
    management: true,
    d: 'M7.5 9.5a2.75 2.75 0 1 0 0-5.5 2.75 2.75 0 0 0 0 5.5Zm6 0a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5ZM2 17c0-2.8 2.5-4.5 5.5-4.5S13 14.2 13 17m2-4.4c1.8.4 3 1.6 3 3.4',
  },
];

export function AdminShell({
  admin,
  children,
}: {
  admin: { username: string; name: string; role: Role };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  async function signOut() {
    setSigningOut(true);
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  }

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-rule px-6 py-5">
        <Link href="/" className="block" aria-label="Back to the public site">
          <Media
            src="/media/logo-wordmark.png"
            alt="VIMST"
            width={1200}
            height={416}
            className="h-11 w-auto"
          />
        </Link>
        <p className="mt-3 text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.18em] text-brand">
          Admin portal
        </p>
      </div>

      <nav className="flex-1 space-y-1 p-4" aria-label="Admin sections">
        {NAV.filter((item) => !item.management || admin.role === 'management').map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`group relative flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-[length:var(--text-sm)] font-medium transition-colors duration-200 ${
                active ? 'text-brand' : 'text-graphite hover:bg-linen hover:text-ink'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="admin-nav-active"
                  className="absolute inset-0 rounded-lg bg-brand-soft"
                  transition={{ duration: 0.35, ease: EASE }}
                />
              )}
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden
                className="relative z-10 shrink-0"
              >
                <path
                  d={item.d}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-rule p-4">
        <div className="mb-3 flex items-center gap-3 px-1">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-[length:var(--text-sm)] font-semibold text-paper">
            {admin.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[length:var(--text-sm)] font-medium text-ink">
              {admin.name}
            </p>
            <p className="truncate text-[length:var(--text-2xs)] text-mist">
              {ROLE_LABEL[admin.role]} · {admin.username}
            </p>
          </div>
        </div>
        <div className="grid gap-2">
          <Link
            href="/"
            className="rounded-lg border border-rule px-3.5 py-2 text-center text-[length:var(--text-xs)] font-medium text-graphite transition-colors hover:border-ink hover:text-ink"
          >
            View site
          </Link>
          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className="rounded-lg bg-ink px-3.5 py-2 text-[length:var(--text-xs)] font-medium text-paper transition-colors hover:bg-brand disabled:opacity-60"
          >
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-shell">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-rule bg-paper lg:block">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-[2px] lg:hidden"
              aria-hidden
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.4, ease: EASE }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-rule bg-paper lg:hidden"
              aria-label="Admin navigation"
            >
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-rule bg-paper/90 px-4 py-3 backdrop-blur-md sm:px-6 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open admin menu"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-rule text-ink transition-colors hover:border-brand hover:text-brand"
          >
            <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden>
              <path d="M0 1h18M0 6h18M0 11h12" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
          <p className="text-[length:var(--text-sm)] font-semibold text-ink">VIMST Admin</p>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}

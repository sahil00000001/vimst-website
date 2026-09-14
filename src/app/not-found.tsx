import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MotionProvider } from '@/components/MotionProvider';
import { buildNav } from '@/lib/nav';

/**
 * Global 404. It sits outside the `(site)` group, so the chrome is composed
 * here rather than inherited.
 */
export default function NotFound() {
  return (
    <MotionProvider>
      <Navbar nav={buildNav()} />
      <main className="flex-1 bg-shell">
        <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-5 py-24 text-center sm:px-8">
          <p className="eyebrow mb-6">Error 404</p>
          <h1 className="text-[length:var(--text-4xl)]">
            This page has <em className="not-italic text-brand">moved on</em>
          </h1>
          <p className="mt-5 max-w-md text-[length:var(--text-lg)] leading-relaxed text-slate">
            The page you were looking for is not here. It may have been renamed when the
            site was rebuilt, or the link may be out of date.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="rounded-full bg-brand px-7 py-3.5 text-[length:var(--text-sm)] font-medium text-paper transition-colors hover:bg-brand-deep"
            >
              Back to home
            </Link>
            <Link
              href="/courses"
              className="rounded-full border border-rule bg-paper px-7 py-3.5 text-[length:var(--text-sm)] font-medium text-ink transition-colors hover:border-ink"
            >
              Browse courses
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </MotionProvider>
  );
}

import Link from 'next/link';
import { Reveal } from './Motion';
import { PageBanner } from './PageBanner';

/**
 * A page that has a place in the nav but no content yet.
 *
 * Says so plainly, under the same banner every other page opens with, and
 * points at the two things a visitor who came looking can do instead.
 */
export function ComingSoon({
  title,
  eyebrow,
  image,
}: {
  title: string;
  eyebrow?: string;
  image?: string | null;
}) {
  return (
    <>
      <PageBanner eyebrow={eyebrow} title={title} image={image} crumbs={[{ label: title }]} wide />

      <section className="bg-shell">
        <div className="shell pb-16 sm:pb-20 lg:pb-12">
          <div className="rounded-b-2xl border border-t-0 border-rule bg-paper px-5 py-10 sm:px-10 sm:py-14 lg:px-10 lg:py-9">
            <Reveal from="up" className="mx-auto max-w-xl text-center">
              <p className="eyebrow mb-4">Coming soon</p>
              <h2 className="text-[length:var(--text-3xl)]">We are working on it</h2>
              <p className="mt-4 text-[length:var(--text-base)] leading-relaxed text-slate">
                This page is being prepared and will be available shortly. In the
                meantime, browse our courses or get in touch with a counsellor.
              </p>
              <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:justify-center sm:gap-3">
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-3.5 text-[length:var(--text-sm)] font-medium text-paper transition-colors hover:bg-brand-deep"
                >
                  Browse all courses
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full border border-rule bg-paper px-6 py-3.5 text-[length:var(--text-sm)] font-medium text-ink transition-colors hover:border-ink"
                >
                  Contact us
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}

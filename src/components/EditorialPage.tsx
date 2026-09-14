import Link from 'next/link';
import { ContentBlocks } from './ContentBlocks';
import { Figure, LeadFigure } from './Figure';
import { Reveal } from './Motion';
import { PageBanner, type Crumb } from './PageBanner';
import { courses, page as getPage } from '@/lib/content';
import { figuresFor, leadImageFor } from '@/lib/media';

const RELATED: { label: string; href: string }[] = [
  { label: 'About Us', href: '/about' },
  { label: 'Vision', href: '/vision' },
  { label: 'Mission', href: '/mission' },
  { label: "Director's Message", href: '/director-message' },
  { label: 'Quality Policy', href: '/quality-policy' },
  { label: 'Career', href: '/career' },
];

/**
 * Standard layout for the institute's prose pages. Content comes from the
 * generated site data, so each route file stays a thin wrapper.
 */
export function EditorialPage({
  contentKey,
  title,
  eyebrow,
  intro,
  crumbs,
  currentHref,
}: {
  contentKey: string;
  title?: string;
  eyebrow?: string;
  intro?: string;
  crumbs?: Crumb[];
  currentHref: string;
}) {
  const data = getPage(contentKey);
  const heading = title ?? data.title;
  // Both are empty until photography is added to src/lib/media.ts.
  const lead = leadImageFor(contentKey);
  const figures = figuresFor(contentKey);

  return (
    <>
      <PageBanner
        eyebrow={eyebrow ?? 'The Institute'}
        title={heading}
        intro={intro ?? null}
        image={data.banner}
        crumbs={crumbs ?? [{ label: heading }]}
      />

      <section className="bg-shell">
        <div className="shell pb-16 sm:pb-20 lg:pb-28">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-8">
              <div className="rounded-b-2xl border border-t-0 border-rule bg-paper px-5 py-10 sm:px-10 sm:py-12 lg:px-12">
                {lead && <LeadFigure figure={lead} />}
                <ContentBlocks blocks={data.blocks} skipLeadHeading={heading} />
                {figures.length > 0 && (
                  <div className="mt-12 grid gap-6 sm:grid-cols-2">
                    {figures.map((f) => (
                      <Figure key={f.src} figure={f} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <aside className="lg:col-span-4">
              <div className="sticky top-28 space-y-6">
                <Reveal from="left" className="rounded-2xl border border-rule bg-paper p-6">
                  <p className="mb-4 text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.16em] text-brand">
                    More about VIMST
                  </p>
                  <ul className="space-y-1">
                    {RELATED.filter((r) => r.href !== currentHref).map((r) => (
                      <li key={r.href}>
                        <Link
                          href={r.href}
                          className="group flex items-center justify-between gap-3 border-b border-rule-soft py-2.5 text-[length:var(--text-sm)] text-graphite transition-colors last:border-0 hover:text-brand"
                        >
                          {r.label}
                          <svg
                            width="13"
                            height="10"
                            viewBox="0 0 13 10"
                            fill="none"
                            aria-hidden
                            className="shrink-0 text-mist transition-transform duration-300 group-hover:translate-x-1 group-hover:text-brand"
                          >
                            <path
                              d="M1 5h10M7.5 1.5L11 5l-3.5 3.5"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Reveal>

                <Reveal
                  from="left"
                  delay={0.08}
                  className="rounded-2xl border border-rule bg-brand p-7 text-paper"
                >
                  <h3 className="font-display text-[length:var(--text-xl)] text-paper">
                    Admissions are open
                  </h3>
                  <p className="mt-3 text-[length:var(--text-base)] leading-relaxed text-paper/70">
                    Explore {courses.length} programmes across six streams, or speak to a
                    counsellor about which one fits.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href="/courses"
                      className="rounded-full bg-paper px-5 py-2.5 text-[length:var(--text-sm)] font-medium text-ink transition-colors hover:bg-brand hover:text-paper"
                    >
                      Browse courses
                    </Link>
                    <Link
                      href="/contact"
                      className="rounded-full border border-paper/25 px-5 py-2.5 text-[length:var(--text-sm)] font-medium text-paper transition-colors hover:border-paper"
                    >
                      Contact us
                    </Link>
                  </div>
                </Reveal>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CallbackForm } from '@/components/CallbackForm';
import { ContentBlocks } from '@/components/ContentBlocks';
import { CourseCard } from '@/components/CourseCard';
import { Reveal, Stagger, StaggerItem } from '@/components/Motion';
import { PageBanner } from '@/components/PageBanner';
import { ACCENT_CLASS, accentForCourse } from '@/lib/accents';
import {
  courseBySlug,
  courses,
  excerpt,
  relatedCourses,
  sectionHeadings,
} from '@/lib/content';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return courses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const course = courseBySlug(slug);
  if (!course) return { title: 'Course not found' };

  const description = excerpt(course.summary, 32);
  return {
    title: course.title,
    description,
    openGraph: {
      title: `${course.title} · VIMST`,
      description,
      images: course.banner ? [course.banner] : undefined,
    },
  };
}

export default async function CoursePage({ params }: Params) {
  const { slug } = await params;
  const course = courseBySlug(slug);
  if (!course) notFound();

  const related = relatedCourses(course);
  const accent = ACCENT_CLASS[accentForCourse(course)];

  /* Section headings double as an in-page contents list. */
  const sections = sectionHeadings(course.blocks, course.title);

  return (
    <>
      <PageBanner
        eyebrow={`${course.stream} · ${course.level}`}
        title={course.title}
        image={course.banner}
        crumbs={[{ label: 'Courses', href: '/courses' }, { label: course.short }]}
        meta={[
          { label: 'Level', value: course.level },
          { label: 'Department', value: course.department },
          { label: 'Award', value: course.short },
        ]}
      />

      <section className="bg-shell">
        <div className="shell pb-16 sm:pb-20 lg:pb-28">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
            {/* Body */}
            <div className="lg:col-span-8">
              <div className="rounded-b-2xl border border-t-0 border-rule bg-paper px-5 py-10 sm:px-10 sm:py-12 lg:px-12">
                <ContentBlocks blocks={course.blocks} skipLeadHeading={course.title} />
              </div>
            </div>

            {/* Aside */}
            <aside className="lg:col-span-4">
              <div className="sticky top-28 space-y-6">
                {sections.length > 2 && (
                  <Reveal
                    from="left"
                    className="rounded-2xl border border-rule bg-paper p-6"
                  >
                    <p className={`mb-4 text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.16em] ${accent.text}`}>
                      On this page
                    </p>
                    <ul className="space-y-2">
                      {sections.map((s, i) => (
                        <li key={s + i} className="flex gap-3 text-[length:var(--text-sm)] text-slate">
                          <span className="tabular-nums text-mist">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                )}

                <Reveal from="left" delay={0.08}>
                  <div className="rounded-2xl border border-rule bg-paper p-6">
                    <p className={`mb-4 text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.16em] ${accent.text}`}>
                      At a glance
                    </p>
                    <dl className="space-y-4">
                      {[
                        { t: 'Stream', v: course.stream },
                        { t: 'Level', v: course.level },
                        { t: 'Department', v: course.department },
                      ].map((x) => (
                        <div key={x.t} className="border-b border-rule-soft pb-3 last:border-0 last:pb-0">
                          <dt className="text-[length:var(--text-2xs)] uppercase tracking-[0.1em] text-mist">
                            {x.t}
                          </dt>
                          <dd className="mt-1 text-[length:var(--text-base)] text-graphite">{x.v}</dd>
                        </div>
                      ))}
                    </dl>
                    <Link
                      href="/contact"
                      className="group mt-5 inline-flex min-h-11 items-center gap-2 text-[length:var(--text-sm)] font-medium text-ink transition-colors hover:text-brand"
                    >
                      Ask about this programme
                      <svg width="13" height="10" viewBox="0 0 13 10" fill="none" aria-hidden>
                        <path
                          d="M1 5h10M7.5 1.5L11 5l-3.5 3.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                      </svg>
                    </Link>
                  </div>
                </Reveal>

                <Reveal from="left" delay={0.14}>
                  <CallbackForm compact />
                </Reveal>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-rule bg-paper">
          <div className="shell section-y">
            <Reveal from="up" className="mb-10">
              <p className="eyebrow mb-4">Also consider</p>
              <h2 className="text-[length:var(--text-3xl)]">Related programmes</h2>
            </Reveal>
            <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((c) => (
                <StaggerItem key={c.slug}>
                  <CourseCard course={c} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}
    </>
  );
}

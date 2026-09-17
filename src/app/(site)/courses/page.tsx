import { Suspense } from 'react';
import type { Metadata } from 'next';
import { CourseExplorer } from '@/components/CourseExplorer';
import { PageBanner } from '@/components/PageBanner';
import { courses } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Courses',
  description:
    'Every programme offered by VIMST across engineering, management, computer applications, science, commerce and arts, at diploma, bachelor, PG diploma and masters level.',
};

export default function CoursesPage() {
  const sorted = [...courses].sort(
    (a, b) => a.stream.localeCompare(b.stream) || a.title.localeCompare(b.title)
  );

  return (
    <>
      <PageBanner
        eyebrow="Academics"
        title="Courses Offered"
        intro={`${courses.length} programmes across six streams, from diploma through to masters, offered in Regular and Part-Time modes.`}
        image="/media/art/courses.jpg"
        crumbs={[{ label: 'Courses' }]}
        wide
        attached={false}
      />

      <section className="bg-shell">
        <div className="shell pb-16 pt-12 sm:pb-20 lg:pb-28">
          <Suspense fallback={<div className="py-20 text-center text-slate">Loading…</div>}>
            <CourseExplorer courses={sorted} />
          </Suspense>
        </div>
      </section>
    </>
  );
}

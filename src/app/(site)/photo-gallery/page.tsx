import type { Metadata } from 'next';
import { Gallery } from '@/components/Gallery';
import { Reveal } from '@/components/Motion';
import { PageBanner } from '@/components/PageBanner';
import { page } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Photo Gallery',
  description:
    'Photographs from campus life, events and ceremonies at Vivekananda Institute of Management Science and Technology.',
};

export default function PhotoGalleryPage() {
  const data = page('photoGallery');

  return (
    <>
      <PageBanner
        eyebrow="Campus life"
        title="Photo Gallery"
        intro="Moments from the campus: ceremonies, classrooms and the people who make up VIMST."
        image={data.banner}
        crumbs={[{ label: 'Photo Gallery' }]}
        wide
      />

      <section className="bg-shell">
        <div className="shell pb-16 sm:pb-20 lg:pb-28">
          <div className="rounded-b-2xl border border-t-0 border-rule bg-paper px-5 py-10 sm:px-10 sm:py-12 lg:px-14">
            <Reveal from="up" className="mb-10 flex items-baseline justify-between gap-4">
              <p className="eyebrow">Gallery</p>
              <p className="text-[length:var(--text-sm)] tabular-nums text-mist">
                {data.images.length} photographs
              </p>
            </Reveal>
            <Gallery images={data.images} columns={3} />
          </div>
        </div>
      </section>
    </>
  );
}

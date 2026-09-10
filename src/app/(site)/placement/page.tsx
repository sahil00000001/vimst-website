import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ContentBlocks } from '@/components/ContentBlocks';
import { LogoMarquee } from '@/components/LogoMarquee';
import { Reveal, Stagger, StaggerItem } from '@/components/Motion';
import { PageBanner } from '@/components/PageBanner';
import { page } from '@/lib/content';
import { Media } from '@/components/Media';

export const metadata: Metadata = {
  title: 'Placements',
  description:
    'The VIMST Placement Cell connects students with internships and jobs, and prepares them for interviews, group discussions and the industry.',
};

export default function PlacementPage() {
  const data = page('placement');

  /* The source page is a wall of recruiter logos with no accompanying copy. */
  const logos = data.images.filter((i) => /\/logo\//.test(i.src));
  const photos = data.images.filter((i) => !/\/logo\//.test(i.src));

  return (
    <>
      <PageBanner
        eyebrow="Careers"
        title="Our Placements"
        intro="The Placement Cell offers internship and job opportunities regularly, acting as a link with industry through experts, thought leaders, coaches and alumni."
        image={data.banner}
        crumbs={[{ label: 'Placements' }]}
        wide
      />

      <section className="bg-shell">
        <div className="shell pb-14 sm:pb-16">
          <div className="rounded-b-2xl border border-t-0 border-rule bg-paper px-5 py-10 sm:px-10 sm:py-12 lg:px-14">
            <div className="grid gap-10 lg:grid-cols-12">
              <Reveal from="right" className="lg:col-span-7">
                <p className="eyebrow mb-5">Placement Cell</p>
                <h2 className="text-[length:var(--text-3xl)]">
                  Preparing students for the{' '}
                  <em className="not-italic text-crimson">industry</em>
                </h2>
                <div className="prose-mg mt-6">
                  <p>
                    The Placement Cell offers internship and job opportunities regularly. It
                    acts as a link with industry through experts, thought leaders, coaches
                    and alumni. It also helps students prepare themselves for the industry:
                    they are assisted in the preparation of CVs and given rigorous training
                    for facing group discussions and interviews.
                  </p>
                </div>
                {data.blocks.length > 0 && (
                  <div className="mt-10">
                    <ContentBlocks blocks={data.blocks} skipLeadHeading="Our Placements" />
                  </div>
                )}
              </Reveal>

              <Reveal from="left" delay={0.1} className="lg:col-span-5">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  {[
                    { v: `${logos.length}+`, l: 'Recruiting organisations' },
                    { v: 'CV & GD', l: 'Interview preparation' },
                    { v: 'Alumni', l: 'Industry mentor network' },
                  ].map((s) => (
                    <div key={s.l} className="rounded-xl border border-rule bg-shell p-6">
                      <p className="font-display text-[length:var(--text-3xl)] leading-none text-crimson">
                        {s.v}
                      </p>
                      <p className="mt-2 text-[length:var(--text-sm)] text-slate">{s.l}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {logos.length > 0 && (
        <section className="border-t border-rule bg-paper">
          <div className="shell section-y">
            <Reveal from="up" className="mb-12">
              <p className="eyebrow mb-5">Where our students go</p>
              <h2 className="max-w-2xl text-[length:var(--text-3xl)]">
                Organisations that have <em className="not-italic text-crimson">recruited</em>{' '}
                from VIMST
              </h2>
            </Reveal>

            <LogoMarquee logos={logos} rows={3} />
          </div>
        </section>
      )}

      {photos.length > 0 && (
        <section className="border-t border-rule bg-shell">
          <div className="shell section-y">
            <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {photos.map((p, i) => (
                <StaggerItem key={p.src + i}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-rule bg-linen">
                    <Media
                      src={p.src}
                      alt={p.alt}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      <section className="border-t border-rule bg-paper">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-8 px-5 py-16 sm:px-8 lg:flex-row lg:items-center">
          <Reveal from="right">
            <h2 className="max-w-xl text-[length:var(--text-3xl)]">
              Start with the right <em className="not-italic text-crimson">programme</em>
            </h2>
            <p className="mt-4 max-w-lg text-[length:var(--text-base)] text-slate">
              Placement outcomes begin with the course you choose. Browse the full
              catalogue or ask a counsellor what fits your background.
            </p>
          </Reveal>
          <Reveal from="left" delay={0.08} className="flex shrink-0 flex-wrap gap-3">
            <Link
              href="/courses"
              className="rounded-full bg-ink px-7 py-3.5 text-[length:var(--text-sm)] font-medium text-paper transition-colors hover:bg-crimson"
            >
              Browse courses
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-rule px-7 py-3.5 text-[length:var(--text-sm)] font-medium text-ink transition-colors hover:border-ink"
            >
              Talk to us
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}

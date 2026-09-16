import Link from 'next/link';
import { CallbackForm } from '@/components/CallbackForm';
import { Hero, Arrow } from '@/components/Hero';
import { isPlate, Media } from '@/components/Media';
import { Reveal, Stagger, StaggerItem } from '@/components/Motion';
import { NewsTicker } from '@/components/NewsTicker';
import { VideoFeature } from '@/components/VideoFeature';
import { courses, coursesByStream, excerpt, home } from '@/lib/content';
import { CAMPUS_VIDEO, HERO_VIDEO } from '@/lib/media';

/**
 * The six pages that used to sit behind an "About Us" menu.
 *
 * They are introduced here instead: a picture, the heading, the two lines that
 * actually say what the page is about, and a way in. The pages themselves are
 * unchanged and still have their own URLs -- they are simply reached from the
 * home page rather than from a menu of six near-identical labels, so a visitor
 * meets the institute by reading down the page instead of by guessing.
 *
 * The blurbs are written short on purpose. A card that reproduces half the page
 * gives nobody a reason to open it.
 */
const INSTITUTE = [
  {
    title: 'About Us',
    href: '/about',
    image: '/media/images/photogallery/img-20240617-wa0016.jpg',
    body: 'A leading institute for engineering and management education in Andhra Pradesh, teaching undergraduate and postgraduate programmes since 1998.',
  },
  {
    title: 'Our Vision',
    href: '/vision',
    image: '/media/images/photogallery/img-20240617-wa0019.jpg',
    body: 'To prepare students for a working world that is more connected than any before it, and where technology keeps changing how business is done.',
  },
  {
    title: 'Our Mission',
    href: '/mission',
    image: '/media/images/photogallery/img-20240617-wa0020.jpg',
    body: 'Education that meets global standards, built on a strong foundation of Indian values and traditions.',
  },
  {
    title: "Director's Message",
    href: '/director-message',
    image: '/media/director.jpg',
    body: 'Education is not merely the acquisition of knowledge, but a continuous process of developing competence, character, confidence and a strong sense of responsibility.',
  },
  {
    title: 'Quality Policy',
    href: '/quality-policy',
    image: '/media/images/awards.jpg',
    body: 'Weekend classes for students who work during the week, and teaching we review against the standards our certifications set.',
  },
  {
    title: 'Career',
    href: '/career',
    image: '/media/images/picsart-24-06-17-14-15-14-124.jpg',
    body: 'Consultants who work with people at every stage of a career, from professional staff through to senior management.',
  },
];

/**
 * The picture beside a card.
 *
 * Square-ish artwork -- the IKS seal, a poster, a contact sheet -- sits whole on
 * a soft plate rather than being cropped to fill the frame, which was slicing
 * the seal's own wording off three sides.
 */
function CardImage({
  src,
  alt = '',
  sizes,
  fit,
}: {
  src: string;
  alt?: string;
  sizes: string;
  /** Overrides the shape test where the caller already knows what it is passing. */
  fit?: 'cover' | 'plate';
}) {
  const plate = fit ? fit === 'plate' : isPlate(src);
  return (
    <div className={`absolute inset-0 ${plate ? 'bg-linen p-2.5 sm:p-3' : ''}`}>
      <div className="relative h-full w-full">
        <Media
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className={
            plate
              ? 'object-contain'
              : 'object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]'
          }
        />
      </div>
    </div>
  );
}

export default function HomePage() {
  const streams = coursesByStream();

  /* The Placement Cell has a tile of its own further down that goes to the real
     placement page, so the descriptive card here would be the second time the
     same subject appears between one screen and the next. */
  const discover = home.discover.filter((d) => !/^placement$/i.test(d.title));

  return (
    <>
      <Hero slides={home.carousel} video={HERO_VIDEO}>
        <NewsTicker items={home.news} />
      </Hero>

      {/* Welcome. The heading sits in its own column on a wide screen so the
          paragraph keeps a readable measure without leaving half the page
          empty beside it. */}
      <section className="relative border-t border-rule bg-paper">
        <div className="shell section-y grid gap-5 lg:grid-cols-12 lg:gap-14">
          <Reveal from="up" className="lg:col-span-4">
            <p className="eyebrow mb-4">Welcome</p>
            <h2 className="text-[length:var(--text-3xl)]">About the college</h2>
          </Reveal>

          <Reveal from="up" delay={0.12} className="prose-mg lg:col-span-8">
            <p>{home.about.body}</p>
          </Reveal>
        </div>
      </section>

      {/* The institute */}
      <section className="border-t border-rule bg-shell">
        <div className="shell section-y">
          <Reveal from="up" className="mb-6 sm:mb-9">
            <p className="eyebrow mb-4">Explore</p>
            <h2 className="text-[length:var(--text-3xl)]">The institute</h2>
          </Reveal>

          <Stagger className="grid gap-3 sm:gap-4 lg:grid-cols-2 lg:gap-5">
            {INSTITUTE.map((item) => (
              <StaggerItem key={item.href}>
                <Link
                  href={item.href}
                  className="group flex h-full overflow-hidden rounded-xl border border-rule bg-paper transition-all duration-500 hover:border-parchment hover:shadow-lift"
                >
                  <div className="relative w-[36%] max-w-[9.5rem] shrink-0 overflow-hidden sm:w-[32%] sm:max-w-none">
                    <CardImage
                      src={item.image}
                      sizes="(max-width: 1024px) 40vw, 18vw"
                      fit="cover"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center p-4 sm:p-5">
                    <h3 className="text-[length:var(--text-lg)]">{item.title}</h3>
                    <p className="mt-1.5 text-[length:var(--text-xs)] leading-relaxed text-slate sm:mt-2 sm:text-[length:var(--text-sm)]">
                      {item.body}
                    </p>
                    <span className="mt-2.5 inline-flex items-center gap-1.5 text-[length:var(--text-xs)] font-medium text-brand sm:mt-3 sm:text-[length:var(--text-sm)]">
                      Read more
                      <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Programmes */}
      <section className="border-t border-rule bg-paper">
        <div className="shell section-y">
          <Reveal from="up" className="mb-6 sm:mb-9">
            <p className="eyebrow mb-4">What we teach</p>
            <h2 className="text-[length:var(--text-3xl)]">Programmes</h2>
            <p className="mt-3 max-w-[54ch] text-[length:var(--text-base)] leading-relaxed text-slate">
              {courses.length} programmes across six streams, at diploma, bachelor,
              post-graduate diploma and master&rsquo;s level.
            </p>
          </Reveal>

          <Stagger className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
            {streams.map((s) => (
              <StaggerItem key={s.stream}>
                <Link
                  href="/courses"
                  className="group flex h-full flex-col justify-between gap-2 rounded-xl border border-rule bg-shell p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand hover:bg-paper"
                >
                  <span className="font-display text-[length:var(--text-base)] leading-snug text-brand">
                    {s.stream}
                  </span>
                  <span className="text-[length:var(--text-2xs)] uppercase tracking-[0.12em] text-mist">
                    {s.courses.length} programme{s.courses.length === 1 ? '' : 's'}
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal
            from="up"
            delay={0.1}
            className="mt-5 flex flex-col gap-2.5 sm:mt-6 sm:flex-row sm:flex-wrap sm:gap-3"
          >
            <Link
              href="/courses"
              className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-brand px-6 py-3.5 text-[length:var(--text-sm)] font-medium text-paper transition-colors duration-300 hover:bg-brand-deep"
            >
              Explore all programmes
              <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/specializations"
              className="inline-flex items-center justify-center rounded-full border border-rule px-6 py-3.5 text-[length:var(--text-sm)] font-medium text-ink transition-colors duration-300 hover:border-ink"
            >
              Specializations
            </Link>
          </Reveal>
        </div>
      </section>

      {CAMPUS_VIDEO && (
        <section className="border-t border-rule bg-paper">
          <div className="shell section-y">
            <Reveal from="up" className="mb-6 max-w-xl">
              <p className="eyebrow mb-4">Take a look</p>
              <h2 className="text-[length:var(--text-3xl)]">Inside the campus</h2>
            </Reveal>
            <Reveal from="up" delay={0.08}>
              <VideoFeature video={CAMPUS_VIDEO} aspect="aspect-[16/10] sm:aspect-[21/9]" />
            </Reveal>
          </div>
        </section>
      )}

      {/* Discover more */}
      <section className="border-t border-rule bg-shell">
        <div className="shell section-y">
          <Reveal from="up" className="mb-6 sm:mb-9">
            <p className="eyebrow mb-4">Beyond the classroom</p>
            <h2 className="text-[length:var(--text-3xl)]">Discover more</h2>
          </Reveal>

          <Stagger className="grid gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-5">
            {discover.map((d) => (
              <StaggerItem key={d.title}>
                <article className="group flex h-full overflow-hidden rounded-xl border border-rule bg-paper lg:flex-col">
                  {d.image && (
                    <div className="relative w-[36%] max-w-[9.5rem] shrink-0 overflow-hidden sm:w-[32%] sm:max-w-none lg:aspect-[16/10] lg:w-full lg:max-w-none">
                      <CardImage src={d.image} sizes="(max-width: 1024px) 40vw, 30vw" />
                    </div>
                  )}
                  <div className="flex min-w-0 flex-1 flex-col justify-center p-4 sm:p-5">
                    <h3 className="text-[length:var(--text-lg)]">{d.title}</h3>
                    <p className="mt-1.5 text-[length:var(--text-xs)] leading-relaxed text-slate sm:mt-2 sm:text-[length:var(--text-sm)]">
                      {excerpt(d.body, 24)}
                    </p>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Campus life */}
      <section className="border-t border-rule bg-paper">
        <div className="shell section-y">
          <Reveal from="up" className="mb-6 sm:mb-9">
            <p className="eyebrow mb-4">On campus</p>
            <h2 className="text-[length:var(--text-3xl)]">Campus life</h2>
          </Reveal>

          <Stagger className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-5">
            {home.campusLife.map((c) => (
              <StaggerItem key={c.title}>
                <Link
                  href={c.href}
                  className="group block h-full overflow-hidden rounded-xl border border-rule bg-paper transition-all duration-500 hover:-translate-y-1 hover:shadow-lift"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-linen">
                    <CardImage src={c.image} sizes="(max-width: 1024px) 50vw, 33vw" />
                  </div>
                  <div className="flex items-center justify-between gap-2 p-3.5 sm:p-5">
                    <h3 className="text-[length:var(--text-sm)] leading-snug transition-colors group-hover:text-brand sm:text-[length:var(--text-lg)]">
                      {c.title}
                    </h3>
                    <span className="hidden text-slate sm:block">
                      <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Enquiry */}
      <section className="border-t border-rule bg-shell">
        <div className="shell section-y grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-14">
          <Reveal from="right">
            <p className="eyebrow mb-4">Get in touch</p>
            <h2 className="max-w-[18ch] text-[length:var(--text-3xl)]">
              Not sure which programme fits?
            </h2>
            <p className="mt-4 max-w-[46ch] text-[length:var(--text-base)] leading-relaxed text-slate sm:text-[length:var(--text-lg)]">
              Leave your details and one of our counsellors will talk you through the
              options, eligibility and the enrollment process for the new session.
            </p>

            {/* Two columns from the narrowest screen up. Four single-line entries
                down the left edge of a phone leave the right half of it empty and
                push the form a long way down. */}
            <dl className="mt-7 grid grid-cols-2 gap-x-5 gap-y-4 sm:gap-x-8">
              {[
                { t: 'General enquiries', v: 'info@vimst.org' },
                { t: 'Verification', v: 'verification@vimst.org' },
                { t: 'Administration', v: 'admin@vimst.org' },
                { t: 'Location', v: 'Andhra Pradesh, India' },
              ].map((x) => (
                <div key={x.t} className="min-w-0 border-t border-rule pt-3">
                  <dt className="text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.12em] text-mist">
                    {x.t}
                  </dt>
                  <dd className="mt-1 break-words text-[length:var(--text-sm)] text-graphite sm:text-[length:var(--text-base)]">
                    {x.v.includes('@') ? (
                      <a
                        href={`mailto:${x.v}`}
                        className="mg-underline -my-2 inline-block py-2 transition-colors hover:text-brand"
                      >
                        {x.v}
                      </a>
                    ) : (
                      x.v
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal from="left" delay={0.12}>
            <CallbackForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}

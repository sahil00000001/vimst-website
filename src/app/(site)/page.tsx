import Link from 'next/link';
import { CallbackForm } from '@/components/CallbackForm';
import { CourseCard } from '@/components/CourseCard';
import { Hero, Arrow } from '@/components/Hero';
import { Media } from '@/components/Media';
import { Parallax, ParallaxPlate, Reveal, Stagger, StaggerItem } from '@/components/Motion';
import { NewsTicker } from '@/components/NewsTicker';
import { ACCENT_CLASS, accentForStream } from '@/lib/accents';
import { courses, coursesByStream, departments, home } from '@/lib/content';

/* A representative programme from each stream for the home page grid. */
function featuredCourses() {
  const picked = [
    'bca',
    'mba',
    'bachelor-computer-engineering',
    'diploma-mechanical-engineering',
    'msc',
    'bcom',
  ];
  const byPick = picked
    .map((slug) => courses.find((c) => c.slug === slug))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  return byPick.length >= 6 ? byPick : courses.slice(0, 6);
}

export default function HomePage() {
  const streams = coursesByStream();
  const featured = featuredCourses();

  return (
    <>
      <Hero
        slides={home.carousel}
        stats={[
          { value: courses.length, suffix: '', label: 'Programmes' },
          { value: departments().length, suffix: '', label: 'Departments' },
          { value: 0, static: 'ISO', label: '9001:2008' },
        ]}
      />

      {/* Welcome + notices */}
      <section className="relative border-t border-rule bg-paper">
        <div className="shell section-y grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <Reveal from="up">
              <p className="eyebrow mb-5">Welcome</p>
              <h2 className="max-w-[18ch] text-[length:var(--text-3xl)]">
                Vivekananda Institute of{' '}
                <em className="not-italic text-crimson">Management Science and Technology</em>
              </h2>
            </Reveal>
            <Reveal from="up" delay={0.12} className="prose-mg mt-7">
              <p>{home.about.body}</p>
            </Reveal>
            <Reveal from="up" delay={0.2} className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/about"
                className="group inline-flex items-center gap-2 rounded-full border border-rule bg-paper px-6 py-3 text-[length:var(--text-sm)] font-medium text-ink transition-colors duration-300 hover:border-ink"
              >
                About the college
                <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/quality-policy"
                className="inline-flex items-center rounded-full px-6 py-3 text-[length:var(--text-sm)] font-medium text-slate transition-colors hover:text-crimson"
              >
                Quality policy
              </Link>
            </Reveal>
          </div>

          <Reveal className="lg:col-span-5" from="left" delay={0.14}>
            <NewsTicker items={home.news} />
          </Reveal>
        </div>
      </section>

      {/* Director — image plate parallaxes behind the quote */}
      <section className="relative border-t border-rule bg-shell">
        <div className="shell section-y">
          <Reveal from="up">
            <div className="grid overflow-hidden rounded-2xl border border-rule bg-paper lg:grid-cols-12">
              {home.director.image && (
                <div className="relative aspect-[4/3] overflow-hidden lg:col-span-4 lg:aspect-auto">
                  <ParallaxPlate speed={0.12}>
                    <Media
                      src={home.director.image}
                      alt="Director of VIMST"
                      fill
                      sizes="(max-width: 1024px) 100vw, 34vw"
                      className="object-cover object-top"
                    />
                  </ParallaxPlate>
                </div>
              )}
              <div className="flex flex-col justify-center p-7 sm:p-10 lg:col-span-8 lg:p-14">
                <p className="eyebrow mb-5">From the desk</p>
                <h2 className="text-[length:var(--text-3xl)]">
                  Director&rsquo;s <em className="not-italic text-crimson">Message</em>
                </h2>
                <blockquote className="mt-6 border-l-2 border-crimson pl-5 font-display text-[length:var(--text-xl)] italic leading-relaxed text-graphite">
                  &ldquo;We shape minds and shape lives.&rdquo;
                </blockquote>
                <div className="prose-mg mt-6">
                  <p>
                    {home.director.body.replace(
                      /^"We shape minds and shape lives"\.?\s*/i,
                      ''
                    )}
                  </p>
                </div>
                <Link
                  href="/director-message"
                  className="group mt-8 inline-flex w-fit items-center gap-2 border-b border-ink pb-1 text-[length:var(--text-sm)] font-medium text-ink transition-colors hover:border-crimson hover:text-crimson"
                >
                  Read the full message
                  <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Streams */}
      <section className="border-t border-rule bg-paper">
        <div className="shell section-y">
          <Reveal from="up" className="mb-10 flex flex-wrap items-end justify-between gap-6 sm:mb-12">
            <div>
              <p className="eyebrow mb-5">Courses offered</p>
              <h2 className="max-w-[14ch] text-[length:var(--text-3xl)]">
                Six streams,{' '}
                <em className="not-italic text-crimson">{courses.length} programmes</em>
              </h2>
            </div>
            <Link
              href="/courses"
              className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[length:var(--text-sm)] font-medium text-paper transition-colors hover:bg-crimson"
            >
              Browse all
              <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Reveal>

          <Stagger className="grid gap-px overflow-hidden rounded-xl border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-3">
            {streams.map((s) => {
              const accent = ACCENT_CLASS[accentForStream(s.stream)];
              return (
              <StaggerItem key={s.stream} className="bg-paper">
                <Link
                  href={`/courses?stream=${encodeURIComponent(s.stream)}`}
                  className="group relative flex h-full flex-col justify-between gap-8 overflow-hidden p-7 transition-colors duration-500 hover:bg-shell sm:p-8"
                >
                  {/* Crimson wipe that rises from the bottom on hover. */}
                  <span
                    aria-hidden
                    className={`pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 ${accent.dot}`}
                  />
                  <div>
                    <div className="mb-5 flex items-baseline justify-between">
                      <h3
                        className={`font-display text-[length:var(--text-2xl)] text-ink transition-colors ${accent.hoverText}`}
                      >
                        {s.stream}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[length:var(--text-2xs)] font-semibold tabular-nums ${accent.bg} ${accent.text}`}
                      >
                        {String(s.courses.length).padStart(2, '0')}
                      </span>
                    </div>
                    <ul className="space-y-1.5">
                      {s.courses.slice(0, 4).map((c) => (
                        <li key={c.slug} className="text-[length:var(--text-sm)] text-slate">
                          {c.title}
                        </li>
                      ))}
                      {s.courses.length > 4 && (
                        <li className="text-[length:var(--text-sm)] text-mist">
                          + {s.courses.length - 4} more
                        </li>
                      )}
                    </ul>
                  </div>
                  <span className="inline-flex items-center gap-2 text-[length:var(--text-sm)] font-medium text-ink">
                    View stream
                    <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
              </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* Featured programmes */}
      <section className="border-t border-rule bg-shell">
        <div className="shell section-y">
          <Reveal from="up" className="mb-10 sm:mb-12">
            <p className="eyebrow mb-5">Popular right now</p>
            <h2 className="max-w-[16ch] text-[length:var(--text-3xl)]">
              Programmes students <em className="not-italic text-crimson">ask about most</em>
            </h2>
          </Reveal>

          <Stagger className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {featured.map((c) => (
              <StaggerItem key={c.slug}>
                <CourseCard course={c} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Discover more */}
      <section className="border-t border-rule bg-paper">
        <div className="shell section-y">
          <Reveal from="up" className="mb-10 sm:mb-12">
            <p className="eyebrow mb-5">Beyond the classroom</p>
            <h2 className="text-[length:var(--text-3xl)]">
              Discover <em className="not-italic text-crimson">more</em>
            </h2>
          </Reveal>

          <div className="grid gap-5 sm:gap-6 lg:grid-cols-2">
            {home.discover.map((d, i) => (
              <Reveal key={d.title} from={i % 2 === 0 ? 'right' : 'left'} delay={(i % 2) * 0.08}>
                <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-rule bg-paper transition-all duration-500 hover:border-parchment hover:shadow-lift sm:flex-row">
                  {d.image && (
                    <div className="relative aspect-[16/10] shrink-0 overflow-hidden sm:aspect-auto sm:w-[42%]">
                      <Media
                        src={d.image}
                        fill
                        sizes="(max-width: 640px) 100vw, 40vw"
                        className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col justify-center p-6 sm:p-7">
                    <h3 className="font-display text-[length:var(--text-xl)] text-ink">
                      {d.title}
                    </h3>
                    <p className="mt-3 text-[length:var(--text-sm)] leading-relaxed text-slate">
                      {d.body}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Campus life — each tile's image parallaxes inside its frame */}
      <section className="border-t border-rule bg-shell">
        <div className="shell section-y">
          <Reveal from="up" className="mb-10 sm:mb-12">
            <p className="eyebrow mb-5">On campus</p>
            <h2 className="text-[length:var(--text-3xl)]">
              Campus <em className="not-italic text-crimson">life</em>
            </h2>
          </Reveal>

          <Stagger className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {home.campusLife.map((c) => (
              <StaggerItem key={c.title}>
                <Link
                  href={c.href}
                  className="group block overflow-hidden rounded-xl border border-rule bg-paper transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lift"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-linen">
                    <ParallaxPlate speed={0.1}>
                      <Media
                        src={c.image}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                      />
                    </ParallaxPlate>
                  </div>
                  <div className="flex items-center justify-between gap-4 p-5 sm:p-6">
                    <h3 className="font-display text-[length:var(--text-lg)] text-ink transition-colors group-hover:text-crimson">
                      {c.title}
                    </h3>
                    <span className="text-slate">
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
      <section className="relative overflow-hidden border-t border-rule bg-paper">
        <Parallax speed={0.12} className="pointer-events-none absolute -right-24 top-0 h-full w-1/2 opacity-[0.05]">
          <div className="h-full w-full bg-[radial-gradient(circle_at_60%_40%,var(--color-crimson),transparent_65%)]" />
        </Parallax>

        <div className="shell section-y grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
          <Reveal from="right">
            <p className="eyebrow mb-5">Get in touch</p>
            <h2 className="max-w-[15ch] text-[length:var(--text-3xl)]">
              Not sure which programme <em className="not-italic text-crimson">fits</em>?
            </h2>
            <p className="mt-6 max-w-[46ch] text-[length:var(--text-lg)] leading-relaxed text-slate">
              Leave your details and one of our counsellors will talk you through the
              options, eligibility and the enrollment process for the new session.
            </p>

            <dl className="mt-9 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {[
                { t: 'General enquiries', v: 'info@vimst.org' },
                { t: 'Verification', v: 'verification@vimst.org' },
                { t: 'Administration', v: 'admin@vimst.org' },
                { t: 'Location', v: 'Andhra Pradesh, India' },
              ].map((x) => (
                <div key={x.t} className="border-t border-rule pt-4">
                  <dt className="text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.14em] text-mist">
                    {x.t}
                  </dt>
                  <dd className="mt-1.5 break-words text-[length:var(--text-base)] text-graphite">
                    {x.v.includes('@') ? (
                      <a
                        href={`mailto:${x.v}`}
                        className="mg-underline transition-colors hover:text-crimson"
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

import Link from 'next/link';
import { CallbackForm } from '@/components/CallbackForm';
import { Hero, Arrow } from '@/components/Hero';
import { isPlate, Media } from '@/components/Media';
import { Reveal, Stagger, StaggerItem } from '@/components/Motion';
import { NewsTicker } from '@/components/NewsTicker';
import { VideoFeature } from '@/components/VideoFeature';
import { accreditations, courses, coursesByStream, home } from '@/lib/content';
import { CAMPUS_VIDEO, HERO_VIDEO } from '@/lib/media';

/**
 * The Director's Message, introduced on the home page.
 *
 * This band used to carry six near-identical cards -- About Us, Vision,
 * Mission, Quality Policy, Career and this one -- under an "Explore / The
 * institute" label. Five of them are sections of the About Us page now,
 * reached from the link under the summary above, so repeating them here sent
 * a visitor to four thin pages that say what one page already says.
 *
 * What is left is the one thing none of those pages carries: the person
 * running the institute, and his photograph.
 */
const DIRECTOR = {
  title: "Director's Message",
  href: '/director-message',
  image: '/media/director.jpg',
  body: 'Education is not merely the acquisition of knowledge, but a continuous process of developing competence, character, confidence and a strong sense of responsibility.',
};

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

  return (
    <>
      {/* On a phone the page opens straight onto a photograph with nothing
          naming the place, so this band sits between the masthead and that
          picture and says where you have arrived.

          It is built from the two marks the rest of the site is built from --
          the gold hairline label and the display serif -- on the warm
          off-white the other bands use, rather than as a second heading in
          navy on white directly under a navy wordmark, which read as
          something left over rather than part of the page. "Welcome to" takes
          the label, the name takes the serif, so the two are not competing at
          the same weight.

          Not repeated on a wider screen, where the masthead carries the name
          in full, and hidden from screen readers because the hero's h1
          already says it. */}
      <div aria-hidden className="border-b border-rule bg-linen sm:hidden">
        <div className="shell py-3.5 text-center">
          <p className="inline-flex items-center gap-2.5 text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.2em] text-gold-deep">
            <span className="h-px w-5 bg-gold" />
            Welcome to
            <span className="h-px w-5 bg-gold" />
          </p>
          <p className="mt-1 font-display text-[length:var(--text-2xl)] leading-none tracking-[0.06em] text-brand">
            VIMST
          </p>
        </div>
      </div>

      <Hero slides={home.carousel} video={HERO_VIDEO}>
        <NewsTicker items={home.news} />
      </Hero>

      {/* The college and its director, in one band and side by side from the
          large breakpoint up. They used to be two bands, which put a heading,
          a paragraph and a whole screen of scrolling between a claim about
          the institute and the face of the person making it.

          The photograph runs at its own 3:2 shape rather than being cropped
          to a strip, so nothing is cut off it. */}
      <section className="relative border-t border-rule bg-paper">
        <div className="shell section-y grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-14">
          {/* Centred against the card rather than pinned to the top of the
              row: the text column is the shorter of the two, and hung from
              the top edge it read as having slipped upwards with a block of
              empty paper under it. */}
          <Reveal from="up" className="lg:col-span-6">
            <h2 className="text-[length:var(--text-3xl)]">About the college</h2>
            <div className="prose-mg mt-4 sm:mt-5">
              <p>{home.about.body}</p>
            </div>
            {/* The rest of the institute's profile -- vision, mission, values,
                quality policy, why it is here -- lives on one page, and this
                is where a visitor who has just read the summary is ready to
                ask for it. */}
            <Link
              href="/about"
              className="group mt-4 inline-flex items-center gap-2 text-[length:var(--text-sm)] font-medium text-brand sm:mt-5"
            >
              Read more about the institute
              <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Reveal>

          {/* Below the large breakpoint the message is set the way the
              summary above it is -- picture, heading, paragraph, link -- as
              part of the page rather than as a boxed card, which on a phone
              read as a second, lesser block wedged under the first. The card
              frame only returns beside the summary on a wide screen. */}
          <Reveal from="up" delay={0.12} className="lg:col-span-6">
            <div className="group lg:overflow-hidden lg:rounded-xl lg:border lg:border-rule lg:bg-shell lg:transition-all lg:duration-500 lg:hover:border-parchment lg:hover:shadow-lift">
              <Link
                href={DIRECTOR.href}
                aria-label={DIRECTOR.title}
                className="relative block aspect-[3/2] w-full overflow-hidden rounded-xl lg:rounded-none"
              >
                <CardImage
                  src={DIRECTOR.image}
                  sizes="(max-width: 1024px) 100vw, 44vw"
                  fit="cover"
                />
              </Link>
              <div className="pt-6 sm:pt-7 lg:p-6">
                <h2 className="text-[length:var(--text-3xl)] lg:text-[length:var(--text-xl)]">
                  {DIRECTOR.title}
                </h2>
                <div className="prose-mg mt-4 sm:mt-5 lg:mt-2.5">
                  <p>{DIRECTOR.body}</p>
                </div>
                <Link
                  href={DIRECTOR.href}
                  className="group/link mt-4 inline-flex items-center gap-2 text-[length:var(--text-sm)] font-medium text-brand sm:mt-5 lg:mt-4"
                >
                  Read more
                  <Arrow className="transition-transform duration-300 group-hover/link:translate-x-1" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* News & Events, phone only. Beside the picture it needs a column of
          its own, which a phone does not have; here it follows the
          Director's Message, and the picture at the top of the page is no
          longer trailed by a panel of small print before anything has been
          said. The copy beside the hero is the same board, hidden below this
          breakpoint. */}
      <section className="border-t border-rule bg-paper sm:hidden">
        <div className="shell section-y">
          <NewsTicker items={home.news} />
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

      {/* Recognition. Twelve bodies is a lot of small print, and it is also the
          most load-bearing thing on the page for someone deciding whether a
          qualification from here will count for anything. Set as a grid of
          short forms with the full name under each, it reads at a glance and
          still says exactly what each one is. */}
      <section className="border-t border-rule bg-shell">
        <div className="shell section-y">
          <Reveal from="up" className="mb-6 sm:mb-9">
            <p className="eyebrow mb-4">Recognition</p>
            <h2 className="text-[length:var(--text-3xl)]">
              Quality and professional associations
            </h2>
            <p className="mt-3 max-w-[60ch] text-[length:var(--text-base)] leading-relaxed text-slate">
              The institute is registered under an act of the Government of Andhra
              Pradesh, India, and is associated with the following quality,
              professional and accreditation frameworks, as applicable to the
              respective programmes and certifications.
            </p>
          </Reveal>

          <Stagger className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
            {accreditations.map((a) => (
              <StaggerItem key={a.abbr}>
                <div className="flex h-full flex-col gap-1 rounded-xl border border-rule bg-paper p-3.5 sm:p-4">
                  <p className="font-display text-[length:var(--text-base)] leading-snug text-brand">
                    {a.abbr}
                  </p>
                  <p className="text-[length:var(--text-2xs)] leading-relaxed text-slate sm:text-[length:var(--text-xs)]">
                    {a.name}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
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

      {/* Campus life */}
      <section className="border-t border-rule bg-paper">
        <div className="shell section-y">
          <Reveal from="up" className="mb-6 sm:mb-9">
            <p className="eyebrow mb-4">On campus</p>
            <h2 className="text-[length:var(--text-3xl)]">Campus life</h2>
          </Reveal>

          <Stagger className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
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

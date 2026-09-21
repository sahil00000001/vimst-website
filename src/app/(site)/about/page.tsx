import type { Metadata } from 'next';
import Link from 'next/link';
import { Arrow } from '@/components/Hero';
import { Reveal, Stagger, StaggerItem } from '@/components/Motion';
import { PageBanner } from '@/components/PageBanner';
import { accreditations, courses, page as getPage } from '@/lib/content';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Established in 1997, Vivekananda Institute of Management Science and Technology offers accessible, structured and career-oriented education through Regular and Part-Time programmes, with an emphasis on quality, professional development and continuous improvement.',
};

/**
 * The institutional profile.
 *
 * The page is written rather than generated: the copy below is the
 * institute's own profile text, kept in one array per section so the markup
 * stays readable and nothing has to be escaped inside JSX.
 *
 * It reads as a sequence of bands in the house rhythm -- eyebrow, heading,
 * body, alternating paper and shell -- rather than one long column of prose,
 * because nine sections of continuous text is a scroll nobody finishes on a
 * phone.
 */

const ABOUT = [
  'Established in 1997, Vivekananda Institute of Management Science and Technology is an educational institution committed to promoting accessible, structured, and career-oriented education. The Institute aims to provide learners with opportunities to develop academic knowledge, professional competencies, practical understanding, and skills relevant to the evolving requirements of higher education and the professional world.',
  'The Institute offers a range of educational programmes through Regular and Part-Time modes, providing flexibility to students and working professionals who wish to pursue their academic and professional development alongside their other commitments.',
  'With an emphasis on quality-oriented education, continuous learning, professional development, and practical exposure, the Institute strives to create a learning environment that encourages academic growth, discipline, confidence, and responsible professional conduct.',
  "The Institute's profile includes associations, certifications, quality frameworks, and references to various educational, management, quality-assurance, and accreditation organisations, as applicable to the respective programmes and certifications.",
];

const VISION = [
  'To emerge as a progressive and quality-focused educational institution that contributes to the development of knowledgeable, skilled, ethical, and professionally competent individuals.',
  'We envision an educational ecosystem where learners are encouraged to pursue excellence, develop practical competencies, embrace continuous learning, and contribute positively to society and the professional world.',
];

const MISSION = [
  'Provide accessible and structured educational opportunities to learners from diverse backgrounds.',
  'Promote academic excellence through systematic and learner-centric education.',
  'Develop practical knowledge and professional skills relevant to contemporary requirements.',
  'Encourage innovation, critical thinking, discipline, and lifelong learning.',
  'Provide flexible Regular and Part-Time learning opportunities for students and working professionals.',
  'Foster an environment that supports personal, academic, and professional development.',
  'Maintain a strong commitment towards quality, transparency, and continuous improvement.',
];

const VALUES = [
  {
    title: 'Academic Excellence',
    body: 'We strive to encourage high standards of learning, knowledge development, and academic growth.',
  },
  {
    title: 'Integrity',
    body: 'We believe in ethical conduct, transparency, accountability, and responsible educational practices.',
  },
  {
    title: 'Student-Centric Learning',
    body: 'Our learners remain at the centre of our educational approach, with emphasis on their academic and professional development.',
  },
  {
    title: 'Continuous Improvement',
    body: 'We believe that education is an evolving process and continuously encourage improvement in teaching, learning, systems, and practices.',
  },
  {
    title: 'Professional Development',
    body: 'We aim to equip learners with knowledge and competencies that support their academic and professional aspirations.',
  },
  {
    title: 'Accessibility & Flexibility',
    body: 'Through Regular and Part-Time programmes, we seek to make educational opportunities more flexible and accessible.',
  },
  {
    title: 'Social Responsibility',
    body: 'We encourage learners to develop a responsible attitude towards society, professional life, and the wider community.',
  },
];

const QUALITY_POLICY = [
  'Maintaining consistent standards in educational delivery.',
  'Supporting effective and learner-focused academic processes.',
  'Encouraging continuous improvement in institutional systems.',
  'Promoting professional and practical learning.',
  'Developing a culture of discipline, responsibility, and accountability.',
  'Responding to the changing needs of learners and the professional environment.',
  'Striving for continual improvement in the effectiveness of the Quality Management System.',
];

const APPROACH = [
  'We believe that meaningful education goes beyond classroom learning. Our educational approach seeks to integrate knowledge, practical understanding, professional skills, discipline, and continuous development.',
  'Through our Regular and Part-Time programmes, learners are provided with flexible pathways for pursuing education according to their individual academic and professional requirements.',
];

const DEVELOP = [
  'Strong conceptual knowledge',
  'Practical and professional skills',
  'Analytical and critical-thinking abilities',
  'Communication and interpersonal skills',
  'Confidence and leadership qualities',
  'A commitment to continuous learning',
];

const WHY = [
  {
    title: 'Established Educational Legacy',
    body: 'With an institutional journey dating back to 1997, the Institute represents a long-standing commitment to education and professional development.',
  },
  {
    title: 'Flexible Learning Options',
    body: 'Regular and Part-Time programmes provide learners with greater flexibility to pursue their educational goals.',
  },
  {
    title: 'Career-Oriented Education',
    body: 'Our programmes aim to develop knowledge and competencies that can support learners in their academic and professional journeys.',
  },
  {
    title: 'Quality-Focused Approach',
    body: 'The Institute follows a structured approach towards quality, continuous improvement, and systematic educational processes.',
  },
  {
    title: 'Professional Development',
    body: 'We focus on developing not only academic knowledge but also practical understanding, professional skills, and personal confidence.',
  },
  {
    title: 'Learner-Centric Environment',
    body: 'We aim to create an environment that supports the individual learning and development needs of students and working professionals.',
  },
  {
    title: 'Commitment to Continuous Growth',
    body: 'Our objective is to continuously improve our academic and institutional practices in response to the changing needs of learners and the professional world.',
  },
];

const COMMITMENT = [
  'At Vivekananda Institute of Management Science and Technology, we believe that education plays a vital role in shaping individuals and contributing to the development of society.',
  'Our commitment is to provide an environment that encourages learning, professional development, discipline, innovation, integrity, and continuous improvement.',
  'We aspire to empower learners with the knowledge, skills, confidence, and values required to pursue their academic and professional aspirations and become responsible contributors to society.',
];

const STRAPLINE = [
  'Established in 1997',
  'Regular & Part-Time Education',
  'Quality-Focused Learning',
  'Professional Development',
];

/** A list in the house style: gold dot, body copy, comfortable line length. */
function Bullets({ items, split = false }: { items: string[]; split?: boolean }) {
  return (
    <ul className={`grid gap-2.5 sm:gap-3 ${split ? 'sm:grid-cols-2 sm:gap-x-8' : ''}`}>
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-3 text-[length:var(--text-base)] leading-relaxed text-graphite"
        >
          <span
            className="mt-[0.62em] h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
            aria-hidden
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function AboutPage() {
  const banner = getPage('about').banner;

  return (
    <>
      <PageBanner
        eyebrow="Institutional profile"
        title="About Us"
        intro="Established in 1997 · Regular and Part-Time education, offered with an emphasis on quality, professional development and continuous improvement."
        image={banner}
        crumbs={[{ label: 'About Us' }]}
        meta={[
          { label: 'Established', value: '1997' },
          { label: 'Modes of study', value: 'Regular & Part-Time' },
          { label: 'Programmes', value: `${courses.length} across six streams` },
        ]}
        wide
        attached={false}
      />

      {/* About us */}
      <section className="bg-shell">
        <div className="shell grid gap-5 pb-12 pt-10 sm:pb-16 sm:pt-14 lg:grid-cols-12 lg:gap-14">
          <Reveal from="up" className="lg:col-span-4">
            <p className="eyebrow mb-4">Who we are</p>
            <h2 className="text-[length:var(--text-3xl)]">About us</h2>
          </Reveal>
          <Reveal from="up" delay={0.1} className="prose-mg lg:col-span-8">
            {ABOUT.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Quality and professional associations. The twelve bodies are the same
          list the home page carries, read from the content data rather than
          typed out again, so the two can never drift apart. */}
      <section className="border-t border-rule bg-paper">
        <div className="shell section-y">
          <Reveal from="up" className="mb-6 sm:mb-9">
            <p className="eyebrow mb-4">Recognition</p>
            <h2 className="text-[length:var(--text-3xl)]">
              Quality &amp; professional associations
            </h2>
          </Reveal>

          <Stagger className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
            {accreditations.map((a) => (
              <StaggerItem key={a.abbr}>
                <div className="flex h-full flex-col gap-1 rounded-xl border border-rule bg-shell p-3.5 sm:p-4">
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

          <Reveal from="up" delay={0.1}>
            <p className="mt-5 max-w-[68ch] text-[length:var(--text-sm)] leading-relaxed text-slate">
              And other relevant educational, professional, quality, and accreditation
              frameworks, as applicable.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Vision and mission, side by side: one is the destination, the other
          is how the institute says it gets there. */}
      <section className="border-t border-rule bg-shell">
        <div className="shell section-y grid gap-9 lg:grid-cols-2 lg:gap-14">
          <Reveal from="up">
            <p className="eyebrow mb-4">Where we are going</p>
            <h2 className="mb-5 text-[length:var(--text-3xl)]">Our vision</h2>
            <div className="prose-mg">
              {VISION.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </Reveal>

          <Reveal from="up" delay={0.1}>
            <p className="eyebrow mb-4">How we get there</p>
            <h2 className="mb-5 text-[length:var(--text-3xl)]">Our mission</h2>
            <Bullets items={MISSION} />
          </Reveal>
        </div>
      </section>

      {/* Core values */}
      <section className="border-t border-rule bg-paper">
        <div className="shell section-y">
          <Reveal from="up" className="mb-6 sm:mb-9">
            <p className="eyebrow mb-4">What we hold to</p>
            <h2 className="text-[length:var(--text-3xl)]">Our core values</h2>
          </Reveal>

          <Stagger className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {VALUES.map((v) => (
              <StaggerItem key={v.title}>
                <div className="flex h-full flex-col rounded-xl border border-rule bg-shell p-4 sm:p-5">
                  <h3 className="text-[length:var(--text-lg)]">{v.title}</h3>
                  <p className="mt-1.5 text-[length:var(--text-sm)] leading-relaxed text-slate sm:mt-2">
                    {v.body}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Quality policy */}
      <section className="border-t border-rule bg-shell">
        <div className="shell section-y grid gap-6 lg:grid-cols-12 lg:gap-14">
          <Reveal from="up" className="lg:col-span-5">
            <p className="eyebrow mb-4">Our standard</p>
            <h2 className="mb-5 text-[length:var(--text-3xl)]">Quality policy</h2>
            <div className="prose-mg">
              <p>
                Vivekananda Institute of Management Science and Technology is committed
                to maintaining a systematic and quality-oriented approach towards
                education and institutional practices.
              </p>
            </div>
          </Reveal>

          <Reveal from="up" delay={0.1} className="lg:col-span-7">
            <Bullets items={QUALITY_POLICY} />
            <p className="mt-6 border-t border-rule pt-5 text-[length:var(--text-base)] leading-relaxed text-graphite">
              The Institute aims to build a culture where quality is treated as an
              ongoing commitment rather than a one-time objective.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Educational approach */}
      <section className="border-t border-rule bg-paper">
        <div className="shell section-y grid gap-6 lg:grid-cols-12 lg:gap-14">
          <Reveal from="up" className="lg:col-span-5">
            <p className="eyebrow mb-4">How we teach</p>
            <h2 className="mb-5 text-[length:var(--text-3xl)]">
              Our educational approach
            </h2>
            <div className="prose-mg">
              {APPROACH.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </Reveal>

          <Reveal from="up" delay={0.1} className="lg:col-span-7">
            <p className="mb-4 text-[length:var(--text-base)] font-medium text-ink">
              The Institute encourages learners to develop:
            </p>
            <Bullets items={DEVELOP} split />
          </Reveal>
        </div>
      </section>

      {/* Why choose the institute. Numbered, because seven reasons in a row of
          identical cards read as a list nobody counted. */}
      <section className="border-t border-rule bg-shell">
        <div className="shell section-y">
          <Reveal from="up" className="mb-6 sm:mb-9">
            <p className="eyebrow mb-4">Why here</p>
            <h2 className="max-w-[24ch] text-[length:var(--text-3xl)]">
              Why choose Vivekananda Institute of Management Science and Technology?
            </h2>
          </Reveal>

          <Stagger className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            {WHY.map((w, i) => (
              <StaggerItem key={w.title}>
                <div className="flex h-full gap-4 rounded-xl border border-rule bg-paper p-4 sm:p-5">
                  <span
                    className="font-display text-[length:var(--text-lg)] leading-none text-gold-deep"
                    aria-hidden
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[length:var(--text-lg)]">{w.title}</h3>
                    <p className="mt-1.5 text-[length:var(--text-sm)] leading-relaxed text-slate sm:mt-2">
                      {w.body}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Our commitment, and the way out of the page. */}
      <section className="border-t border-rule bg-paper">
        <div className="shell section-y">
          <Reveal from="up">
            <div className="rounded-2xl bg-brand p-6 text-paper sm:p-10 lg:p-14">
              <p className="eyebrow mb-4 text-gold">Our commitment</p>
              <div className="grid gap-4 lg:grid-cols-3 lg:gap-10">
                {COMMITMENT.map((p) => (
                  <p
                    key={p}
                    className="text-[length:var(--text-base)] leading-relaxed text-paper/75"
                  >
                    {p}
                  </p>
                ))}
              </div>

              <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 border-t border-paper/15 pt-6 text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.16em] text-gold">
                {STRAPLINE.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>

              <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:gap-3">
                <Link
                  href="/courses"
                  className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-paper px-6 py-3.5 text-[length:var(--text-sm)] font-medium text-ink transition-colors duration-300 hover:bg-gold hover:text-ink"
                >
                  Browse programmes
                  <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full border border-paper/30 px-6 py-3.5 text-[length:var(--text-sm)] font-medium text-paper transition-colors duration-300 hover:border-paper"
                >
                  Talk to a counsellor
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

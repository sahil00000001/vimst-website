import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/Motion';
import { PageBanner } from '@/components/PageBanner';
import { page } from '@/lib/content';
import { Media } from '@/components/Media';

export const metadata: Metadata = {
  title: 'Fee Structure',
  description:
    'The published fee structure for VIMST programmes across engineering, management, science, commerce and arts.',
};

export default function FeeStructurePage() {
  const data = page('feeStructure');
  const sheet = data.images[0];

  return (
    <>
      <PageBanner
        eyebrow="Admission"
        title="Fee Structure"
        intro="The published fee schedule for all programmes. For anything not covered here, our admissions team can talk you through the details."
        image="/media/images/banner/about-us.jpg"
        crumbs={[{ label: 'Admission' }, { label: 'Fee Structure' }]}
        wide
      />

      <section className="bg-shell">
        <div className="shell pb-16 sm:pb-20 lg:pb-28">
          <div className="rounded-b-2xl border border-t-0 border-rule bg-paper px-4 py-10 sm:px-8 lg:px-12">
            {sheet ? (
              <Reveal from="up">
                <div className="mg-scroll overflow-x-auto rounded-xl border border-rule bg-shell">
                  <div className="min-w-[720px]">
                    <Media
                      src={sheet.src}
                      alt="VIMST fee structure"
                      width={1600}
                      height={2200}
                      sizes="(max-width: 1024px) 100vw, 70vw"
                      className="h-auto w-full"
                      priority
                    />
                  </div>
                </div>
                <p className="mt-4 text-center text-[length:var(--text-sm)] text-mist sm:hidden">
                  Scroll sideways to see the full table.
                </p>
              </Reveal>
            ) : (
              <p className="py-16 text-center text-slate">
                The fee schedule is being updated. Please contact the admissions office.
              </p>
            )}

            <Reveal from="up" delay={0.1} className="mt-12 grid gap-6 lg:grid-cols-3">
              {[
                {
                  t: 'How to pay',
                  b: 'Fees can be paid by demand draft, cheque, card or cash. See the accepted payment modes for details.',
                  href: '/payment-modes',
                  cta: 'Payment modes',
                },
                {
                  t: 'Which programme?',
                  b: 'Fees vary by level and stream. Check the programme page for duration and eligibility first.',
                  href: '/courses',
                  cta: 'Browse courses',
                },
                {
                  t: 'Still unsure?',
                  b: 'Our counsellors can confirm the exact amount for your programme and session.',
                  href: '/contact',
                  cta: 'Request a callback',
                },
              ].map((c) => (
                <div key={c.t} className="rounded-xl border border-rule bg-shell p-6">
                  <h3 className="font-display text-[length:var(--text-lg)]">{c.t}</h3>
                  <p className="mt-3 text-[length:var(--text-base)] leading-relaxed text-slate">{c.b}</p>
                  <Link
                    href={c.href}
                    className="group mt-5 inline-flex items-center gap-2 text-[length:var(--text-sm)] font-medium text-ink transition-colors hover:text-crimson"
                  >
                    {c.cta}
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
              ))}
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}

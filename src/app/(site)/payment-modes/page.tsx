import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Reveal, Stagger, StaggerItem } from '@/components/Motion';
import { PageBanner } from '@/components/PageBanner';
import { page } from '@/lib/content';
import { Media } from '@/components/Media';

export const metadata: Metadata = {
  title: 'Payment Modes',
  description:
    'Ways to pay your VIMST fees: debit or credit card, cash, cheque and demand draft.',
};

/* The source page shows four unlabelled payment icons; the filenames identify
   which is which, so each gets a caption and a short note here. */
const MODES: Record<string, { title: string; note: string }> = {
  card: {
    title: 'Debit / Credit Card',
    note: 'Pay by card at the institute counter or through the link shared by the admissions office.',
  },
  cash: {
    title: 'Cash',
    note: 'Cash payments are accepted at the institute counter against an official receipt.',
  },
  cha: {
    title: 'Cheque',
    note: 'Cheques should be drawn in favour of the institute and submitted to the accounts desk.',
  },
  draft: {
    title: 'Demand Draft',
    note: 'A demand draft may be couriered or handed in with your enrollment paperwork.',
  },
};

function modeFor(src: string) {
  const key = Object.keys(MODES).find((k) => src.includes(`/${k}.`));
  return key ? MODES[key] : null;
}

export default function PaymentModesPage() {
  const data = page('paymentModes');
  const modes = data.images
    .map((img) => ({ img, meta: modeFor(img.src) }))
    .filter((m): m is { img: typeof m.img; meta: NonNullable<typeof m.meta> } =>
      Boolean(m.meta)
    );

  return (
    <>
      <PageBanner
        eyebrow="Admission"
        title="Payment Modes"
        intro="Fees can be settled in whichever of these ways is most convenient for you."
        image={data.banner}
        crumbs={[{ label: 'Admission' }, { label: 'Payment Modes' }]}
        wide
      />

      <section className="bg-shell">
        <div className="shell pb-16 sm:pb-20 lg:pb-28">
          <div className="rounded-b-2xl border border-t-0 border-rule bg-paper px-5 py-10 sm:px-10 sm:py-12 lg:px-14">
            <Stagger className="grid gap-6 sm:grid-cols-2">
              {modes.map(({ img, meta }) => (
                <StaggerItem key={img.src}>
                  <article className="group flex h-full gap-6 rounded-xl border border-rule bg-paper p-6 transition-all duration-500 hover:border-parchment hover:shadow-[0_20px_44px_-32px_rgba(22,21,26,0.3)]">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-rule-soft bg-shell">
                      <Media
                        src={img.src}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div>
                      <h2 className="font-display text-[length:var(--text-xl)] text-ink">{meta.title}</h2>
                      <p className="mt-2.5 text-[length:var(--text-base)] leading-relaxed text-slate">
                        {meta.note}
                      </p>
                    </div>
                  </article>
                </StaggerItem>
              ))}
            </Stagger>

            <Reveal from="up" delay={0.1} className="mt-12">
              <div className="rounded-xl border border-rule bg-shell p-8">
                <p className="eyebrow mb-4">Before you pay</p>
                <ul className="space-y-3">
                  {[
                    'Always collect an official receipt for any payment made at the counter.',
                    'Confirm the exact fee for your programme and session with the admissions office first.',
                    'Quote your enrollment or roll number on cheques and demand drafts.',
                  ].map((t) => (
                    <li key={t} className="flex gap-3.5 text-[length:var(--text-base)] leading-relaxed text-graphite">
                      <span
                        className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand/50"
                        aria-hidden
                      />
                      {t}
                    </li>
                  ))}
                </ul>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href="/fee-structure"
                    className="rounded-full bg-ink px-6 py-3 text-[length:var(--text-sm)] font-medium text-paper transition-colors hover:bg-brand"
                  >
                    View fee structure
                  </Link>
                  <Link
                    href="/contact"
                    className="rounded-full border border-rule bg-paper px-6 py-3 text-[length:var(--text-sm)] font-medium text-ink transition-colors hover:border-ink"
                  >
                    Contact accounts
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { Reveal } from '@/components/Motion';
import { PageBanner } from '@/components/PageBanner';
import { SpecializationList } from '@/components/SpecializationList';
import { page } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Specializations',
  description:
    'The full list of specializations available alongside VIMST programmes, from Advertising Management to Fire Safety Management.',
};

/**
 * The source table is a 4-column grid of "# / Course Name" pairs. It is
 * flattened back into a single list of names so it can be searched and
 * laid out responsively.
 */
function specializationNames(rows: { text: string }[][]): string[] {
  const names: string[] = [];
  for (const row of rows) {
    for (let i = 0; i < row.length; i++) {
      const text = row[i].text.trim();
      if (!text) continue;
      // Skip the running numbers and the header cells.
      if (/^\d+$/.test(text)) continue;
      if (/^(#|course name)$/i.test(text)) continue;
      names.push(text);
    }
  }
  return [...new Set(names)];
}

export default function SpecializationsPage() {
  const data = page('specializations');
  const table = data.blocks.find((b) => b.type === 'table');
  const names = table ? specializationNames(table.rows) : [];

  return (
    <>
      <PageBanner
        eyebrow="Academics"
        title="Specializations"
        intro="Areas of specialization offered alongside the institute's degree and diploma programmes."
        image={data.banner}
        crumbs={[{ label: 'Specializations' }]}
        wide
      />

      <section className="bg-shell">
        <div className="shell pb-16 sm:pb-20 lg:pb-28">
          <div className="rounded-b-2xl border border-t-0 border-rule bg-paper px-5 py-10 sm:px-10 sm:py-12 lg:px-14">
            <SpecializationList names={names} />

            <Reveal from="up" className="mt-14 rounded-xl border border-rule bg-shell p-8">
              <h2 className="text-[length:var(--text-xl)]">Not sure which to pick?</h2>
              <p className="mt-3 max-w-xl text-[length:var(--text-base)] leading-relaxed text-slate">
                Specializations sit alongside your main programme. Browse the course
                catalogue first, then talk to a counsellor about which specialization
                pairs well with it.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/courses"
                  className="rounded-full bg-ink px-6 py-3 text-[length:var(--text-sm)] font-medium text-paper transition-colors hover:bg-crimson"
                >
                  Browse courses
                </Link>
                <Link
                  href="/contact"
                  className="rounded-full border border-rule bg-paper px-6 py-3 text-[length:var(--text-sm)] font-medium text-ink transition-colors hover:border-ink"
                >
                  Ask a counsellor
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { DocumentViewer } from '@/components/DocumentViewer';
import { Reveal } from '@/components/Motion';
import { PageBanner } from '@/components/PageBanner';
import { APPLICATION_FORM } from '@/lib/documents';

export const metadata: Metadata = {
  title: 'Download Your Form',
  description:
    'View the VIMST application form page by page, and download it as a PDF to print and fill in.',
};

/**
 * What the form itself asks for, taken from its own pages -- the checklist
 * in its "For office use only" box and the note under its payment details --
 * so an applicant can gather it before sitting down to fill the form in.
 */
const CHECKLIST = [
  'Two recent passport-size photographs',
  'Your eligibility certificate',
  'An experience certificate, if you have work experience',
  'The fee, by DD or cheque in favour of “Vivekananda Institute of Management Science and Technology”',
  'The declaration on the second page, signed and dated',
];

export default function DownloadFormPage() {
  return (
    <>
      <PageBanner
        eyebrow="Admissions"
        title="Download Your Form"
        intro="The VIMST application form, shown below page by page. Download the PDF to print it and fill it in."
        image="/media/art/admission.jpg"
        crumbs={[{ label: 'Download Your Form' }]}
        wide
      />

      <section className="bg-shell">
        <div className="shell pb-16 sm:pb-20 lg:pb-12">
          <div className="rounded-b-2xl border border-t-0 border-rule bg-paper px-5 py-10 sm:px-10 sm:py-12 lg:px-10 lg:py-8">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
              <div className="min-w-0 lg:col-span-8">
                <DocumentViewer doc={APPLICATION_FORM} />
              </div>

              <aside className="lg:col-span-4">
                <div className="space-y-5 lg:sticky lg:top-28">
                  <Reveal from="up" className="rounded-2xl border border-rule bg-shell p-6">
                    <h2 className="text-[length:var(--text-lg)]">What the form asks for</h2>
                    <ul className="mt-4 space-y-3">
                      {CHECKLIST.map((item) => (
                        <li
                          key={item}
                          className="flex gap-3 text-[length:var(--text-sm)] leading-relaxed text-graphite"
                        >
                          <span
                            className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
                            aria-hidden
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Reveal>

                  <Reveal from="up" delay={0.08} className="rounded-2xl bg-brand p-6 text-paper">
                    <h2 className="font-display text-[length:var(--text-lg)] text-paper">
                      Questions about the form?
                    </h2>
                    <p className="mt-2.5 text-[length:var(--text-sm)] leading-relaxed text-paper/75">
                      A counsellor can talk you through the programmes, eligibility and the
                      enrollment process.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2.5">
                      <Link
                        href="/contact"
                        className="inline-flex min-h-11 items-center rounded-full bg-paper px-5 text-[length:var(--text-sm)] font-medium text-ink transition-colors hover:bg-linen"
                      >
                        Contact us
                      </Link>
                      <a
                        href="mailto:info@vimst.org"
                        className="inline-flex min-h-11 items-center rounded-full border border-paper/25 px-5 text-[length:var(--text-sm)] font-medium text-paper transition-colors hover:border-paper"
                      >
                        info@vimst.org
                      </a>
                    </div>
                  </Reveal>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from 'next';
import { DocumentViewer } from '@/components/DocumentViewer';
import { PageBanner } from '@/components/PageBanner';
import { AICTE_NOTICE, fileSize, UGC_NOTICE } from '@/lib/documents';

export const metadata: Metadata = {
  title: 'Affiliation & Aggregation',
  description:
    'The AICTE public notice and the UGC notice on the equivalence of degrees, to read online or download as PDFs.',
};

const DOCUMENTS = [AICTE_NOTICE, UGC_NOTICE];

export default function AffiliationPage() {
  return (
    <>
      <PageBanner
        eyebrow="Academics"
        title="Affiliation & Aggregation"
        intro="Notices from the All India Council for Technical Education and the University Grants Commission. Read them below, or download the original PDFs."
        image="/media/art/about.jpg"
        crumbs={[{ label: 'Affiliation & Aggregation' }]}
        wide
      />

      <section className="bg-shell">
        <div className="shell pb-16 sm:pb-20 lg:pb-12">
          <div className="rounded-b-2xl border border-t-0 border-rule bg-paper px-5 py-10 sm:px-10 sm:py-12 lg:px-10 lg:py-8">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
              {/* Both documents are long, the second especially, so the page
                  opens on a short index of what it holds rather than on the
                  first page of the first one. On a wide screen the index
                  moves beside the documents and stays in view, so either is
                  a click away from anywhere in the other. */}
              <aside className="lg:order-last lg:col-span-4">
                <div className="lg:sticky lg:top-28">
                  <p className="mb-3 hidden text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.16em] text-brand lg:block">
                    On this page
                  </p>
                  <nav aria-label="Documents on this page" className="grid gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-1">
                    {DOCUMENTS.map((doc, i) => (
                      <a
                        key={doc.id}
                        href={`#${doc.id}`}
                        className="group flex items-center justify-between gap-4 rounded-xl border border-rule bg-shell p-4 transition-colors duration-300 hover:border-brand hover:bg-paper sm:p-5"
                      >
                        <span className="min-w-0">
                          <span className="block text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.14em] text-mist">
                            {String(i + 1).padStart(2, '0')} · {doc.pages.length} pages · {fileSize(doc.bytes)}
                          </span>
                          <span className="mt-1 block font-display text-[length:var(--text-base)] leading-snug text-brand">
                            {doc.title}
                          </span>
                        </span>
                        <svg
                          width="10"
                          height="13"
                          viewBox="0 0 10 13"
                          fill="none"
                          aria-hidden
                          className="shrink-0 text-slate transition-transform duration-300 group-hover:translate-y-0.5 group-hover:text-brand"
                        >
                          <path
                            d="M5 1v10M1.5 7.5L5 11l3.5-3.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>

              <div className="min-w-0 space-y-14 sm:space-y-20 lg:col-span-8">
                {DOCUMENTS.map((doc) => (
                  <DocumentViewer key={doc.id} doc={doc} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

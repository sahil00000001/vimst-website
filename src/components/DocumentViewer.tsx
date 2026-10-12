import { Media } from './Media';
import { Reveal } from './Motion';
import { fileSize, type SiteDocument } from '@/lib/documents';

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="shrink-0">
      <path
        d="M7 1.5v7.5M3.75 5.75L7 9l3.25-3.25M2 12.5h10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function OpenIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden className="shrink-0">
      <path
        d="M7.5 1.5h4v4M11.5 1.5L6 7M5 2.5H2.5a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Download and open, side by side from the narrowest screen up: two short
 * buttons sit comfortably in a phone's width, and stacked they cost a second
 * row for nothing. Download has the longer label and gets the larger share
 * of the row, so neither wraps on a 320px screen.
 */
export function DocumentActions({ doc, className = '' }: { doc: SiteDocument; className?: string }) {
  return (
    <div className={`flex gap-2.5 sm:flex-wrap sm:gap-3 ${className}`}>
      <a
        href={doc.pdf}
        download={doc.downloadAs}
        className="inline-flex min-h-12 flex-[1.3_1_0%] items-center justify-center gap-2 whitespace-nowrap rounded-full bg-brand px-3 py-3 text-[length:var(--text-sm)] font-medium text-paper transition-colors duration-300 hover:bg-brand-deep sm:flex-none sm:px-6"
      >
        <DownloadIcon />
        Download PDF
      </a>
      <a
        href={doc.pdf}
        target="_blank"
        rel="noopener"
        className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-rule bg-paper px-3 py-3 text-[length:var(--text-sm)] font-medium text-ink transition-colors duration-300 hover:border-ink sm:flex-none sm:px-6"
      >
        <OpenIcon />
        Open PDF
      </a>
    </div>
  );
}

/**
 * A PDF shown on the page, one picture per page, with the file itself to
 * download or open.
 *
 * Not an <iframe>. A phone cannot be relied on to draw a PDF inside a page --
 * Chrome on Android leaves the frame empty and Safari on iOS stops after the
 * first page -- and the documents here are scans, so pictures of the pages
 * (drawn by `npm run documents`) show everything the PDF does, at every width,
 * with nothing to load first.
 *
 * Each page opens full size on its own when tapped, which on a phone is where
 * pinching to read the small print works best.
 */
export function DocumentViewer({ doc }: { doc: SiteDocument }) {
  const total = doc.pages.length;

  return (
    <article id={doc.id} className="scroll-mt-28">
      <Reveal
        from="up"
        className="flex flex-col gap-5 border-b border-rule-soft pb-6 sm:pb-7 lg:flex-row lg:items-end lg:justify-between lg:gap-8"
      >
        <div className="max-w-[62ch]">
          <p className="eyebrow mb-3">
            PDF · {total} page{total === 1 ? '' : 's'} · {fileSize(doc.bytes)}
          </p>
          <h2 className="text-[length:var(--text-2xl)]">{doc.title}</h2>
          <p className="mt-2.5 text-[length:var(--text-base)] leading-relaxed text-slate">
            {doc.description}
          </p>
        </div>
        <DocumentActions doc={doc} className="shrink-0" />
      </Reveal>

      {/* Held to the width at which a scanned A4 page reads at about the
          size it was printed; any wider and the page alone is taller than
          two laptop screens. On a phone it runs a little into the card's
          padding, since every pixel of width is legibility there. */}
      <ol className="-mx-2 mt-7 space-y-6 sm:mx-auto sm:mt-9 sm:max-w-[860px] sm:space-y-8">
        {doc.pages.map((src, i) => (
          <li key={src}>
            <a
              href={src}
              target="_blank"
              rel="noopener"
              aria-label={`${doc.title}, page ${i + 1} of ${total}. Opens full size.`}
              className="group block"
            >
              <span className="block overflow-hidden rounded-lg border border-rule bg-paper shadow-[0_18px_44px_-28px_rgba(22,21,26,0.4)] transition-shadow duration-500 group-hover:shadow-lift">
                <Media
                  src={src}
                  alt={`${doc.title}, page ${i + 1} of ${total}`}
                  sizes="(max-width: 640px) 100vw, 860px"
                  className="h-auto w-full"
                />
              </span>
              {/* Under the page rather than over it: a scan carries print
                  right to its corners, and a badge anywhere on it covers a
                  line of somebody's form. */}
              <span className="mt-2.5 flex items-center justify-between gap-3 px-1 text-[length:var(--text-2xs)] font-medium">
                <span className="uppercase tracking-[0.14em] text-mist">
                  Page {i + 1} of {total}
                </span>
                <span className="inline-flex min-h-8 items-center gap-1.5 text-brand">
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
                    <circle cx="5" cy="5" r="3.6" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M7.8 7.8L11 11M5 3.4v3.2M3.4 5h3.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  <span className="mg-underline">View full size</span>
                </span>
              </span>
            </a>
          </li>
        ))}
      </ol>

      {/* The same two buttons again at the foot, so whoever has just read to
          the last page does not have to scroll back up for them. */}
      <div className="mt-7 flex flex-col items-center gap-3 border-t border-rule-soft pt-6 text-center sm:mx-auto sm:mt-9 sm:max-w-[860px]">
        <p className="text-[length:var(--text-sm)] text-slate">
          {doc.title} · {fileSize(doc.bytes)}
        </p>
        <DocumentActions doc={doc} className="w-full sm:w-auto" />
      </div>
    </article>
  );
}

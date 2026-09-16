import Link from 'next/link';

/**
 * Vertical marquee of notices. The list is duplicated so the CSS animation can
 * translate a full 50% and loop without a visible seam; the copy is paused on
 * hover and hidden from assistive tech in the duplicated half.
 */
export function NewsTicker({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-rule bg-paper">
      <div className="flex items-center justify-between gap-3 border-b border-rule bg-linen px-6 py-4">
        <h2 className="flex items-center gap-2.5 text-[length:var(--text-xs)] font-semibold uppercase tracking-[0.16em] text-brand">
          <span className="relative flex h-2 w-2" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
          </span>
          News &amp; Events
        </h2>
        <Link
          href="/contact"
          className="-my-2 inline-flex min-h-11 items-center px-1 text-[length:var(--text-xs)] text-slate transition-colors hover:text-brand"
        >
          Enquire
        </Link>
      </div>

      {/* The minimum height is there so the marquee has something to scroll
          through. With one notice nothing scrolls, and reserving 280px for it
          just leaves a blank panel under the text on a phone. */}
      <div
        className={`relative flex-1 overflow-hidden ${
          items.length > 1 ? 'min-h-[280px]' : ''
        }`}
      >
        <div className={`absolute inset-x-0 top-0 ${items.length > 1 ? 'mg-marquee' : ''}`}>
          {(items.length > 1 ? [0, 1] : [0]).map((copy) => (
            <ul key={copy} aria-hidden={copy === 1 ? true : undefined}>
              {items.map((item, i) => (
                <li
                  key={`${copy}-${i}`}
                  className="border-b border-rule-soft px-6 py-5 text-[length:var(--text-sm)] leading-relaxed text-graphite"
                >
                  <span className="mb-2 block text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.14em] text-mist">
                    Notice
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          ))}
        </div>
        {/* Fade the ends so items enter and leave softly. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-paper to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-paper to-transparent" />
      </div>
    </div>
  );
}

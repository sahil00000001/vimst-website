import Link from 'next/link';

function NoticeList({ items, hidden }: { items: string[]; hidden?: boolean }) {
  return (
    <ul aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <li
          key={i}
          className="border-b border-rule-soft px-5 py-4 text-[length:var(--text-sm)] leading-relaxed text-graphite last:border-b-0 sm:px-6 sm:py-5"
        >
          <span className="mb-1.5 block text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.14em] text-mist">
            Notice
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

/**
 * The notice board, beside the picture at the top of the home page.
 *
 * Two shapes, because one does not fit both cases. With several notices it is a
 * vertical marquee: the list is duplicated so the CSS animation can translate a
 * full 50% and loop without a visible seam, the copy is paused on hover, and the
 * duplicated half is hidden from assistive tech. That scroller has to be given a
 * height, since its list is taken out of flow to slide.
 *
 * With a single notice nothing scrolls, so it is rendered in normal flow and
 * sizes to its own text. Running it through the scroller instead meant either a
 * panel padded out to 280px with blank paper under one paragraph, or -- once
 * that minimum was removed -- a header bar with nothing under it at all, because
 * an absolutely positioned list contributes no height to its parent.
 */
export function NewsTicker({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  const marquee = items.length > 1;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-rule bg-paper">
      <div className="flex items-center justify-between gap-3 border-b border-rule bg-linen px-5 py-3.5 sm:px-6 sm:py-4">
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

      {marquee ? (
        <div className="relative min-h-[260px] flex-1 overflow-hidden">
          <div className="mg-marquee absolute inset-x-0 top-0">
            <NoticeList items={items} />
            <NoticeList items={items} hidden />
          </div>
          {/* Fade the ends so items enter and leave softly. */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-paper to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-paper to-transparent" />
        </div>
      ) : (
        /* Centred, because the panel is stretched to the height of the picture
           beside it and one notice does not fill that. Pinned to the top it
           reads as a panel that failed to load the rest. */
        <div className="flex flex-1 flex-col justify-center">
          <NoticeList items={items} />
        </div>
      )}
    </div>
  );
}

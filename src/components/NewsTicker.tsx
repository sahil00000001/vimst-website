import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { NewsItem } from '@/lib/content';

/** Seconds each notice spends crossing the board, so more notices never means faster ones. */
const PER_NOTICE = 6;

function NoticeList({
  items,
  hidden,
  looped,
}: {
  items: NewsItem[];
  hidden?: boolean;
  /** Every notice keeps its bottom rule, so the seam between the two copies has one too. */
  looped?: boolean;
}) {
  return (
    <ul aria-hidden={hidden || undefined}>
      {items.map((item, i) => {
        const body = (
          <>
            <span className="mb-1.5 flex items-center justify-between gap-3 text-[length:var(--text-2xs)] font-semibold uppercase tracking-[0.14em] text-brand">
              <span className="flex items-center gap-2">
                <span className="h-px w-3.5 bg-gold" aria-hidden />
                {item.tag}
              </span>
              {item.href && (
                <svg width="13" height="10" viewBox="0 0 13 10" fill="none" aria-hidden className="shrink-0">
                  <path
                    d="M1 5h10M7.5 1.5L11 5l-3.5 3.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-transform duration-300 group-hover:translate-x-0.5"
                  />
                </svg>
              )}
            </span>
            <span className="block">{item.text}</span>
          </>
        );
        const box =
          'block px-5 py-4 text-[length:var(--text-sm)] leading-relaxed text-graphite sm:px-6 sm:py-5';
        return (
          <li
            key={i}
            className={`border-b border-rule-soft ${looped ? '' : 'last:border-b-0'}`}
          >
            {item.href ? (
              <Link
                href={item.href}
                /* The copy is for the eye only: keyboard focus stops on each
                   notice once, in the first list. */
                tabIndex={hidden ? -1 : undefined}
                className={`group ${box} transition-colors hover:bg-shell`}
              >
                {body}
              </Link>
            ) : (
              <div className={box}>{body}</div>
            )}
          </li>
        );
      })}
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
 * height, since its list is taken out of flow to slide. Its speed is set by the
 * number of notices, so adding one lengthens the loop rather than hurrying
 * every notice past.
 *
 * With a single notice nothing scrolls, so it is rendered in normal flow and
 * sizes to its own text. Running it through the scroller instead meant either a
 * panel padded out to 280px with blank paper under one paragraph, or -- once
 * that minimum was removed -- a header bar with nothing under it at all, because
 * an absolutely positioned list contributes no height to its parent.
 */
export function NewsTicker({ items }: { items: NewsItem[] }) {
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
        /* Taller on a phone, where the board has a band of its own rather than
           the height of the picture beside it, so two or three notices are in
           view at once. */
        <div className="mg-marquee-frame relative min-h-[340px] flex-1 overflow-hidden sm:min-h-[300px]">
          <div
            className="mg-marquee absolute inset-x-0 top-0"
            style={{ '--marquee-duration': `${items.length * PER_NOTICE}s` } as CSSProperties}
          >
            <NoticeList items={items} looped />
            <NoticeList items={items} looped hidden />
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

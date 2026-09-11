import { Media } from './Media';
import { Reveal } from './Motion';
import type { Figure as FigureData } from '@/lib/media';

/**
 * A photograph inside prose.
 *
 * Deliberately plain: a framed image, an optional caption, nothing that
 * competes with the text it sits in. The aspect ratio is fixed so the page
 * does not jump as pictures load, and the frame carries the same rule and
 * radius as every other card so imagery arriving later still looks native.
 */
export function Figure({
  figure,
  aspect = 'aspect-[16/10]',
  priority = false,
}: {
  figure: FigureData;
  aspect?: string;
  priority?: boolean;
}) {
  return (
    <Reveal from="up" as="figure" className="not-prose my-2">
      <div className={`relative overflow-hidden rounded-xl border border-rule bg-linen ${aspect}`}>
        <Media
          src={figure.src}
          alt={figure.alt}
          fill
          priority={priority}
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover"
        />
      </div>
      {figure.caption && (
        <figcaption className="mt-3 text-[length:var(--text-xs)] leading-relaxed text-slate">
          {figure.caption}
        </figcaption>
      )}
    </Reveal>
  );
}

/** A lead picture, set beside the opening of a page rather than within it. */
export function LeadFigure({ figure }: { figure: FigureData }) {
  return (
    <Reveal from="up" as="figure" className="mb-10">
      <div className="relative aspect-[21/9] overflow-hidden rounded-2xl border border-rule bg-linen">
        <Media
          src={figure.src}
          alt={figure.alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover"
        />
      </div>
      {figure.caption && (
        <figcaption className="mt-3 text-[length:var(--text-xs)] leading-relaxed text-slate">
          {figure.caption}
        </figcaption>
      )}
    </Reveal>
  );
}

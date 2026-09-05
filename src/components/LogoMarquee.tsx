'use client';

import { Media } from './Media';

export type Logo = { src: string; alt: string };

/**
 * Continuously scrolling recruiter strip. Each row renders its logos twice and
 * the CSS animation translates exactly -50%, so the loop has no visible seam.
 * The duplicated half is hidden from assistive tech, and hovering pauses it.
 */
function Row({
  logos,
  duration,
  reverse,
}: {
  logos: Logo[];
  duration: number;
  reverse?: boolean;
}) {
  return (
    <div className="mg-fade-x overflow-hidden">
      <div
        className="mg-marquee-x flex w-max gap-3"
        style={{
          ['--marquee-duration' as string]: `${duration}s`,
          animationDirection: reverse ? 'reverse' : 'normal',
        }}
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex gap-3" aria-hidden={copy === 1 ? true : undefined}>
            {logos.map((logo, i) => (
              <div
                key={`${copy}-${i}`}
                className="group flex h-24 w-32 shrink-0 items-center justify-center rounded-xl border border-rule bg-paper p-4 transition-colors duration-500 hover:bg-shell sm:h-28 sm:w-40"
              >
                <div className="relative h-full w-full">
                  <Media
                    src={logo.src}
                    alt={logo.alt}
                    fill
                    sizes="160px"
                    className="object-contain opacity-65 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function LogoMarquee({ logos, rows = 3 }: { logos: Logo[]; rows?: number }) {
  if (logos.length === 0) return null;

  /* Split into bands that drift at slightly different speeds and directions,
     which reads as depth rather than as one long conveyor. */
  const perRow = Math.ceil(logos.length / rows);
  const bands = Array.from({ length: rows }, (_, i) =>
    logos.slice(i * perRow, (i + 1) * perRow)
  ).filter((b) => b.length > 0);

  return (
    <div className="space-y-3">
      {bands.map((band, i) => (
        <Row key={i} logos={band} duration={54 + i * 9} reverse={i % 2 === 1} />
      ))}
    </div>
  );
}

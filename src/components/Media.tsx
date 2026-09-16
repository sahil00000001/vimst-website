import Image, { type ImageProps } from 'next/image';
import meta from '@content/image-meta.json';

type Meta = { width: number; height: number; blurDataURL?: string };
const IMAGE_META = meta as unknown as Record<string, Meta>;

export function imageMeta(src: string | null | undefined): Meta | null {
  if (!src) return null;
  return IMAGE_META[src] ?? null;
}

/**
 * Whether a picture is artwork rather than photography, and so must be shown
 * whole rather than cropped to fill its frame.
 *
 * `object-cover` is the right default for a photograph: a landscape shot
 * trimmed to a slightly different landscape frame loses only air at the edges.
 * It is wrong for anything whose edges carry the meaning -- a circular emblem,
 * a poster with a title across the top, a contact sheet -- where the crop eats
 * the wording off the top and the border off both sides. The institute's IKS
 * seal was arriving with its own name sliced away on three sides.
 *
 * Proportion is the tell, and it travels with the file rather than with
 * whatever frame a given layout puts it in: emblems, seals, posters and
 * collages are square or close to it, photographs almost never are.
 */
export function isPlate(src: string): boolean {
  const m = imageMeta(src);
  if (!m) return false;
  const ratio = m.width / m.height;
  return ratio >= 0.85 && ratio <= 1.25;
}

type MediaProps = Omit<ImageProps, 'src' | 'alt' | 'placeholder' | 'blurDataURL'> & {
  src: string;
  alt?: string;
};

/**
 * `next/image` with the build-time metadata already attached: real intrinsic
 * dimensions and a 16px inline blur placeholder, so images fade up from a
 * colour impression instead of snapping in or shifting layout.
 *
 * `alt` defaults to empty because most imagery here is decorative; pass a real
 * description whenever the picture carries meaning.
 */
export function Media({ src, alt = '', fill, sizes, ...rest }: MediaProps) {
  const m = imageMeta(src);

  const shared = {
    src,
    alt,
    sizes,
    /* Transparent artwork carries no `blurDataURL`: a JPEG placeholder cannot
       hold an alpha channel, so one would paint a solid slab of the mark's own
       colour behind it until the real file lands. */
    ...(m?.blurDataURL
      ? { placeholder: 'blur' as const, blurDataURL: m.blurDataURL }
      : {}),
    ...rest,
  };

  if (fill) return <Image {...shared} fill />;

  return <Image {...shared} width={m?.width ?? 1200} height={m?.height ?? 800} />;
}

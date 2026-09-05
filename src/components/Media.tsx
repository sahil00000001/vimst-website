import Image, { type ImageProps } from 'next/image';
import meta from '@content/image-meta.json';

type Meta = { width: number; height: number; blurDataURL: string };
const IMAGE_META = meta as unknown as Record<string, Meta>;

export function imageMeta(src: string | null | undefined): Meta | null {
  if (!src) return null;
  return IMAGE_META[src] ?? null;
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
    ...(m ? { placeholder: 'blur' as const, blurDataURL: m.blurDataURL } : {}),
    ...rest,
  };

  if (fill) return <Image {...shared} fill />;

  return <Image {...shared} width={m?.width ?? 1200} height={m?.height ?? 800} />;
}

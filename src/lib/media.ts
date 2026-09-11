/**
 * Optional imagery and video.
 *
 * One file to edit when new photography or footage arrives. Every slot is
 * optional: when it is `null` or empty, the component renders nothing at all
 * rather than a broken frame or a grey placeholder, so the site is never worse
 * for a missing file. Drop the asset into `public/media/...`, add the entry
 * here, and it appears.
 *
 * Sizes for each slot are in MEDIA.md.
 */

export type Figure = {
  src: string;
  /** Describes the picture for someone who cannot see it. Never decorative filler. */
  alt: string;
  /** Optional line printed under the image. */
  caption?: string;
};

export type VideoSlot = {
  /** H.264 MP4. Add a WebM too if you have one — smaller, and Chrome prefers it. */
  src: string;
  webm?: string;
  /** Shown before playback and while the video loads. Required. */
  poster: string;
  /** Short label for the play button, e.g. "Campus tour · 1:40". */
  label: string;
  /** A silent ambient loop rather than something with sound to listen to. */
  ambient?: boolean;
};

/* ------------------------------------------------------------------
   Home page
   ------------------------------------------------------------------ */

/** Sits beside the hero copy, in place of the image carousel, when present. */
export const HERO_VIDEO: VideoSlot | null = null;

/** A full-width feature band between sections on the home page. */
export const CAMPUS_VIDEO: VideoSlot | null = null;

/* ------------------------------------------------------------------
   Editorial pages
   ------------------------------------------------------------------ */

/**
 * Pictures shown inside the prose of each page, keyed by the content key the
 * route passes to `EditorialPage`. Two or three per page is plenty; more turns
 * a page into a gallery.
 */
export const PAGE_FIGURES: Record<string, Figure[]> = {
  about: [],
  vision: [],
  mission: [],
  career: [],
  directorMessage: [],
  qualityPolicy: [],
};

/** A picture beside the opening paragraph, before the prose proper. */
export const PAGE_LEAD_IMAGE: Record<string, Figure | null> = {
  about: null,
  vision: null,
  mission: null,
  career: null,
  directorMessage: null,
  qualityPolicy: null,
};

export const figuresFor = (key: string): Figure[] => PAGE_FIGURES[key] ?? [];
export const leadImageFor = (key: string): Figure | null => PAGE_LEAD_IMAGE[key] ?? null;

/**
 * Accent colour system.
 *
 * The site is a white / off-white field, so colour has to earn its place. Each
 * academic family gets one muted accent, used only at small scale — a column
 * heading in the mega menu, a hairline rule, a level badge, a hover tint. The
 * palette is deliberately desaturated and dark (every value clears 4.5:1 on
 * white and on the off-whites), so a menu of eleven columns reads as one
 * considered system rather than as eleven competing labels.
 *
 * Crimson stays reserved for the institute itself: brand marks, the About and
 * Admission menus, primary actions. It is never used for a subject family, so
 * "this is MGIMST" and "this is Mechanical Engineering" never look alike.
 */

export type AccentName =
  | 'crimson'
  | 'indigo'
  | 'teal'
  | 'plum'
  | 'forest'
  | 'ochre'
  | 'ocean'
  | 'emerald'
  | 'bronze'
  | 'rose';

/** Tailwind classes per accent. Written out so the JIT compiler can see them. */
export const ACCENT_CLASS: Record<
  AccentName,
  { text: string; bg: string; border: string; dot: string; hoverText: string }
> = {
  crimson: {
    text: 'text-[#b01029]',
    bg: 'bg-[#f7e8ea]',
    border: 'border-[#b01029]',
    dot: 'bg-[#b01029]',
    hoverText: 'hover:text-[#b01029]',
  },
  indigo: {
    text: 'text-[#40428f]',
    bg: 'bg-[#ececf6]',
    border: 'border-[#40428f]',
    dot: 'bg-[#40428f]',
    hoverText: 'hover:text-[#40428f]',
  },
  teal: {
    text: 'text-[#14615f]',
    bg: 'bg-[#e6f0ef]',
    border: 'border-[#14615f]',
    dot: 'bg-[#14615f]',
    hoverText: 'hover:text-[#14615f]',
  },
  plum: {
    text: 'text-[#6b2d6b]',
    bg: 'bg-[#f2e9f2]',
    border: 'border-[#6b2d6b]',
    dot: 'bg-[#6b2d6b]',
    hoverText: 'hover:text-[#6b2d6b]',
  },
  forest: {
    text: 'text-[#2c5f3a]',
    bg: 'bg-[#e8f1ea]',
    border: 'border-[#2c5f3a]',
    dot: 'bg-[#2c5f3a]',
    hoverText: 'hover:text-[#2c5f3a]',
  },
  ochre: {
    text: 'text-[#8a5a12]',
    bg: 'bg-[#f6eee0]',
    border: 'border-[#8a5a12]',
    dot: 'bg-[#8a5a12]',
    hoverText: 'hover:text-[#8a5a12]',
  },
  ocean: {
    text: 'text-[#1f5a8a]',
    bg: 'bg-[#e7eff6]',
    border: 'border-[#1f5a8a]',
    dot: 'bg-[#1f5a8a]',
    hoverText: 'hover:text-[#1f5a8a]',
  },
  emerald: {
    text: 'text-[#1d6b45]',
    bg: 'bg-[#e6f2eb]',
    border: 'border-[#1d6b45]',
    dot: 'bg-[#1d6b45]',
    hoverText: 'hover:text-[#1d6b45]',
  },
  bronze: {
    text: 'text-[#7a4a22]',
    bg: 'bg-[#f4ece4]',
    border: 'border-[#7a4a22]',
    dot: 'bg-[#7a4a22]',
    hoverText: 'hover:text-[#7a4a22]',
  },
  rose: {
    text: 'text-[#94304f]',
    bg: 'bg-[#f8e9ee]',
    border: 'border-[#94304f]',
    dot: 'bg-[#94304f]',
    hoverText: 'hover:text-[#94304f]',
  },
};

/** Raw hex, for inline styles and SVG fills. */
export const ACCENT_HEX: Record<AccentName, string> = {
  crimson: '#b01029',
  indigo: '#40428f',
  teal: '#14615f',
  plum: '#6b2d6b',
  forest: '#2c5f3a',
  ochre: '#8a5a12',
  ocean: '#1f5a8a',
  emerald: '#1d6b45',
  bronze: '#7a4a22',
  rose: '#94304f',
};

/** Stream-level accents. Six streams, six hues. */
export const STREAM_ACCENT: Record<string, AccentName> = {
  Engineering: 'indigo',
  Management: 'ochre',
  'Computer Applications': 'ocean',
  Science: 'emerald',
  Commerce: 'bronze',
  Arts: 'rose',
};

/**
 * Within engineering the columns are split by level rather than by stream, so
 * level carries the colour there — a reader scanning the Programmes menu is
 * choosing a level first, and the four hues make those four blocks separable
 * at a glance.
 */
export const LEVEL_ACCENT: Record<string, AccentName> = {
  Diploma: 'teal',
  Bachelor: 'indigo',
  'PG Diploma': 'plum',
  Master: 'forest',
};

export const accentForStream = (stream: string): AccentName =>
  STREAM_ACCENT[stream] ?? 'indigo';

export const accentForLevel = (level: string): AccentName => LEVEL_ACCENT[level] ?? 'indigo';

/**
 * A course's accent: engineering reads by level, everything else by stream.
 * That keeps "Diploma in Civil" and "Diploma in Mechanical" visually related
 * while a BBA and an MBA stay in the management family.
 */
export function accentForCourse(course: { stream: string; level: string }): AccentName {
  return course.stream === 'Engineering'
    ? accentForLevel(course.level)
    : accentForStream(course.stream);
}

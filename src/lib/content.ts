import site from '@content/site.json';

export type Cell = { text: string; span: number; header: boolean };

export type Block =
  | { type: 'section'; heading: string | null; lines: string[] }
  | { type: 'table'; caption: string | null; rows: Cell[][] };

export type Level = 'Diploma' | 'Bachelor' | 'PG Diploma' | 'Master';

export type Course = {
  slug: string;
  title: string;
  short: string;
  stream: string;
  level: Level;
  department: string;
  banner: string | null;
  blocks: Block[];
  summary: string;
  duration: string | null;
  eligibility: string | null;
  authored: boolean;
};

export type EditorialPage = {
  title: string;
  intro: string | null;
  banner: string | null;
  blocks: Block[];
  images: { src: string; alt: string }[];
};

export type HomeContent = {
  carousel: string[];
  news: string[];
  about: { heading: string; body: string; image: string | null };
  director: { heading: string; body: string; image: string | null };
  discover: { title: string; body: string; image: string | null }[];
  campusLife: { title: string; image: string; href: string }[];
};

/** A quality, professional or accreditation framework the institute names. */
export type Accreditation = { abbr: string; name: string };

const data = site as unknown as {
  courses: Course[];
  pages: Record<string, EditorialPage> & { home: HomeContent };
  accreditations: Accreditation[];
  logo: string | null;
};

export const courses: Course[] = data.courses;
export const logo = data.logo;
export const home = data.pages.home;
export const accreditations: Accreditation[] = data.accreditations;

export const page = (key: string): EditorialPage => {
  const p = data.pages[key];
  if (!p) throw new Error(`Unknown content page: ${key}`);
  return p as EditorialPage;
};

export const courseBySlug = (slug: string): Course | undefined =>
  courses.find((c) => c.slug === slug);

export const STREAM_ORDER = [
  'Engineering',
  'Management',
  'Computer Applications',
  'Science',
  'Commerce',
  'Arts',
] as const;

export const LEVEL_ORDER: Level[] = ['Diploma', 'Bachelor', 'PG Diploma', 'Master'];

/** Courses grouped by stream, each stream's courses ordered by level. */
export function coursesByStream() {
  return STREAM_ORDER.map((stream) => ({
    stream,
    courses: courses
      .filter((c) => c.stream === stream)
      .sort(
        (a, b) =>
          LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level) ||
          a.title.localeCompare(b.title)
      ),
  })).filter((g) => g.courses.length > 0);
}

/** Engineering courses grouped by level, for the Programme menu. */
export function engineeringByLevel() {
  return LEVEL_ORDER.map((level) => ({
    level,
    courses: courses
      .filter((c) => c.stream === 'Engineering' && c.level === level)
      .sort((a, b) => a.department.localeCompare(b.department)),
  })).filter((g) => g.courses.length > 0);
}

/** Every engineering department with the levels it is offered at. */
export function departments() {
  const map = new Map<string, Course[]>();
  for (const c of courses) {
    if (c.stream !== 'Engineering') continue;
    map.set(c.department, [...(map.get(c.department) ?? []), c]);
  }
  return [...map.entries()]
    .map(([department, list]) => ({
      department,
      courses: list.sort(
        (a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level)
      ),
    }))
    .sort((a, b) => a.department.localeCompare(b.department));
}

/** Courses in the same department, excluding the given one. */
export function relatedCourses(course: Course, limit = 3): Course[] {
  const sameDept = courses.filter(
    (c) => c.slug !== course.slug && c.department === course.department
  );
  const sameStream = courses.filter(
    (c) =>
      c.slug !== course.slug &&
      c.department !== course.department &&
      c.stream === course.stream
  );
  return [...sameDept, ...sameStream].slice(0, limit);
}

/** First N words of a block of prose, for card blurbs. */
export function excerpt(text: string, words = 26): string {
  const parts = text.split(/\s+/);
  if (parts.length <= words) return text;
  return parts.slice(0, words).join(' ').replace(/[,.;:]$/, '') + '…';
}

/**
 * Blocks with the lead section dropped when its heading only repeats the page
 * title and it carries no prose. `ContentBlocks` applies the same rule, so
 * sharing it here keeps a page's contents list numbered like its body.
 */
export function visibleBlocks(blocks: Block[], title: string): Block[] {
  const lead = blocks[0];
  if (
    lead?.type === 'section' &&
    lead.heading &&
    lead.heading.trim().toLowerCase() === title.trim().toLowerCase() &&
    lead.lines.length === 0
  ) {
    return blocks.slice(1);
  }
  return blocks;
}

/** Section headings of a page, for an in-page contents list. */
export function sectionHeadings(blocks: Block[], title: string): string[] {
  return visibleBlocks(blocks, title)
    .filter((b): b is Extract<Block, { type: 'section' }> => b.type === 'section')
    .map((b) => b.heading)
    .filter((h): h is string => Boolean(h))
    .map((h) => h.replace(/:$/, ''));
}

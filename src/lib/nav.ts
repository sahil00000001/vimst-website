import { accentForLevel, accentForStream, type AccentName } from './accents';
import { coursesByStream, departments, engineeringByLevel } from './content';

export type NavLink = { label: string; href: string };

export type NavColumn = {
  heading: string;
  links: NavLink[];
  /** Drives the column's heading colour and hover tint in the mega menu. */
  accent: AccentName;
  /** Secondary line under the heading, e.g. "4 levels". */
  note?: string;
};

export type NavItem = {
  label: string;
  href: string;
  /** Columns rendered inside the mega menu; omitted for plain links. */
  columns?: NavColumn[];
  /** Rendered as a wide multi-column panel rather than a narrow dropdown. */
  wide?: boolean;
};

/**
 * Department menu: one column per engineering department, each listing the
 * levels it is offered at. The level links carry the level's own accent.
 */
function departmentColumns(): NavColumn[] {
  return departments().map(({ department, courses }) => ({
    heading: department,
    accent: accentForLevel(courses[0]?.level ?? 'Bachelor'),
    note: `${courses.length} level${courses.length === 1 ? '' : 's'}`,
    links: courses.map((c) => ({ label: c.level, href: `/courses/${c.slug}` })),
  }));
}

/** Programme menu: engineering by level, then the non-engineering streams. */
function programmeColumns(): NavColumn[] {
  const engineering = engineeringByLevel().map(({ level, courses }) => ({
    heading: `Engineering — ${level}`,
    accent: accentForLevel(level),
    note: `${courses.length} departments`,
    links: courses.map((c) => ({ label: c.department, href: `/courses/${c.slug}` })),
  }));

  const others = coursesByStream()
    .filter((g) => g.stream !== 'Engineering')
    .map(({ stream, courses }) => ({
      heading: stream,
      accent: accentForStream(stream),
      note: `${courses.length} programme${courses.length === 1 ? '' : 's'}`,
      links: courses.map((c) => ({
        label: `${c.short} — ${c.level}`,
        href: `/courses/${c.slug}`,
      })),
    }));

  return [...engineering, ...others];
}

export function buildNav(): NavItem[] {
  return [
    { label: 'Home', href: '/' },
    {
      label: 'About Us',
      href: '/about',
      columns: [
        {
          heading: 'The Institute',
          accent: 'crimson',
          links: [
            { label: 'About Us', href: '/about' },
            { label: 'Vision', href: '/vision' },
            { label: 'Mission', href: '/mission' },
            { label: 'Career', href: '/career' },
            { label: "Director's Message", href: '/director-message' },
            { label: 'Quality Policy', href: '/quality-policy' },
          ],
        },
      ],
    },
    {
      label: 'Departments',
      href: '/courses',
      wide: true,
      columns: [
        ...departmentColumns(),
        {
          heading: 'More',
          accent: 'crimson',
          links: [
            { label: 'Specializations', href: '/specializations' },
            { label: 'All Courses', href: '/courses' },
          ],
        },
      ],
    },
    {
      label: 'Programmes',
      href: '/courses',
      wide: true,
      columns: programmeColumns(),
    },
    {
      label: 'Admission',
      href: '/fee-structure',
      columns: [
        {
          heading: 'Admission',
          accent: 'crimson',
          links: [
            { label: 'Fee Structure', href: '/fee-structure' },
            { label: 'Payment Modes', href: '/payment-modes' },
            { label: 'Enrollment Verification', href: '/enrollment-verification' },
          ],
        },
      ],
    },
    { label: 'Placements', href: '/placement' },
    { label: 'Gallery', href: '/photo-gallery' },
    { label: 'Contact', href: '/contact' },
  ];
}

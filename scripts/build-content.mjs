import fs from 'node:fs';
import path from 'node:path';
import { COURSES, BANNER_BY_DEPARTMENT } from './catalog.mjs';
import { AUTHORED } from './authored.mjs';
import { HOME_COPY, PAGE_COPY, SECTION_REWRITES, tidy, tidyHeading } from './copy.mjs';

const raw = JSON.parse(fs.readFileSync('content/raw-pages.json', 'utf8'));
const assets = JSON.parse(fs.readFileSync('content/asset-map.json', 'utf8'));

/**
 * The institute was renamed from Mahatma Gandhi Institute of Management
 * Science & Technology to Vivekananda Institute of Management Science and
 * Technology. The source HTML still carries the old name throughout, so the
 * rename is applied here — at the point where source becomes site content —
 * rather than by editing the generated JSON. Otherwise re-running
 * `npm run content` would quietly reinstate the old name.
 *
 * Longest first, so a general rule never eats a specific one.
 */
const RENAMES = [
  [/MAHATMA GANDHI INSTITUTE OF MANAGEMENT SCIENCE (?:&|AND) TECHNOLOGY/g,
   'VIVEKANANDA INSTITUTE OF MANAGEMENT SCIENCE AND TECHNOLOGY'],
  [/Mahatma Gandhi Institute of Management Science (?:&|and) Technology/g,
   'Vivekananda Institute of Management Science and Technology'],
  [/Mahatma Gandhi Institute of Technology/g, 'Vivekananda Institute of Technology'],
  [/Mahatma Gandhi Institute/g, 'Vivekananda Institute'],
  [/MAHATMA GANDHI/g, 'VIVEKANANDA'],
  [/Mahatma Gandhi/g, 'Vivekananda'],
  [/MGIMST/g, 'VIMST'],
  [/mgimst/g, 'vimst'],
];

const rename = (value) =>
  typeof value === 'string'
    ? RENAMES.reduce((acc, [pattern, to]) => acc.replace(pattern, to), value)
    : value;

/** Applies the rename to every string in a nested structure. */
function renameDeep(node) {
  if (typeof node === 'string') return rename(node);
  if (Array.isArray(node)) return node.map(renameDeep);
  if (node && typeof node === 'object') {
    return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, renameDeep(v)]));
  }
  return node;
}

/* Source paths are relative and sometimes prefixed with `./`. */
const asset = (src) => {
  if (!src) return null;
  const key = decodeURIComponent(src).replace(/^\.\//, '');
  return assets[key] || assets[key.replace(/^\//, '')] || null;
};

const NOISE = [
  /^home$/i,
  /^about us$/i,
  /^read more/i,
  /^view all$/i,
  /^copyright/i,
  /^&times;$/,
  /^enter your/i,
  /^submit$/i,
  /^previous$/i,
  /^next$/i,
];

const isNoise = (line) => NOISE.some((r) => r.test(line.trim()));

function cleanBlocks(blocks) {
  return blocks
    .map((b) => {
      if (b.type !== 'section') return b;
      return { ...b, lines: b.lines.filter((l) => !isNoise(l)) };
    })
    .filter((b) => (b.type === 'section' ? b.heading || b.lines.length : true));
}

/* A handful of source headings are truncated because the real ending lived in
   a CSS `:after` pseudo-element (e.g. `Bachelor in` + content: " Civil Engineering"). */
function repairHeadings(blocks, title) {
  let repaired = false;
  return blocks.map((b) => {
    if (repaired || b.type !== 'section' || !b.heading) return b;
    const h = b.heading.trim();
    const truncated =
      /^(bachelor|master|diploma|post graduate( \w+)? diploma)( in| of)?$/i.test(h) ||
      /^(bachelor|master) of \)?$/i.test(h) ||
      h.length < 6;
    if (truncated) {
      repaired = true;
      return { ...b, heading: title };
    }
    if (h.toLowerCase() === title.toLowerCase()) repaired = true;
    return b;
  });
}

/* ------------------------------------------------------------------
   Rewritten copy
   ------------------------------------------------------------------ */

/**
 * The inherited text was lifted from elsewhere and written in heavy corporate
 * language. scripts/copy.mjs replaces it with plain English, keeping every
 * fact. Applied here so `npm run content` cannot undo it.
 */
function applyRewrites(line) {
  for (const [pattern, replacement] of SECTION_REWRITES) {
    if (pattern.test(line)) {
      return tidy(
        typeof replacement === 'function' ? line.replace(pattern, replacement) : replacement
      );
    }
  }
  return tidy(line);
}

/**
 * Subject names in the syllabus tables carry dashes from the source HTML
 * ("Business Finance – I", "Instrumentation –II"). A hyphen reads the same and
 * renders identically in every font, so the tables lose their long dashes
 * without losing a word.
 */
const tidyCell = (text) =>
  text
    .replace(/\s*[—–]\s*/g, '-')
    .replace(/\s{2,}/g, ' ')
    .trim();

/** Rewrites the prose in a block list, and the dashes inside tables. */
function rewriteBlocks(blocks) {
  return blocks
    .map((b) => {
      if (b.type === 'table') {
        return {
          ...b,
          caption: b.caption ? tidyCell(b.caption) : b.caption,
          rows: b.rows.map((row) => row.map((c) => ({ ...c, text: tidyCell(c.text) }))),
        };
      }
      if (b.type !== 'section') return b;
      return {
        ...b,
        heading: b.heading ? tidyHeading(b.heading) : b.heading,
        lines: b.lines.map(applyRewrites).filter(Boolean),
      };
    })
    .filter((b) => (b.type === 'section' ? b.heading || b.lines.length : true));
}

/** Turns an entry from PAGE_COPY into the block shape the site renders. */
const blocksFromCopy = (sections) =>
  sections.map((x) => ({ type: 'section', heading: x.heading, lines: x.lines }));

/* ------------------------------------------------------------------
   Banner artwork
   ------------------------------------------------------------------ */

/**
 * Page banners use the drawn artwork from `npm run artwork` rather than the
 * photographs inherited from the old site.
 *
 * Not an aesthetic preference: every inherited banner is 722x247 and the
 * layout displays it up to 1400x340, so it arrives on screen at roughly twice
 * its real size and looks it. The artwork is rendered from SVG at 2400px and
 * is sharp at any size. Swap an entry back to a photograph the moment there is
 * one shot at a usable resolution — a real picture of the place beats a
 * drawing every time, but not a blurred one.
 */
const ART = (name) => `/media/art/${name}.jpg`;

const ART_BY_DEPARTMENT = {
  'Automobile Engineering': 'automobile-engineering',
  'Chemical Engineering': 'chemical-engineering',
  'Civil Engineering': 'civil-engineering',
  'Computer Engineering': 'computer-engineering',
  'Electrical Engineering': 'electrical-engineering',
  'Electronics Engineering': 'electronics-engineering',
  'Electronics & Communication': 'electronics-communication',
  'Electrical & Electronics Engineering': 'electrical-electronics-engineering',
  'Mechanical Engineering': 'mechanical-engineering',
  'Instrumentation Engineering': 'instrumentation-engineering',
  'Metallurgical Engineering': 'metallurgical-engineering',
  'Mining Engineering': 'mining-engineering',
  'Information Technology': 'information-technology',
  Management: 'management',
  'Hotel Management': 'hotel-management',
  'Computer Applications': 'computer-applications',
  Science: 'science',
  Commerce: 'commerce',
  Arts: 'arts',
};


/* ---------------- courses ---------------- */

const courses = COURSES.map((c) => {
  const page = c.source ? raw[c.source] : null;
  const authored = AUTHORED[c.slug];

  let blocks;
  let bannerSrc;

  if (page && page.blocks.length) {
    blocks = rewriteBlocks(repairHeadings(cleanBlocks(page.blocks), c.title));
    bannerSrc = page.banner;
  } else if (authored) {
    blocks = rewriteBlocks(authored.blocks);
    bannerSrc = authored.banner;
  } else {
    blocks = [];
    bannerSrc = null;
  }

  // Drawn artwork first; the inherited photographs are all too small for a
  // full-bleed banner. `bannerSrc` is kept as the fallback for any department
  // the artwork does not cover.
  const banner =
    (ART_BY_DEPARTMENT[c.department] && ART(ART_BY_DEPARTMENT[c.department])) ||
    asset(bannerSrc) ||
    asset(BANNER_BY_DEPARTMENT[c.department]) ||
    null;

  // The lead paragraph doubles as the card blurb and the meta description.
  const firstProse = blocks.find(
    (b) => b.type === 'section' && b.lines.length && b.lines[0].length > 60
  );
  const summary = firstProse ? firstProse.lines[0] : `${c.title} at VIMST.`;

  const findSection = (re) =>
    blocks.find((b) => b.type === 'section' && b.heading && re.test(b.heading));
  const duration = findSection(/duration/i)?.lines.join(' ') || null;
  const eligibility =
    findSection(/eligibilit|admission qualification/i)?.lines.join(' ') || null;

  return {
    ...c,
    banner,
    blocks,
    summary,
    duration,
    eligibility,
    authored: Boolean(!page?.blocks.length && authored),
  };
});

/* ---------------- editorial pages ---------------- */

function simplePage(file, { title, intro, art, copy }) {
  const page = raw[file];
  if (!page) throw new Error(`missing source page: ${file}`);
  // A rewritten page replaces the extracted text outright; anything without
  // one still gets the dashes removed and the spacing fixed.
  const blocks = copy ? blocksFromCopy(copy) : rewriteBlocks(cleanBlocks(page.blocks));
  return {
    title,
    intro: intro || null,
    banner: (art && ART(art)) || asset(page.banner),
    blocks,
    images: page.images.map((i) => ({ ...i, src: asset(i.src) })).filter((i) => i.src),
  };
}

const pages = {
  about: simplePage('AboutUs.HTML', { title: 'About Us', art: 'about', copy: PAGE_COPY.about }),
  vision: simplePage('vision.html', { title: 'Our Vision', art: 'vision', copy: PAGE_COPY.vision }),
  mission: simplePage('mission.html', { title: 'Our Mission', art: 'mission', copy: PAGE_COPY.mission }),
  career: simplePage('career.html', { title: 'Career', art: 'career', copy: PAGE_COPY.career }),
  directorMessage: simplePage('director-message.html', { title: "Director's Message", art: 'director-message', copy: PAGE_COPY.directorMessage }),
  qualityPolicy: simplePage('quality-policy.html', { title: 'Quality Policy', art: 'quality-policy', copy: PAGE_COPY.qualityPolicy }),
  placement: simplePage('our-placement.html', { title: 'Our Placements', art: 'placement' }),
  photoGallery: simplePage('photogallery.html', { title: 'Photo Gallery', art: 'gallery' }),
  specializations: simplePage('specializations.html', { title: 'Specializations', art: 'specializations' }),
  contact: simplePage('contact-us.html', { title: 'Contact Us', art: 'contact' }),
};

/* ---------------- home ---------------- */

const home = raw['index.html'];
const homeSection = (re) =>
  home.blocks.find((b) => b.type === 'section' && b.heading && re.test(b.heading));

/**
 * Hero image.
 *
 * One photograph, the institute's own picture of the entrance. It is the only
 * image here that is both sharp and unmistakably this place; the five that used
 * to rotate behind it came from the old site at 722px and were noticeably soft
 * blown up to hero size.
 *
 * Add more entries and the hero becomes a carousel again, with its dots and
 * arrows back — but only put a photograph here that is at least 1600px wide.
 */
const carousel = [
  // Supplied photograph, 1536x1024, lives in public/media so it needs no
  // lookup through the asset map.
  '/media/hero/campus-gate.jpg',
];

const discoverKeys = [
  'Indian Knowledge System',
  'Viksit Bharat @2047',
  'Placement',
  'Library',
];
const discoverImages = [
  'images/WhatsApp Image 2024-06-19 at 14.02.42_5f655d27.jpg',
  'images/WhatsApp Image 2024-06-19 at 14.02.42_069fa202.png',
  'images/WhatsApp Image 2024-06-19 at 14.02.42_0db2cbcc.jpg',
  'images/WhatsApp Image 2024-06-19 at 14.02.43_edb42c01.jpg',
];

const discover = discoverKeys.map((k, i) => {
  const s = homeSection(new RegExp(`^${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'));
  return {
    title: k,
    body: HOME_COPY.discover[k] ?? (s ? s.lines.join(' ') : ''),
    image: asset(discoverImages[i]),
  };
});

const news = homeSection(/news/i);

const siteHome = {
  carousel,
  // The source markup puts the page's welcome heading inside the news column,
  // so short lines are dropped -- a real notice is always a full sentence.
  news: HOME_COPY.news,
  about: {
    heading: 'About the College',
    body: HOME_COPY.about,
    image: asset('2.jpg'),
  },
  director: {
    heading: "Director's Message",
    body: HOME_COPY.director,
    image: asset('director-img.jpg'),
  },
  discover,
  campusLife: [
    { title: 'Placement at VIMST', image: asset('images/placement.jpg'), href: '/placement' },
    { title: 'Photo Gallery', image: asset('download (2).jpg'), href: '/photo-gallery' },
    { title: 'Recognition & Awards', image: asset('images/AWARDS.jpg'), href: '/about' },
  ].filter((c) => c.image),
};

/* ---------------- write ---------------- */

const out = {
  courses,
  pages: { ...pages, home: siteHome },
  logo: asset('croped.svg'),
};

fs.mkdirSync('content', { recursive: true });
// Applied once, over the whole tree, so no extracted string can slip through
// still carrying the former name.
fs.writeFileSync('content/site.json', JSON.stringify(renameDeep(out), null, 2));

const emptyCourses = courses.filter((c) => c.blocks.length === 0);
console.log(`built ${courses.length} courses, ${Object.keys(pages).length} pages`);
console.log(`authored fallbacks: ${courses.filter((c) => c.authored).length}`);
if (emptyCourses.length) console.log('EMPTY:', emptyCourses.map((c) => c.slug).join(', '));
const missingBanner = courses.filter((c) => !c.banner);
if (missingBanner.length) console.log('NO BANNER:', missingBanner.map((c) => c.slug).join(', '));

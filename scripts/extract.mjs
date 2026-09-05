import { parse } from 'node-html-parser';
import fs from 'node:fs';
import path from 'node:path';

const SRC = path.resolve('../source');
const OUT = path.resolve('content');

/* ---------------- helpers ---------------- */

const clean = (s) =>
  (s || '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&ndash;/g, '-')
    .replace(/&mdash;/g, '—')
    .replace(/\s+/g, ' ')
    .trim();

// Turn a <p> into an array of lines.
//
// Only <br> and block ends are real breaks. These source files also wrap their
// prose with literal newlines, which HTML collapses to spaces -- splitting on
// those shreds sentences mid-clause -- so real breaks are marked with a
// sentinel before the markup is flattened to text.
const BREAK = '\u0000';

function toLines(el) {
  const html = el.innerHTML
    .replace(/<br\s*\/?>/gi, BREAK)
    .replace(/<\/(p|div|li|h\d)>/gi, BREAK);
  const text = parse(html).textContent;
  const pieces = text
    .split(BREAK)
    .map(clean)
    .filter((l) => l.length > 1);
  return reflow(pieces);
}

// A <br> is sometimes a soft wrap rather than a new point. A piece that does
// not close on sentence-ending punctuation is read as continuing into the next.
function reflow(pieces) {
  const out = [];
  for (const piece of pieces) {
    const prev = out[out.length - 1];
    const openEnded = prev && !/[.!?:;…]["')\]]?$/.test(prev);
    const startsNewPoint = /^[-•*]|^\d+[.)]/.test(piece);
    if (openEnded && !startsNewPoint) {
      out[out.length - 1] = `${prev} ${piece}`;
    } else {
      out.push(piece);
    }
  }
  return out;
}

function bgImage(el) {
  const style = el.getAttribute('style') || '';
  const m = style.match(/background-image:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
  return m ? m[1] : null;
}

/* ---------------- content region ---------------- */

// These documents are hand-written and frequently unbalanced, so rather than
// slicing the raw source we let the parser normalise the tree and then drop
// every chrome element (both nav variants, the sidenav, the footer).
const CHROME = [
  'script',
  'style',
  'noscript',
  'nav.new-navbar',
  '#mySidenav',
  '.sidenav',
  '.nave-bg',
  '.navigation',
  '.hamburger',
  'footer',
];

function contentRoot(raw) {
  const root = parse(raw, { comment: false });
  for (const sel of CHROME) for (const el of root.querySelectorAll(sel)) el.remove();
  return root.querySelector('body') || root;
}

/* ---------------- table extraction ---------------- */

function extractTable(tableEl) {
  const rows = [];
  for (const tr of tableEl.querySelectorAll('tr')) {
    const cells = tr.querySelectorAll('td, th').map((td) => ({
      text: clean(td.textContent),
      span: parseInt(td.getAttribute('colspan') || '1', 10) || 1,
      header: td.tagName === 'TH',
    }));
    if (cells.length === 0) continue;
    if (cells.every((c) => !c.text)) continue;
    rows.push(cells);
  }
  if (rows.length === 0) return null;

  // First single-cell full-width row reads as the table's caption.
  let caption = null;
  if (rows[0].length === 1 && rows[0][0].span > 1) {
    caption = rows[0][0].text;
    rows.shift();
  }
  if (rows.length === 0) return null;
  return { type: 'table', caption, rows };
}

/* ---------------- block extraction ---------------- */

function extractBlocks(root) {
  const blocks = [];
  const seenTables = new Set();

  const pushSection = (heading, lines) => {
    if (!lines.length && !heading) return;
    blocks.push({ type: 'section', heading: heading || null, lines });
  };

  // .card-body groups: heading(s) + paragraph(s)
  for (const body of root.querySelectorAll('.card-body')) {
    if (body.closest('table')) continue;
    const headings = body
      .querySelectorAll('h1, h2, h3, h4, h5, h6')
      .map((h) => clean(h.textContent))
      .filter(Boolean);
    const paras = body.querySelectorAll('p');
    let lines = [];
    for (const p of paras) lines.push(...toLines(p));
    if (!paras.length) {
      const li = body.querySelectorAll('li').map((l) => clean(l.textContent));
      lines.push(...li.filter(Boolean));
    }
    // a heading that is only a decorative title (banner) is skipped upstream
    const heading = headings.length ? headings[headings.length - 1] : null;
    const extraHeadings = headings.slice(0, -1).filter((h) => h !== heading);
    for (const h of extraHeadings) pushSection(h, []);
    pushSection(heading, lines);
    body.remove();
  }

  // remaining tables
  for (const t of root.querySelectorAll('table')) {
    if (seenTables.has(t)) continue;
    seenTables.add(t);
    const tbl = extractTable(t);
    if (tbl) blocks.push(tbl);
    t.remove();
  }

  // leftover free-standing headings + paragraphs
  const leftovers = root.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li');
  let current = null;
  let lines = [];
  for (const el of leftovers) {
    if (el.closest('table')) continue;
    const tag = el.tagName.toLowerCase();
    if (/^h\d$/.test(tag)) {
      if (current || lines.length) pushSection(current, lines);
      current = clean(el.textContent);
      lines = [];
    } else {
      lines.push(...toLines(el));
    }
  }
  if (current || lines.length) pushSection(current, lines);

  // de-dupe consecutive identical sections and drop empties
  return blocks.filter((b, i, arr) => {
    if (b.type === 'section' && !b.heading && b.lines.length === 0) return false;
    if (i > 0 && JSON.stringify(b) === JSON.stringify(arr[i - 1])) return false;
    return true;
  });
}

/* ---------------- images ---------------- */

function extractImages(root) {
  return root
    .querySelectorAll('img')
    .map((img) => ({
      src: img.getAttribute('src'),
      alt: clean(img.getAttribute('alt') || ''),
    }))
    .filter((i) => i.src && !i.src.startsWith('data:'));
}

/* ---------------- per-file ---------------- */

function extractPage(file) {
  const raw = fs.readFileSync(path.join(SRC, file), 'utf8');
  const root = contentRoot(raw);

  const docTitle = clean(parse(raw).querySelector('title')?.textContent || '');

  // banner: first element carrying a background-image, or a .card-img-overlay
  let banner = null;
  let bannerTitle = null;
  for (const el of root.querySelectorAll('[style]')) {
    const bg = bgImage(el);
    if (bg) {
      banner = bg;
      const overlay = el.querySelector('.card-img-overlay');
      if (overlay) bannerTitle = clean(overlay.textContent);
      el.remove();
      break;
    }
  }
  if (!bannerTitle) {
    const overlay = root.querySelector('.card-img-overlay');
    if (overlay) {
      bannerTitle = clean(overlay.textContent);
      overlay.remove();
    }
  }

  const images = extractImages(root);
  const blocks = extractBlocks(root);

  return {
    file,
    docTitle,
    banner,
    bannerTitle,
    images,
    blocks,
  };
}

/* ---------------- run ---------------- */

const files = fs
  .readdirSync(SRC)
  .filter((f) => /\.html?$/i.test(f))
  .sort();

fs.mkdirSync(OUT, { recursive: true });
const all = {};
for (const f of files) {
  try {
    all[f] = extractPage(f);
  } catch (e) {
    console.error('FAILED', f, e.message);
  }
}
fs.writeFileSync(path.join(OUT, 'raw-pages.json'), JSON.stringify(all, null, 2));
console.log('extracted', Object.keys(all).length, 'pages');

import puppeteer from 'puppeteer-core';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Generates the page banner artwork.
 *
 * Every banner inherited from the old site is 722px wide and gets displayed up
 * to 1400px, so it arrives on screen visibly soft. These are drawn instead of
 * photographed: rendered from SVG at 2400px, they are crisp at any size the
 * layout asks for, and they share one palette so twenty department pages read
 * as one institution.
 *
 * They are deliberately not pretend photographs. Each is a quiet technical
 * motif belonging to its discipline — a truss for civil, a molecular lattice
 * for chemical — on the same paper ground as the rest of the site. Real
 * photography of the campus should replace these wherever it exists; this is
 * what an institute can ship before the photographer arrives.
 *
 *   node scripts/artwork.mjs [motif]     # one motif, for iterating
 *   node scripts/artwork.mjs             # everything
 */

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = path.resolve('public/media/art');
const W = 1200;
const H = 515; // 21:9, rendered at 2x for a 2400px file
const SCALE = 2;

const INK = '#16151a';
/* The hairline along the bottom of every banner. Gold rather than navy:
   navy on these pale grounds reads as another drawn line, where the gold
   reads as the institute signing the picture. */
const GOLD = '#d09e31';

/* Each family gets its own hue so a department is recognisable at a glance,
   but all of them sit at the same low saturation as the rest of the site. */
const PALETTES = {
  navy: { line: '#26375c', wash: '#e9edf4', ground: '#f7f9fb' },
  slate: { line: '#3f4a5c', wash: '#eceff4', ground: '#f8f9fb' },
  moss: { line: '#3f5545', wash: '#eaf0eb', ground: '#f7faf8' },
  ochre: { line: '#7a5a24', wash: '#f5efe2', ground: '#fbf9f4' },
  indigo: { line: '#3a3f63', wash: '#ecedf4', ground: '#f8f8fb' },
  teal: { line: '#26565b', wash: '#e7f0f0', ground: '#f6fafa' },
  plum: { line: '#5a3050', wash: '#f2eaf0', ground: '#faf7f9' },
  clay: { line: '#6b3b2e', wash: '#f4ebe7', ground: '#fbf8f6' },
};

/* ------------------------------------------------------------------
   Motifs. Each returns SVG drawn inside a 1200x515 box.
   The left 45% stays quiet — the page prints a heading over it.
   ------------------------------------------------------------------ */

const motifs = {
  /** Concentric rings — wheels, rotation. Automobile, mechanical. */
  rings: (c) => {
    let s = '';
    const cx = 840;
    const cy = 258;
    for (let r = 46; r <= 520; r += 30) {
      s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c.line}" stroke-width="${r % 90 < 30 ? 2.6 : 1.1}" opacity="${(0.72 - r / 1100).toFixed(3)}"/>`;
    }
    for (let a = 0; a < 360; a += 10) {
      const rad = (a * Math.PI) / 180;
      s += `<line x1="${cx + Math.cos(rad) * 130}" y1="${cy + Math.sin(rad) * 130}" x2="${cx + Math.cos(rad) * 520}" y2="${cy + Math.sin(rad) * 520}" stroke="${c.line}" stroke-width="0.9" opacity="0.2"/>`;
    }
    s += `<circle cx="${cx}" cy="${cy}" r="34" fill="${c.wash}" stroke="${c.line}" stroke-width="2.6" opacity="0.9"/>`;
    return s;
  },

  /** Hexagonal lattice — molecular structure. Chemical, metallurgical. */
  lattice: (c) => {
    let s = '';
    const R = 52;
    const dx = R * 1.5;
    const dy = R * Math.sqrt(3);
    for (let col = 0; col < 20; col++) {
      for (let row = -1; row < 7; row++) {
        const cx = 90 + col * dx;
        const cy = row * dy + (col % 2 ? dy / 2 : 0);
        if (cx > 1290) continue;
        const pts = Array.from({ length: 6 }, (_, i) => {
          const a = (Math.PI / 3) * i;
          return `${(cx + R * Math.cos(a)).toFixed(1)},${(cy + R * Math.sin(a)).toFixed(1)}`;
        }).join(' ');
        // Density builds to the right, away from the heading.
        const fade = Math.min(0.62, Math.max(0.06, (cx - 60) / 1500));
        s += `<polygon points="${pts}" fill="none" stroke="${c.line}" stroke-width="1.5" opacity="${fade.toFixed(3)}"/>`;
        if ((col + row) % 3 === 0) {
          s += `<circle cx="${cx}" cy="${cy}" r="6" fill="${c.line}" opacity="${Math.min(0.85, fade * 1.7).toFixed(3)}"/>`;
        }
      }
    }
    return s;
  },

  /** Warren truss — load paths. Civil. */
  truss: (c) => {
    let s = '';
    const step = 86;
    for (const [y0, y1, w] of [[46, 196, 1], [186, 346, 1.25], [336, 486, 1]]) {
      s += `<line x1="0" y1="${y0}" x2="1200" y2="${y0}" stroke="${c.line}" stroke-width="${2.4 * w}" opacity="0.36"/>`;
      s += `<line x1="0" y1="${y1}" x2="1200" y2="${y1}" stroke="${c.line}" stroke-width="${2.4 * w}" opacity="0.36"/>`;
      for (let i = 0; i * step < 1200; i++) {
        const x = i * step;
        const op = Math.min(0.62, 0.1 + i * 0.042);
        s += `<line x1="${x}" y1="${y0}" x2="${x}" y2="${y1}" stroke="${c.line}" stroke-width="${1.2 * w}" opacity="${op.toFixed(3)}"/>`;
        s += `<line x1="${x}" y1="${i % 2 ? y0 : y1}" x2="${Math.min(x + step, 1200)}" y2="${i % 2 ? y1 : y0}" stroke="${c.line}" stroke-width="${1.6 * w}" opacity="${op.toFixed(3)}"/>`;
        s += `<circle cx="${x}" cy="${y0}" r="4.5" fill="${c.line}" opacity="${Math.min(0.8, op + 0.14).toFixed(3)}"/>`;
        s += `<circle cx="${x}" cy="${y1}" r="4.5" fill="${c.line}" opacity="${Math.min(0.8, op + 0.14).toFixed(3)}"/>`;
      }
    }
    return s;
  },

  /** Orthogonal traces and pads — a board. Computer, electronics, IT. */
  traces: (c) => {
    let s = '';
    let seed = 7;
    const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
    for (let i = 0; i < 54; i++) {
      let x = 30 + rnd() * 420;
      let y = 20 + rnd() * 480;
      const op = Math.min(0.6, 0.12 + (x / 1200) * 0.75).toFixed(3);
      let d = `M${x.toFixed(0)},${y.toFixed(0)}`;
      for (let seg = 0; seg < 4 + Math.floor(rnd() * 4); seg++) {
        const len = 50 + rnd() * 150;
        if (rnd() > 0.4) x += len;
        else y += rnd() > 0.5 ? len * 0.6 : -len * 0.6;
        x = Math.min(x, 1195);
        y = Math.max(14, Math.min(y, 500));
        d += ` L${x.toFixed(0)},${y.toFixed(0)}`;
      }
      s += `<path d="${d}" fill="none" stroke="${c.line}" stroke-width="1.8" opacity="${op}" stroke-linejoin="round"/>`;
      s += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="6" fill="none" stroke="${c.line}" stroke-width="2" opacity="${op}"/>`;
    }
    return s;
  },

  /** Radiating arcs — propagation. Electronics & communication. */
  signal: (c) => {
    let s = '';
    const cx = 1080;
    const cy = 258;
    for (let r = 60; r <= 1080; r += 42) {
      const op = Math.max(0.07, 0.68 - r / 1600);
      const bold = r % 126 < 42;
      s += `<path d="M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx} ${cy - r}" fill="none" stroke="${c.line}" stroke-width="${bold ? 2.8 : 1.2}" opacity="${op.toFixed(3)}"/>`;
      s += `<path d="M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${cx} ${cy + r}" fill="none" stroke="${c.line}" stroke-width="${bold ? 2.8 : 1.2}" opacity="${op.toFixed(3)}"/>`;
    }
    s += `<circle cx="${cx}" cy="${cy}" r="13" fill="${c.line}" opacity="0.85"/>`;
    return s;
  },

  /** Stacked sine waves — alternating current. Electrical, instrumentation. */
  waves: (c) => {
    let s = '';
    for (let k = 0; k < 9; k++) {
      const amp = 30 + k * 7;
      const yBase = 34 + k * 56;
      let d = `M0,${yBase}`;
      for (let x = 0; x <= 1200; x += 6) {
        d += ` L${x},${(yBase + Math.sin(x / (62 + k * 9) + k * 0.7) * amp).toFixed(1)}`;
      }
      s += `<path d="${d}" fill="none" stroke="${c.line}" stroke-width="${k % 3 === 1 ? 2.8 : 1.3}" opacity="${(0.22 + k * 0.042).toFixed(3)}"/>`;
    }
    return s;
  },

  /** Sedimentary strata — layers. Mining. */
  strata: (c) => {
    let s = '';
    for (let k = 0; k < 11; k++) {
      const y = 26 + k * 47;
      const op = (0.18 + k * 0.04).toFixed(3);
      let d = `M0,${y}`;
      for (let x = 0; x <= 1200; x += 14) {
        d += ` L${x},${(y + Math.sin(x / 150 + k) * 15 + Math.sin(x / 53 + k * 2) * 6).toFixed(1)}`;
      }
      s += `<path d="${d}" fill="none" stroke="${c.line}" stroke-width="${k % 3 === 0 ? 2.8 : 1.2}" opacity="${op}"/>`;
      if (k % 3 === 1) {
        for (let x = 40; x < 1190; x += 52) {
          s += `<line x1="${x}" y1="${y + 7}" x2="${x + 18}" y2="${y + 24}" stroke="${c.line}" stroke-width="1" opacity="${(Number(op) * 0.7).toFixed(3)}"/>`;
        }
      }
    }
    return s;
  },

  /** Ascending columns on a baseline — growth. Management, commerce. */
  columns: (c) => {
    let s = '';
    const base = 452;
    const heights = [56, 104, 82, 150, 124, 196, 168, 244, 214, 290, 262, 338, 308, 392];
    heights.forEach((h, i) => {
      const x = 44 + i * 84;
      const op = Math.min(0.55, 0.1 + i * 0.042).toFixed(3);
      s += `<rect x="${x}" y="${base - h}" width="50" height="${h}" fill="${c.wash}" stroke="${c.line}" stroke-width="1.7" opacity="${op}" rx="4"/>`;
      s += `<circle cx="${x + 25}" cy="${base - h}" r="5" fill="${c.line}" opacity="${Math.min(0.85, Number(op) * 1.7).toFixed(3)}"/>`;
    });
    s += `<line x1="0" y1="${base}" x2="1200" y2="${base}" stroke="${c.line}" stroke-width="2.6" opacity="0.45"/>`;
    let d = `M69,${base - heights[0]}`;
    heights.forEach((h, i) => {
      d += ` L${44 + i * 84 + 25},${base - h}`;
    });
    s += `<path d="${d}" fill="none" stroke="${c.line}" stroke-width="2.2" opacity="0.42" stroke-dasharray="7 6"/>`;
    return s;
  },

  /** Elliptical orbits — enquiry. Science, computer applications. */
  orbits: (c) => {
    let s = '';
    const cx = 860;
    const cy = 258;
    for (let k = 0; k < 7; k++) {
      const rot = k * 25.7;
      const op = (0.5 - k * 0.04).toFixed(3);
      s += `<ellipse cx="${cx}" cy="${cy}" rx="430" ry="150" fill="none" stroke="${c.line}" stroke-width="${k === 0 ? 2.8 : 1.3}" opacity="${op}" transform="rotate(${rot} ${cx} ${cy})"/>`;
      const a = (rot * Math.PI) / 180;
      s += `<circle cx="${(cx + Math.cos(a) * 430).toFixed(1)}" cy="${(cy + Math.sin(a) * 430 * 0.35).toFixed(1)}" r="7" fill="${c.line}" opacity="${Math.min(0.9, Number(op) * 1.8).toFixed(3)}"/>`;
    }
    s += `<circle cx="${cx}" cy="${cy}" r="28" fill="${c.wash}" stroke="${c.line}" stroke-width="2.8" opacity="0.9"/>`;
    return s;
  },

  /** Overlapping arcs — an open book, a gathering. Arts, editorial pages. */
  arcs: (c) => {
    let s = '';
    for (let k = 0; k < 14; k++) {
      const r = 110 + k * 52;
      const op = (0.52 - k * 0.032).toFixed(3);
      s += `<path d="M ${1120 - r} 530 A ${r} ${r} 0 0 1 ${1120 + r} 530" fill="none" stroke="${c.line}" stroke-width="${k % 3 === 0 ? 2.8 : 1.2}" opacity="${op}"/>`;
      s += `<path d="M ${330 - r * 0.55} -14 A ${r * 0.55} ${r * 0.55} 0 0 0 ${330 + r * 0.55} -14" fill="none" stroke="${c.line}" stroke-width="1.2" opacity="${(Number(op) * 0.5).toFixed(3)}"/>`;
    }
    return s;
  },
};

/* ------------------------------------------------------------------
   Which artwork each page and department gets.
   ------------------------------------------------------------------ */

export const ARTWORK = {
  // Engineering departments
  'automobile-engineering': ['rings', 'slate'],
  'chemical-engineering': ['lattice', 'teal'],
  'civil-engineering': ['truss', 'ochre'],
  'computer-engineering': ['traces', 'indigo'],
  'electrical-engineering': ['waves', 'navy'],
  'electronics-engineering': ['traces', 'teal'],
  'electronics-communication': ['signal', 'indigo'],
  'electrical-electronics-engineering': ['waves', 'slate'],
  'mechanical-engineering': ['rings', 'clay'],
  'instrumentation-engineering': ['waves', 'teal'],
  'metallurgical-engineering': ['lattice', 'clay'],
  'mining-engineering': ['strata', 'ochre'],
  'information-technology': ['traces', 'moss'],

  // Other streams
  management: ['columns', 'navy'],
  'hotel-management': ['arcs', 'ochre'],
  'computer-applications': ['orbits', 'indigo'],
  science: ['orbits', 'teal'],
  commerce: ['columns', 'moss'],
  arts: ['arcs', 'plum'],

  // Editorial pages
  about: ['arcs', 'navy'],
  vision: ['orbits', 'indigo'],
  mission: ['truss', 'moss'],
  career: ['columns', 'ochre'],
  'director-message': ['arcs', 'plum'],
  'quality-policy': ['lattice', 'slate'],
  placement: ['columns', 'navy'],
  gallery: ['arcs', 'teal'],
  courses: ['orbits', 'navy'],
  admission: ['truss', 'clay'],
  contact: ['signal', 'slate'],
  specializations: ['lattice', 'plum'],
  result: ['waves', 'indigo'],
};

const page = (motif, paletteName) => {
  const c = PALETTES[paletteName];
  const body = motifs[motif](c);
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    html,body{margin:0;padding:0;background:transparent}
    svg{display:block}
  </style></head><body>
  <svg width="${W}" height="${H}" viewBox="0 0 1200 515" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ground" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="55%" stop-color="${c.ground}"/>
        <stop offset="100%" stop-color="${c.wash}"/>
      </linearGradient>
      <radialGradient id="glow" cx="72%" cy="45%" r="62%">
        <stop offset="0%" stop-color="${c.wash}" stop-opacity="0.85"/>
        <stop offset="100%" stop-color="${c.wash}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="quiet" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${c.ground}" stop-opacity="0.6"/>
        <stop offset="34%" stop-color="${c.ground}" stop-opacity="0.24"/>
        <stop offset="62%" stop-color="${c.ground}" stop-opacity="0"/>
      </linearGradient>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" result="n"/>
        <feColorMatrix in="n" type="saturate" values="0"/>
        <feComponentTransfer><feFuncA type="linear" slope="0.045"/></feComponentTransfer>
        <feComposite operator="in" in2="SourceGraphic"/>
      </filter>
    </defs>

    <rect width="1200" height="515" fill="url(#ground)"/>
    <rect width="1200" height="515" fill="url(#glow)"/>

    <g>${body}</g>

    <!-- The heading is printed over the left of this plate, so it stays calm. -->
    <rect width="1200" height="515" fill="url(#quiet)"/>

    <!-- A gold hairline ties every banner to the brand. -->
    <rect x="0" y="511" width="1200" height="4" fill="${GOLD}" opacity="0.9"/>

    <rect width="1200" height="515" filter="url(#grain)" fill="${INK}" opacity="0.5"/>
  </svg></body></html>`;
};

/* ------------------------------------------------------------------ */

const only = process.argv[2];
const entries = Object.entries(ARTWORK).filter(([k]) => !only || k === only || ARTWORK[k][0] === only);

if (entries.length === 0) {
  console.error(`Nothing matched "${only}". Motifs: ${Object.keys(motifs).join(', ')}`);
  process.exit(1);
}

fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--force-color-profile=srgb'],
});

for (const [name, [motif, palette]] of entries) {
  const p = await browser.newPage();
  await p.setViewport({ width: W, height: H, deviceScaleFactor: SCALE });
  await p.setContent(page(motif, palette), { waitUntil: 'load' });
  await new Promise((r) => setTimeout(r, 120));
  // PNG out of Chrome, then JPEG: these are flat gradients and line work, and
  // the grain overlay hides the banding JPEG would otherwise show in the sky.
  // Roughly a tenth of the size for no visible difference.
  const png = await p.screenshot();
  await p.close();
  const file = path.join(OUT, `${name}.jpg`);
  await sharp(png).jpeg({ quality: 90, chromaSubsampling: '4:4:4', mozjpeg: true }).toFile(file);
  console.log(`  ${String(motif).padEnd(9)} ${String(palette).padEnd(8)} ${W * SCALE}x${H * SCALE}  ${String(Math.round(fs.statSync(file).size / 1024)).padStart(4)} KB  ${name}`);
}

await browser.close();
console.log(`\n${entries.length} banner(s) in public/media/art/`);

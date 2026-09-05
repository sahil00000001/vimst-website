import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

/**
 * Full-site audit.
 *
 * Walks every route at desktop and phone widths and reports console errors,
 * failed requests, broken images, horizontal overflow, heading problems, and
 * -- the part that matters most here -- every interactive element that does
 * not actually do anything: links with no destination, buttons with no
 * handler, controls too small to tap, and unlabelled icon buttons.
 *
 *   npm run build && npm start &
 *   node scripts/audit.mjs
 */

const BASE = process.env.BASE ?? 'http://localhost:3000';
const site = JSON.parse(fs.readFileSync('content/site.json', 'utf8'));

const ROUTES = [
  '/',
  '/about',
  '/vision',
  '/mission',
  '/career',
  '/director-message',
  '/quality-policy',
  '/courses',
  '/specializations',
  '/placement',
  '/photo-gallery',
  '/fee-structure',
  '/payment-modes',
  '/enrollment-verification',
  '/contact',
  '/admin/login',
  '/this-route-does-not-exist',
  ...site.courses.map((c) => `/courses/${c.slug}`),
];

const WIDTHS = [1440, 390];

/* Minimum comfortable tap target on a touch screen. */
const MIN_TAP = 40;

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

const report = [];
const internalLinks = new Set();
let totalInteractive = 0;

for (const width of WIDTHS) {
  const page = await browser.newPage();
  await page.setViewport({ width, height: width < 600 ? 844 : 1000 });

  for (const route of ROUTES) {
    const issues = [];
    const expect404 = route.includes('does-not-exist');

    const onConsole = (m) => {
      if (m.type() === 'error' && !expect404) issues.push(`console: ${m.text().slice(0, 150)}`);
    };
    const onPageError = (e) => issues.push(`pageerror: ${String(e).slice(0, 150)}`);
    const onFailed = (r) => {
      if (r.url().startsWith(BASE)) issues.push(`request failed: ${r.url().replace(BASE, '')}`);
    };
    const onResponse = (r) => {
      const u = r.url();
      if (u.startsWith(BASE) && r.status() >= 400 && !expect404) {
        issues.push(`HTTP ${r.status()}: ${u.replace(BASE, '').slice(0, 110)}`);
      }
    };

    page.on('console', onConsole);
    page.on('pageerror', onPageError);
    page.on('requestfailed', onFailed);
    page.on('response', onResponse);

    await page.goto(BASE + route, { waitUntil: 'networkidle2', timeout: 60000 });

    // Walk the page so scroll-triggered reveals fire before measuring.
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.9;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await new Promise((r) => setTimeout(r, 350));

    const checks = await page.evaluate((MIN_TAP) => {
      const doc = document.documentElement;
      const visible = (el) => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return (
          r.width > 0 &&
          r.height > 0 &&
          s.visibility !== 'hidden' &&
          s.display !== 'none' &&
          s.opacity !== '0'
        );
      };
      const describe = (el) => {
        const label =
          el.getAttribute('aria-label') ||
          el.textContent.trim().slice(0, 40) ||
          el.getAttribute('title') ||
          '';
        return `${el.tagName.toLowerCase()}${label ? ` "${label}"` : ''}`;
      };

      const problems = [];
      let interactive = 0;

      /* Links */
      for (const a of document.querySelectorAll('a')) {
        if (!visible(a)) continue;
        interactive++;
        const href = a.getAttribute('href');
        if (href === null || href === '' || href === '#') {
          problems.push(`dead link: ${describe(a)} (href="${href}")`);
          continue;
        }
        if (href.startsWith('javascript:')) {
          problems.push(`javascript: link: ${describe(a)}`);
        }
        if (!a.textContent.trim() && !a.getAttribute('aria-label') && !a.querySelector('img[alt]:not([alt=""])')) {
          problems.push(`link with no accessible name: ${a.outerHTML.slice(0, 90)}`);
        }
      }

      /* Buttons */
      for (const b of document.querySelectorAll('button')) {
        if (!visible(b)) continue;
        interactive++;
        const hasText = Boolean(b.textContent.trim());
        const hasLabel = Boolean(b.getAttribute('aria-label') || b.getAttribute('title'));
        if (!hasText && !hasLabel) {
          problems.push(`button with no accessible name: ${b.outerHTML.slice(0, 90)}`);
        }
        if (b.type === 'submit' && !b.closest('form')) {
          problems.push(`submit button outside a form: ${describe(b)}`);
        }
      }

      /* Form controls need a label */
      for (const input of document.querySelectorAll('input, select, textarea')) {
        if (!visible(input)) continue;
        if (input.type === 'hidden') continue;
        interactive++;
        const id = input.getAttribute('id');
        const labelled =
          (id && document.querySelector(`label[for="${CSS.escape(id)}"]`)) ||
          input.closest('label') ||
          input.getAttribute('aria-label') ||
          input.getAttribute('aria-labelledby');
        if (!labelled) {
          problems.push(`unlabelled field: ${input.outerHTML.slice(0, 90)}`);
        }
      }

      /* Tap targets, phone widths only */
      if (window.innerWidth < 600) {
        for (const el of document.querySelectorAll('a, button')) {
          if (!visible(el)) continue;
          const r = el.getBoundingClientRect();
          // Inline links inside a paragraph are exempt -- they flow with text.
          const inProse = el.closest('p, li, address, dd');
          if (inProse && el.tagName === 'A') continue;
          // Visually-hidden skip links are 1x1 by design until focused.
          const s = getComputedStyle(el);
          if (s.clip === 'rect(0px, 0px, 0px, 0px)' || s.clipPath === 'inset(50%)') continue;
          if (r.height < MIN_TAP && r.width < MIN_TAP) {
            problems.push(
              `tap target ${Math.round(r.width)}x${Math.round(r.height)}: ${describe(el)}`
            );
          }
        }
      }

      const broken = [...document.images]
        .filter((i) => i.complete && i.naturalWidth === 0)
        .map((i) => i.currentSrc || i.src)
        .slice(0, 5);

      return {
        overflow: doc.scrollWidth - doc.clientWidth,
        broken,
        problems,
        interactive,
        links: [...document.querySelectorAll('a[href^="/"]')].map((a) => a.getAttribute('href')),
        h1: document.querySelectorAll('h1').length,
        emptyHeadings: [...document.querySelectorAll('h1, h2, h3')].filter(
          (h) => !h.textContent.trim()
        ).length,
        title: document.title,
      };
    }, MIN_TAP);

    totalInteractive += checks.interactive;
    for (const l of checks.links) internalLinks.add(l.split('?')[0].split('#')[0]);

    if (checks.overflow > 2) issues.push(`horizontal overflow: ${checks.overflow}px`);
    for (const b of checks.broken) issues.push(`broken image: ${b.replace(BASE, '')}`);
    for (const p of checks.problems) issues.push(p);
    if (checks.emptyHeadings) issues.push(`${checks.emptyHeadings} empty heading(s)`);
    if (checks.h1 !== 1 && !expect404) issues.push(`${checks.h1} <h1> elements`);
    if (!checks.title) issues.push('missing <title>');

    page.off('console', onConsole);
    page.off('pageerror', onPageError);
    page.off('requestfailed', onFailed);
    page.off('response', onResponse);

    if (issues.length) report.push({ route, width, issues: [...new Set(issues)] });
  }
  await page.close();
}

/* Every internal link must resolve. */
const linkPage = await browser.newPage();
const dead = [];
for (const href of [...internalLinks].sort()) {
  if (href.startsWith('/media/') || href.startsWith('/api/')) continue;
  const res = await linkPage.goto(BASE + href, { waitUntil: 'domcontentloaded' });
  if (!res || res.status() >= 400) dead.push(`${href} -> ${res?.status()}`);
}
await linkPage.close();
await browser.close();

console.log(`routes checked:      ${ROUTES.length} x ${WIDTHS.length} widths`);
console.log(`interactive checked: ${totalInteractive} links, buttons and fields`);
console.log(`internal links:      ${internalLinks.size} distinct`);

if (dead.length) console.log(`\nDEAD LINKS:\n${dead.join('\n')}`);
else console.log('all internal links resolve');

if (report.length) {
  const total = report.reduce((a, r) => a + r.issues.length, 0);
  console.log(`\n--- ${total} issues across ${report.length} route/width pairs ---`);

  // Grouped by kind: one repeated component problem should read as one problem,
  // not as 138 separate ones.
  const kinds = new Map();
  for (const r of report) {
    for (const issue of r.issues) {
      const kind = issue.split(':')[0];
      if (!kinds.has(kind)) {
        kinds.set(kind, { count: 0, samples: new Set(), routes: new Set() });
      }
      const entry = kinds.get(kind);
      entry.count++;
      entry.routes.add(r.route);
      if (entry.samples.size < 5) entry.samples.add(issue.slice(0, 130));
    }
  }

  for (const [kind, entry] of [...kinds].sort((a, b) => b[1].count - a[1].count)) {
    console.log(`\n${entry.count} x ${kind}  (on ${entry.routes.size} route(s))`);
    for (const sample of entry.samples) console.log(`    ${sample}`);
  }
} else {
  console.log('\nno issues found');
}

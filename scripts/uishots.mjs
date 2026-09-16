import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

/**
 * Captures a mobile device frame-by-frame down each page, so the screenshots
 * are readable at inspection size rather than one unreadably tall strip.
 *
 *   node scripts/uishots.mjs [width]
 */

const BASE = process.env.BASE ?? 'http://localhost:3300';
const WIDTH = Number(process.argv[2] ?? 390);
const HEIGHT = 844;
const OUT = 'shots';

const PAGES = [
  { route: '/', name: 'home', frames: 8 },
  { route: '/courses', name: 'courses', frames: 3 },
  { route: '/courses/bca', name: 'course', frames: 5 },
  { route: '/about', name: 'about', frames: 3 },
  { route: '/contact', name: 'contact', frames: 3 },
  { route: '/enrollment-verification', name: 'result', frames: 2 },
  { route: '/placement', name: 'placement', frames: 3 },
  { route: '/photo-gallery', name: 'gallery', frames: 2 },
  { route: '/admin/login', name: 'adminlogin', frames: 1 },
];

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox'],
});

const findings = [];

for (const { route, name, frames } of PAGES) {
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await page.goto(BASE + route, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 900));

  // Walk the page once so scroll-triggered reveals have fired.
  const height = await page.evaluate(async () => {
    const step = window.innerHeight * 0.85;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
    return document.body.scrollHeight;
  });
  await new Promise((r) => setTimeout(r, 500));

  /* Measurable problems, collected alongside the images. */
  const audit = await page.evaluate((vw) => {
    const out = { overflow: [], tiny: [], cramped: [] };
    const doc = document.documentElement;
    out.scrollWidth = doc.scrollWidth;
    out.clientWidth = doc.clientWidth;

    // The only overflow that matters is the kind a thumb can reach.
    window.scrollTo(500, 0);
    out.pannableBy = window.scrollX;
    window.scrollTo(0, 0);

    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const s = getComputedStyle(el);
      if (s.position === 'fixed') continue;

      // Anything sticking past the viewport that isn't in a scroller.
      let scrollableAncestor = false;
      for (let p = el.parentElement; p; p = p.parentElement) {
        const ps = getComputedStyle(p);
        if (ps.overflowX === 'auto' || ps.overflowX === 'scroll' || ps.overflow === 'hidden') {
          scrollableAncestor = true;
          break;
        }
      }
      if (out.pannableBy > 0 && !scrollableAncestor && (r.right > vw + 1 || r.left < -1)) {
        out.overflow.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)} L${Math.round(r.left)} R${Math.round(r.right)}`);
      }

      // Tap targets below the 44px guideline.
      if (el.matches('a, button, input, select, [role="button"]')) {
        // Skip links are 1x1 until focused; that is intentional, not a defect.
        const hidden = el.classList.contains('sr-only') || r.width <= 2 || r.height <= 2;
        if (!hidden && r.height < 40 && el.textContent.trim()) {
          out.tiny.push(`${el.tagName.toLowerCase()} "${el.textContent.trim().slice(0, 26)}" ${Math.round(r.width)}x${Math.round(r.height)}`);
        }
      }

      // Text smaller than 12px is hard work on a phone.
      const size = parseFloat(s.fontSize);
      if (size && size < 11.5 && el.children.length === 0 && el.textContent.trim().length > 3) {
        out.cramped.push(`${size.toFixed(1)}px "${el.textContent.trim().slice(0, 30)}"`);
      }
    }

    out.overflow = [...new Set(out.overflow)].slice(0, 8);
    out.tiny = [...new Set(out.tiny)].slice(0, 10);
    out.cramped = [...new Set(out.cramped)].slice(0, 10);
    return out;
  }, WIDTH);

  if (audit.pannableBy > 0 || audit.overflow.length || audit.tiny.length || audit.cramped.length) {
    findings.push({ route, ...audit });
  }

  const total = Math.min(frames, Math.ceil(height / (HEIGHT * 0.9)));
  for (let i = 0; i < total; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), i * HEIGHT * 0.9);
    await new Promise((r) => setTimeout(r, 500));
    await page.screenshot({ path: `${OUT}/${name}-${WIDTH}-${String(i).padStart(2, '0')}.png` });
  }

  // The footer, framed on its own — it was called out specifically.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise((r) => setTimeout(r, 700));
  await page.screenshot({ path: `${OUT}/${name}-${WIDTH}-footer.png` });

  console.log(`${route.padEnd(28)} ${height}px  ${total + 1} frames`);
  await page.close();
}

await browser.close();

console.log('\n--- MEASURED ISSUES ---');
console.log(findings.length ? JSON.stringify(findings, null, 1) : 'none');

import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE ?? 'http://localhost:3210';
const OUT = process.env.OUT ?? 'shots';

const targets = process.argv.slice(2);
const routes = targets.length
  ? targets.map((t) => {
      const [route, name, width] = t.split('::');
      return { route, name: name || route.replace(/\W+/g, '-') || 'home', width: Number(width) || 1440 };
    })
  : [{ route: '/', name: 'home', width: 1440 }];

fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--force-device-scale-factor=1'],
});

const problems = [];

for (const { route, name, width } of routes) {
  const page = await browser.newPage();
  await page.setViewport({ width, height: width < 600 ? 900 : 1000, deviceScaleFactor: 1 });

  const errors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('requestfailed', (r) => errors.push(`FAILED ${r.url()} ${r.failure()?.errorText}`));

  await page.goto(BASE + route, { waitUntil: 'networkidle2', timeout: 60000 });

  // Let entrance animations settle, then walk the page so scroll-triggered
  // reveals fire before the full-page capture.
  await new Promise((r) => setTimeout(r, 900));
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 130));
    }
    window.scrollTo(0, 0);
  });
  await new Promise((r) => setTimeout(r, 700));

  // Flag any element that pushes the page wider than the viewport.
  const overflow = await page.evaluate(() => {
    const bad = [];
    const vw = document.documentElement.clientWidth;
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0) continue;
      if (r.right > vw + 2 || r.left < -2) {
        const s = getComputedStyle(el);
        if (s.position === 'fixed' || s.overflowX === 'auto' || s.overflowX === 'scroll') continue;
        bad.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)} right=${Math.round(r.right)} vw=${vw}`);
      }
    }
    return {
      scrollW: document.documentElement.scrollWidth,
      clientW: vw,
      offenders: bad.slice(0, 5),
    };
  });

  const file = path.join(OUT, `${name}-${width}.png`);
  await page.screenshot({ path: file, fullPage: true });

  if (errors.length || overflow.scrollW > overflow.clientW + 2) {
    problems.push({ route, width, errors: errors.slice(0, 6), overflow });
  }
  console.log(`${route} @${width} -> ${file}`);
  await page.close();
}

await browser.close();

if (problems.length) {
  console.log('\n--- PROBLEMS ---');
  console.log(JSON.stringify(problems, null, 2));
} else {
  console.log('\nno console errors, no horizontal overflow');
}

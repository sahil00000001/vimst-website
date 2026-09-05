import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const route = process.argv[2] ?? '/';
const name = process.argv[3] ?? 'm';
const width = Number(process.argv[4] ?? 390);
const BASE = process.env.BASE ?? 'http://localhost:3211';

fs.mkdirSync('shots', { recursive: true });
const b = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox'],
});
const p = await b.newPage();
await p.setViewport({ width, height: 844, isMobile: width < 700, hasTouch: width < 700 });
await p.goto(BASE + route, { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 1000));

const h = await p.evaluate(() => document.body.scrollHeight);
const shots = Math.min(6, Math.ceil(h / 844));
for (let i = 0; i < shots; i++) {
  await p.evaluate((y) => window.scrollTo(0, y), i * 800);
  await new Promise((r) => setTimeout(r, 900));
  await p.screenshot({ path: `shots/${name}-${width}-${i}.png` });
}
console.log(`${route} -> ${shots} frames, page height ${h}`);
await b.close();

import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Generates the institute wordmark, crest and favicon.
 *
 * Rendered through headless Chrome rather than an SVG rasteriser because this
 * is type, and Chrome is the only thing here that shapes real fonts reliably.
 * The output sizes match what the old assets used (900x191 wordmark, 512
 * crest), so no component layout has to change.
 *
 * This is a typographic mark, deliberately. A crest with a portrait is
 * something an institute commissions; inventing one would be worse than
 * lettering done carefully.
 *
 *   node scripts/logo.mjs
 */

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = path.resolve('public/media');
const SCALE = 3;

const CRIMSON = '#b01029';
const DEEP = '#8a0c20';
const INK = '#16151a';

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');
`;

/** The roundel: a ring of the full name around a VIMST monogram. */
const crest = (size) => `
<!doctype html>
<html><head><meta charset="utf-8"><style>
${FONTS}
  html,body{margin:0;padding:0;background:transparent}
  .wrap{width:${size}px;height:${size}px;display:grid;place-items:center}
  svg{display:block}
  .ring-text{
    font-family:'Inter',sans-serif;font-weight:700;
    font-size:20.5px;letter-spacing:1.4px;fill:${CRIMSON};
    text-transform:uppercase;
  }
  .mono{
    font-family:'Fraunces',serif;font-weight:600;
    font-size:104px;fill:${CRIMSON};letter-spacing:1px;
  }
  .est{font-family:'Inter',sans-serif;font-weight:600;font-size:19px;letter-spacing:3.4px;fill:${DEEP}}
</style></head><body>
<div class="wrap">
  <svg width="${size}" height="${size}" viewBox="0 0 512 512" fill="none">
    <defs>
      <path id="arcTop" d="M 44,256 A 212,212 0 0 1 468,256" />
      <path id="arcBottom" d="M 44,256 A 212,212 0 0 0 468,256" />
    </defs>

    <circle cx="256" cy="256" r="248" stroke="${CRIMSON}" stroke-width="4" fill="#fff"/>
    <circle cx="256" cy="256" r="182" stroke="${CRIMSON}" stroke-width="2" fill="none"/>

    <text class="ring-text">
      <textPath href="#arcTop" startOffset="50%" text-anchor="middle">
        VIVEKANANDA INSTITUTE
      </textPath>
    </text>
    <text class="ring-text" dy="16">
      <textPath href="#arcBottom" startOffset="50%" text-anchor="middle">
        MANAGEMENT SCIENCE AND TECHNOLOGY
      </textPath>
    </text>
    <circle cx="44" cy="256" r="5" fill="${CRIMSON}"/>
    <circle cx="468" cy="256" r="5" fill="${CRIMSON}"/>

    <text class="mono" x="256" y="286" text-anchor="middle">VIMST</text>

    <line x1="150" y1="318" x2="362" y2="318" stroke="${CRIMSON}" stroke-width="2.5"/>
    <line x1="178" y1="330" x2="334" y2="330" stroke="${CRIMSON}" stroke-width="1.5"/>

    <text class="est" x="256" y="372" text-anchor="middle">EST. 1998</text>
  </svg>
</div>
</body></html>`;

/** The horizontal lockup used in the header, footer and on the marksheet. */
const wordmark = (w, h) => `
<!doctype html>
<html><head><meta charset="utf-8"><style>
${FONTS}
  html,body{margin:0;padding:0;background:transparent}
  .wrap{
    width:${w}px;height:${h}px;display:flex;align-items:center;gap:26px;
    padding:0 4px;box-sizing:border-box;
  }
  .mark{flex:0 0 auto}
  .type{display:flex;flex-direction:column;justify-content:center;gap:5px}
  .name{
    font-family:'Fraunces',serif;font-weight:600;font-size:56px;line-height:1;
    color:${CRIMSON};letter-spacing:0.5px;white-space:nowrap;
  }
  .sub{
    font-family:'Inter',sans-serif;font-weight:500;font-size:17.5px;line-height:1;
    color:${INK};letter-spacing:2.15px;white-space:nowrap;
  }
  .iso{
    font-family:'Inter',sans-serif;font-weight:600;font-size:13px;line-height:1;
    color:${DEEP};letter-spacing:1.6px;
  }
  .row{display:flex;align-items:baseline;justify-content:space-between}
</style></head><body>
<div class="wrap">
  <svg class="mark" width="${h - 12}" height="${h - 12}" viewBox="0 0 512 512" fill="none">
    <defs>
      <path id="arcTop2" d="M 44,256 A 212,212 0 0 1 468,256" />
      <path id="arcBottom2" d="M 44,256 A 212,212 0 0 0 468,256" />
    </defs>
    <circle cx="256" cy="256" r="248" stroke="${CRIMSON}" stroke-width="6" fill="#fff"/>
    <circle cx="256" cy="256" r="182" stroke="${CRIMSON}" stroke-width="3" fill="none"/>
    <text style="font-family:'Inter',sans-serif;font-weight:700;font-size:21px;letter-spacing:1.4px;fill:${CRIMSON}">
      <textPath href="#arcTop2" startOffset="50%" text-anchor="middle">VIVEKANANDA INSTITUTE</textPath>
    </text>
    <text dy="17" style="font-family:'Inter',sans-serif;font-weight:700;font-size:21px;letter-spacing:1.4px;fill:${CRIMSON}">
      <textPath href="#arcBottom2" startOffset="50%" text-anchor="middle">MANAGEMENT SCIENCE AND TECHNOLOGY</textPath>
    </text>
    <circle cx="44" cy="256" r="6" fill="${CRIMSON}"/>
    <circle cx="468" cy="256" r="6" fill="${CRIMSON}"/>
    <text style="font-family:'Fraunces',serif;font-weight:600;font-size:104px;fill:${CRIMSON}" x="256" y="286" text-anchor="middle">VIMST</text>
    <line x1="150" y1="318" x2="362" y2="318" stroke="${CRIMSON}" stroke-width="3"/>
    <line x1="178" y1="330" x2="334" y2="330" stroke="${CRIMSON}" stroke-width="2"/>
    <text style="font-family:'Inter',sans-serif;font-weight:600;font-size:19px;letter-spacing:3.4px;fill:${DEEP}" x="256" y="372" text-anchor="middle">EST. 1998</text>
  </svg>

  <div class="type">
    <div class="name">VIVEKANANDA</div>
    <div class="row">
      <div class="sub">INSTITUTE OF MANAGEMENT SCIENCE AND TECHNOLOGY</div>
    </div>
    <div class="iso">ISO 9001:2008</div>
  </div>
</div>
</body></html>`;

/** Square monogram, for the browser tab. */
const icon = (size) => `
<!doctype html>
<html><head><meta charset="utf-8"><style>
${FONTS}
  html,body{margin:0;padding:0;background:transparent}
  .wrap{width:${size}px;height:${size}px;display:grid;place-items:center}
</style></head><body>
<div class="wrap">
  <svg width="${size}" height="${size}" viewBox="0 0 512 512" fill="none">
    <rect x="8" y="8" width="496" height="496" rx="108" fill="${CRIMSON}"/>
    <text style="font-family:'Fraunces',serif;font-weight:600;font-size:196px;fill:#fff"
          x="256" y="326" text-anchor="middle">V</text>
    <line x1="150" y1="368" x2="362" y2="368" stroke="#fff" stroke-width="14" opacity="0.85"/>
  </svg>
</div>
</body></html>`;

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--force-color-profile=srgb'],
});

async function shoot(html, width, height, file) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: SCALE });
  await page.setContent(html, { waitUntil: 'networkidle0' });
  // Chrome reports fonts ready before the first paint uses them.
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: file, omitBackground: true });
  await page.close();
  console.log(`  ${file}  ${width * SCALE}x${height * SCALE}  ${Math.round(fs.statSync(file).size / 1024)} KB`);
}

fs.mkdirSync(OUT, { recursive: true });
console.log('Rendering:');
await shoot(wordmark(900, 191), 900, 191, path.join(OUT, 'logo-wordmark.png'));
await shoot(crest(512), 512, 512, path.join(OUT, 'logo-crest.png'));
await shoot(icon(512), 512, 512, path.resolve('src/app/icon.png'));

await browser.close();
console.log('\nDone. These are typographic placeholders — replace with the commissioned mark when it exists.');

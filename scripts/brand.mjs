import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Turns the supplied logo files into the assets the site actually needs.
 *
 * They arrive as JPEGs on a white background. The header, footer and admin
 * sidebar all sit on white, but the page ground is off-white (#faf9f7), so a
 * hard white rectangle would show as a visible patch. These are converted to
 * PNG with the white keyed out, so the mark sits on any colour.
 *
 * The key is a soft ramp rather than a threshold: anything more than a little
 * off-white becomes fully opaque, and the few pixels in between keep partial
 * alpha, which is what stops the edges going jagged.
 *
 *   node scripts/brand.mjs
 */

/**
 * The originals live in `brand/`, outside public/media, because
 * `npm run content` rebuilds public/media from the old site's asset tree and
 * deletes anything else it finds there. They were kept in
 * public/media/images/ once and were silently destroyed on the next build.
 */
const SRC = 'brand';
const OUT = 'public/media';

const WIDE = path.join(SRC, 'logo-wide.jpeg');
const CREST = path.join(SRC, 'logo-crest.jpeg');

/** Replaces a white background with transparency, keeping edges smooth. */
async function keyOutWhite(input) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const px = Buffer.from(data);
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i];
    const g = px[i + 1];
    const b = px[i + 2];
    // How far this pixel sits from pure white.
    const distance = 255 - Math.min(r, g, b);
    // JPEG noise puts the background a few points off white, so everything
    // inside that margin is cleared outright; past it, a steep ramp keeps the
    // gold solid while leaving the antialiased edge smooth.
    px[i + 3] = distance <= 12 ? 0 : Math.max(0, Math.min(255, (distance - 12) * 6));
  }

  return sharp(px, { raw: { width: info.width, height: info.height, channels: 4 } }).png();
}

fs.mkdirSync(OUT, { recursive: true });

/* ---------------- wide lockup ---------------- */

// Trim to the mark, then give it a little air back. Touching the edge reads
// as clipped, and every place this sits already supplies its own spacing.
const wideTrimmed = await (await keyOutWhite(WIDE)).trim({ threshold: 10 }).toBuffer();
const wt = await sharp(wideTrimmed).metadata();
const padX = Math.round(wt.width * 0.02);
const padY = Math.round(wt.height * 0.06);

const wide = await sharp(wideTrimmed)
  .extend({
    top: padY,
    bottom: padY,
    left: padX,
    right: padX,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toBuffer()
  .then((buf) =>
    sharp(buf)
      .resize({ width: 1200 })
      .png({ compressionLevel: 9, palette: true, quality: 90 })
      .toBuffer()
  );
fs.writeFileSync(path.join(OUT, 'logo-wordmark.png'), wide);
const wm = await sharp(wide).metadata();
console.log(`  logo-wordmark.png  ${wm.width}x${wm.height}  ${Math.round(wide.length / 1024)} KB`);

// The marksheet embeds whatever it is given, byte for byte, and a student
// downloads that file. It prints the mark 250pt wide, so 600px is ample.
const print = await sharp(wide)
  .resize({ width: 600 })
  .png({ compressionLevel: 9, palette: true, quality: 90 })
  .toBuffer();
fs.writeFileSync(path.join(OUT, 'logo-print.png'), print);
console.log(`  logo-print.png     600x${Math.round((wm.height * 600) / wm.width)}  ${Math.round(print.length / 1024)} KB`);

/* ---------------- crest ---------------- */

// Trimmed to the emblem, then padded back to a square so it never distorts
// wherever it is placed.
const crestTrimmed = await (await keyOutWhite(CREST)).trim({ threshold: 10 }).toBuffer();
const ct = await sharp(crestTrimmed).metadata();
const side = Math.max(ct.width, ct.height);

const crest = await sharp({
  create: {
    width: side,
    height: side,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite([
    {
      input: crestTrimmed,
      left: Math.round((side - ct.width) / 2),
      top: Math.round((side - ct.height) / 2),
    },
  ])
  .png()
  .toBuffer()
  .then((buf) => sharp(buf).resize(640, 640).png({ compressionLevel: 9, palette: true, quality: 90 }).toBuffer());
fs.writeFileSync(path.join(OUT, 'logo-crest.png'), crest);
console.log(`  logo-crest.png     640x640  ${Math.round(crest.length / 1024)} KB`);

/* ---------------- favicon ---------------- */

// A browser tab is 16-32px across. The full roundel, with its ring of text,
// turns to mush at that size, so the favicon uses the portrait alone on the
// brand navy — recognisable as a shape rather than as lettering.
const inner = await sharp(crestTrimmed)
  .extract({
    left: Math.round(ct.width * 0.24),
    top: Math.round(ct.height * 0.06),
    width: Math.round(ct.width * 0.52),
    height: Math.round(ct.height * 0.74),
  })
  .resize(400, 400, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .toBuffer();

const icon = await sharp({
  create: { width: 512, height: 512, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
})
  .composite([{ input: inner, left: 56, top: 56 }])
  .png()
  .toBuffer()
  .then((buf) => sharp(buf).png({ compressionLevel: 9, palette: true, quality: 90 }).toBuffer());
fs.writeFileSync('src/app/icon.png', icon);
console.log(`  src/app/icon.png   512x512  ${Math.round(icon.length / 1024)} KB`);

/*
 * The campus photograph for the first hero slide. It is used as supplied, so
 * this is a copy rather than a conversion, but it belongs here so that one
 * command restores every file that came out of the originals in `brand/`.
 */
const HERO = 'public/media/hero/campus-gate.jpg';
fs.mkdirSync(path.dirname(HERO), { recursive: true });
fs.copyFileSync(path.join(SRC, 'campus.jpeg'), HERO);
const campus = await sharp(HERO).metadata();
console.log(
  `  ${HERO}  ${campus.width}x${campus.height}  ${Math.round(fs.statSync(HERO).size / 1024)} KB`
);

console.log('\nDone.');

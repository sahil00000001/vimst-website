import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

/**
 * Image pass.
 *
 * The source repo ships full-resolution camera JPEGs (one is 1.1 MB) that are
 * only ever shown a few hundred pixels wide. Every raster is capped at a sane
 * dimension and re-encoded, then measured so `next/image` gets real intrinsic
 * sizes, plus a tiny inline blur placeholder so nothing pops in.
 */

const ROOT = path.resolve('public/media');
const OUT = path.resolve('content/image-meta.json');

/* Widest any single image is ever displayed, by role. */
const MAX_WIDTH = 2000;
const LOGO_MAX = 400; // recruiter logos render at ~150px
const QUALITY = 78;

const isRaster = (f) => /\.(jpe?g|png)$/i.test(f);

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(abs, acc);
    else if (isRaster(entry.name)) acc.push(abs);
  }
  return acc;
}

const files = walk(ROOT);
const meta = {};
let savedBytes = 0;

for (const abs of files) {
  const rel = '/media/' + path.relative(ROOT, abs).split(path.sep).join('/');
  // Read into memory first: on Windows sharp keeps the source file open, so
  // writing back to the same path while it is streaming fails.
  let source = fs.readFileSync(abs);
  const before = source.length;
  let info = await sharp(source, { failOn: 'none' }).metadata();

  const cap = rel.includes('/logo/') ? LOGO_MAX : MAX_WIDTH;
  const isPng = /\.png$/i.test(abs);

  // Already tuned at the size and quality they are generated or chosen at.
  // Re-encoding them here only throws away detail, a little on every run.
  // The blur placeholder below is still produced for them.
  const skip = /logo-wordmark|logo-crest|^\/media\/(art|hero)\//.test(rel);

  if (!skip && (info.width > cap || before > 120_000)) {
    const pipeline = sharp(source, { failOn: 'none' }).resize({
      width: Math.min(info.width, cap),
      withoutEnlargement: true,
    });

    const buffer = isPng
      ? await pipeline.png({ compressionLevel: 9, palette: true }).toBuffer()
      : await pipeline.jpeg({ quality: QUALITY, mozjpeg: true }).toBuffer();

    if (buffer.length < before) {
      fs.writeFileSync(abs, buffer);
      savedBytes += before - buffer.length;
      source = buffer;
      info = await sharp(buffer).metadata();
    }
  }

  // 16px-wide blur placeholder, inlined as a data URI.
  const blurBuf = await sharp(source, { failOn: 'none' })
    .resize(16, null, { fit: 'inside' })
    .jpeg({ quality: 40 })
    .toBuffer();

  meta[rel] = {
    width: info.width,
    height: info.height,
    blurDataURL: `data:image/jpeg;base64,${blurBuf.toString('base64')}`,
  };
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(meta, null, 2));

console.log(`processed ${files.length} images`);
console.log(`saved ${(savedBytes / 1024 / 1024).toFixed(1)} MB`);

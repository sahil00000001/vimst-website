import fs from 'node:fs';
import path from 'node:path';

const SRC = path.resolve('../source');
const DEST = path.resolve('public/media');
const ASSET_EXT = /\.(jpe?g|png|gif|svg|webp|pdf|ico)$/i;

// Source filenames contain spaces, apostrophes and mixed case, which make for
// brittle URLs. Everything is copied under a sanitised, stable name and the
// original -> new mapping is written out for the content builder to use.
function slugify(name) {
  const ext = path.extname(name);
  const base = path.basename(name, ext);
  const clean = base
    .normalize('NFKD')
    .replace(/[^\w\s.-]/g, '')
    .replace(/[\s_.]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  return (clean || 'asset') + ext.toLowerCase();
}

const map = {};
const used = new Set();

function walk(dir, rel = '') {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const abs = path.join(dir, entry.name);
    const relPath = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      walk(abs, relPath);
      continue;
    }
    if (!ASSET_EXT.test(entry.name)) continue;

    const relDir = path.dirname(relPath) === '.' ? '' : path.dirname(relPath);
    const outDir = relDir ? slugifyDir(relDir) : '';
    let outName = slugify(entry.name);
    let key = outDir ? `${outDir}/${outName}` : outName;
    let n = 1;
    while (used.has(key)) {
      const ext = path.extname(outName);
      outName = `${path.basename(outName, ext)}-${n++}${ext}`;
      key = outDir ? `${outDir}/${outName}` : outName;
    }
    used.add(key);

    const target = path.join(DEST, key);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(abs, target);
    map[relPath] = `/media/${key}`;
  }
}

function slugifyDir(d) {
  return d.split('/').map((p) => slugify(p + '.x').replace(/\.x$/, '')).join('/');
}

/**
 * Names under public/media that this script does not own.
 *
 * This script only mirrors the old site's asset tree. Everything listed here
 * arrived another way: `art/` is the 32 department banners from
 * `npm run artwork`, the `logo-*` files come from `npm run brand`, and
 * `hero/ gallery/ home/ pages/ video/` are the media slots documented in
 * MEDIA.md, which are filled by hand.
 *
 * A blind wipe of public/media takes all of that with it and silently 404s
 * every banner and the header logo on the next `npm run content`. That has
 * already happened once; hence the list.
 */
const NOT_OURS = new Set(['art', 'hero', 'gallery', 'home', 'pages', 'video']);
const GENERATED = (name) => NOT_OURS.has(name) || /^logo-/.test(name);

for (const entry of fs.existsSync(DEST) ? fs.readdirSync(DEST) : []) {
  if (GENERATED(entry)) continue;
  fs.rmSync(path.join(DEST, entry), { recursive: true, force: true });
}
fs.mkdirSync(DEST, { recursive: true });
walk(SRC);
fs.mkdirSync(path.resolve('content'), { recursive: true });
fs.writeFileSync(path.resolve('content/asset-map.json'), JSON.stringify(map, null, 2));
console.log('copied', Object.keys(map).length, 'assets');

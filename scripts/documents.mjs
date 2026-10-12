import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import sharp from 'sharp';

/**
 * Document pass.
 *
 * A PDF in an <iframe> is not something a phone can be trusted with: Chrome on
 * Android shows an empty frame, Safari on iOS shows the first page and nothing
 * after it. So every page of every PDF in `public/media/documents/` is drawn
 * out to a picture here, and the site shows those pictures with a link to the
 * PDF itself for downloading and printing. The notices and the application
 * form are scans in any case -- one photograph per page, no text layer -- so a
 * picture of the page loses nothing the PDF had.
 *
 *   npm run documents
 *
 * Re-run it whenever a PDF in that folder is added or replaced. Pages land at
 * `public/media/documents/<name>/page-<n>.jpg`, and their size and blur
 * placeholder are written into `content/image-meta.json` the same way
 * `scripts/images.mjs` writes every other picture's. Each PDF's page list and
 * file size go into `content/documents.json`, which the pages showing them
 * read; what each one is called is in `src/lib/documents.ts`.
 */

const ROOT = path.resolve('public/media/documents');
const META = path.resolve('content/image-meta.json');
const OUT = path.resolve('content/documents.json');

/* The scans are about 150 dpi. Twice the PDF's own 72 points per inch puts
   the page at that resolution again, so nothing is invented and nothing is
   thrown away. */
const SCALE = 2;
const QUALITY = 82;

const require = createRequire(import.meta.url);
const pdfjsRoot = path.dirname(require.resolve('pdfjs-dist/package.json'));
const standardFontDataUrl = pathToFileURL(path.join(pdfjsRoot, 'standard_fonts') + path.sep).href;

const meta = JSON.parse(fs.readFileSync(META, 'utf8'));

/* Pages of a PDF that has since been removed or shortened. */
for (const key of Object.keys(meta)) {
  if (key.startsWith('/media/documents/')) delete meta[key];
}

const pdfs = fs.readdirSync(ROOT).filter((f) => /\.pdf$/i.test(f));
const documents = {};

for (const file of pdfs) {
  const name = file.replace(/\.pdf$/i, '');
  const outDir = path.join(ROOT, name);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const source = fs.readFileSync(path.join(ROOT, file));
  const doc = await getDocument({
    data: new Uint8Array(source),
    standardFontDataUrl,
    isEvalSupported: false,
  }).promise;
  const pages = [];

  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n);
    const viewport = page.getViewport({ scale: SCALE });
    /* Drawn on the canvas pdf.js brings with it. A second copy of the same
       native module loaded alongside it crashes Node outright. */
    const { canvas, context } = doc.canvasFactory.create(
      Math.round(viewport.width),
      Math.round(viewport.height)
    );
    // A PDF page has no background of its own; paper is white.
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvas, canvasContext: context, viewport }).promise;

    const jpeg = await sharp(await canvas.encode('png'))
      .flatten({ background: '#ffffff' })
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toBuffer();
    fs.writeFileSync(path.join(outDir, `page-${n}.jpg`), jpeg);
    pages.push(`/media/documents/${name}/page-${n}.jpg`);

    const blur = await sharp(jpeg).resize(16, null, { fit: 'inside' }).jpeg({ quality: 40 }).toBuffer();
    meta[`/media/documents/${name}/page-${n}.jpg`] = {
      width: canvas.width,
      height: canvas.height,
      blurDataURL: `data:image/jpeg;base64,${blur.toString('base64')}`,
    };
    page.cleanup();
  }

  documents[name] = { pdf: `/media/documents/${file}`, bytes: source.length, pages };
  console.log(`${file}: ${doc.numPages} page${doc.numPages === 1 ? '' : 's'}`);
  await doc.destroy();
}

fs.writeFileSync(META, JSON.stringify(meta, null, 2));
fs.writeFileSync(OUT, JSON.stringify(documents, null, 2));

# Images and video

Everything optional lives in one file: [`src/lib/media.ts`](src/lib/media.ts). Add a file to
`public/media/…`, add an entry there, and it appears. Leave a slot `null` or `[]` and **nothing
renders** — no grey box, no broken frame. The site is never worse for a missing file.

---

## 1. The thing to fix first

Adding pictures is not what will make the biggest difference. **Replacing the ones already there
will.** Almost every image inherited from the old site is too small for where it is used:

| Where | Current file | Displayed at | Verdict |
| --- | --- | --- | --- |
| Page banners (20 files) | **722 × 247** | up to 1400 × 340 | ~2× upscale — visibly soft |
| Hero carousel, 4 of 6 slides | **722 × 297** | up to 1400 × 790 | ~2× upscale |
| Director's photograph | **280 × 247** | ~420 × 420 | blurry |
| 150 of 176 images | under 900px wide | — | fine in a card, not full width |

This is inherited, not introduced: the build pipeline caps images at 2000px and only ever
downscaled one file (a 4993px photo). The originals really are this small.

A browser cannot invent detail. **New photography at the sizes below will do more for how the site
looks than any layout change**, including everything else in this document.

---

## 2. Sizes

Shoot or export larger than needed and let the pipeline resize — `npm run content` caps everything
at 2000px wide, generates AVIF/WebP, measures dimensions and builds a blur placeholder.

| Slot | Ratio | Minimum width | Notes |
| --- | --- | --- | --- |
| Page banner | 21:9 | **2000px** | Sits under a white scrim; avoid detail at the very top |
| Hero carousel | 16:10 | **2000px** | Shown large on desktop, cropped square-ish on mobile |
| Course banner | 21:9 | **1600px** | One per department is enough — they can be shared |
| Lead image (editorial) | 21:9 | **1600px** | Opens a page, above the prose |
| Figure (in prose) | 16:10 | **1200px** | Two per page reads well; more turns it into a gallery |
| Campus-life tile | 4:3 | **1200px** | Parallaxes inside its frame, so allow some crop margin |
| Gallery photograph | any | **1400px** | Opens full screen, so it needs the resolution |
| Recruiter logo | any | 400px | Transparent PNG on white; capped at 400px deliberately |
| Video poster | match the video | **1600px** | Required. It is all that loads until someone presses play |

**Formats.** JPEG for photographs, PNG only for logos and anything needing transparency. Do not
pre-convert to WebP or AVIF — the pipeline does that, and a source WebP just limits what it can do.

---

## 3. Where pictures help most

Eight pages are currently text from top to bottom. In rough order of what a prospective student
actually wants to see:

| Page | Suggested | Why |
| --- | --- | --- |
| **About** | 1 lead + 2 figures | The building, a classroom, students working |
| **Director's message** | 1 lead | A proper portrait. The current one is 280px and it shows |
| **Placements** | 1 lead | Students at an interview or a recruitment day |
| **Career** | 2 figures | Counselling, a workshop |
| **Vision / Mission** | 1 figure each | Campus, library, laboratory |
| **Quality policy** | 1 figure | A laboratory or a class in progress |

```ts
// src/lib/media.ts
export const PAGE_LEAD_IMAGE = {
  about: { src: '/media/about/campus-front.jpg', alt: 'The main block seen from the entrance' },
  // …
};

export const PAGE_FIGURES = {
  about: [
    { src: '/media/about/library.jpg', alt: 'Students reading in the library' },
    { src: '/media/about/lab.jpg', alt: 'A computer laboratory', caption: 'The Web Access Centre.' },
  ],
};
```

**Write real alt text.** It is what a blind reader hears and what Google indexes. Describe the
photograph, not the page: "Students in the computer laboratory", not "college image". Leave
`caption` off unless it says something the picture does not — a date, a name, an occasion.

> Worth saying plainly: I did not fill these in myself. I tried, and the file I assumed was the
> institute building turned out to be a G20 graphic. Someone who recognises the photographs should
> label them.

---

## 4. Video

Two slots, both off until you set them:

```ts
export const HERO_VIDEO = {
  src: '/media/video/campus.mp4',
  poster: '/media/video/campus-poster.jpg',
  label: 'Campus tour · 1:40',
};
```

- **`HERO_VIDEO`** replaces the carousel beside the headline. A film says more than six stills, so
  the carousel and its controls step aside automatically when this is set.
- **`CAMPUS_VIDEO`** is a full-width band further down the home page, before Campus Life — by then
  a reader has shown they are interested in the place itself.

**Encoding.** H.264 MP4, 1080p, **under 20 MB**. Add a WebM alongside if you have one (`webm:`) —
smaller, and Chrome prefers it. A minute or two is plenty; nobody watches four.

**How it loads.** Only the poster image is fetched on arrival — no video bytes at all. The
`<video>` element is created on the first press of play. On a phone on mobile data that is the
difference between a page that opens and one that stalls, which is why the poster is required
rather than optional.

**`ambient: true`** makes it silent moving wallpaper instead: it loops, has no controls, and starts
by itself once scrolled into view — but **not** for anyone who has asked for reduced motion, since
an autoplaying loop is precisely what that setting exists to stop. Use it for slow drone footage,
never for anything with speech.

---

## 5. Adding files

```bash
# 1. drop the originals somewhere under public/media/
cp ~/photos/campus-front.jpg public/media/about/

# 2. optimise, measure, build blur placeholders
npm run content

# 3. add the entry to src/lib/media.ts, then check it
npm run dev
```

`npm run content` is safe to re-run; it is idempotent and rebuilds from source each time.

Before publishing, check the result on a phone:

```bash
npm run build && npm start
npm run ui:mobile 390     # flags small tap targets, tiny text, sideways scroll
```

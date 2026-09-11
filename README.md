# VIMST

A rebuild of [sahil00000001/MGIMST](https://github.com/sahil00000001/MGIMST) — 70 hand-written
static HTML pages — as a Next.js App Router site, plus an admin portal that publishes semester
results from a PostgreSQL (Supabase) database.

```bash
npm install
cp .env.example .env.local     # then fill in DATABASE_URL and ADMIN_SESSION_SECRET
npm run content                # optimise assets + extract content from ../source (once)
npm run seed:admin             # create the first admin account
npm run dev                    # http://localhost:3000
```

---

## 1. Setup

### Environment

Everything the app needs is listed in [`.env.example`](.env.example). The two required values:

```bash
DATABASE_URL="postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres"
ADMIN_SESSION_SECRET="<64 hex characters>"
```

Generate the session secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> **Use the transaction pooler host**, from Supabase → Connect → *Transaction pooler*. The
> direct `db.<ref>.supabase.co` host resolves to IPv6 only and is unreachable from Vercel and
> from most networks.
>
> URL-encode special characters in the password — `@` becomes `%40`, `#` becomes `%23`. An
> un-encoded `@` is the single most common reason a connection string fails.

### First admin account

```bash
npm run seed:admin                                  # username "admin", generated password
npm run seed:admin -- --username principal --name "Dr. Principal"
```

The script creates the account, prints the password **once**, and builds the database indexes.
Sign in at `/admin/login`.

---

## 2. Deploying to Vercel

1. Push this `web/` directory to a Git repository.
2. In Vercel: **New Project → Import**. It detects Next.js on its own; `vercel.json` pins the
   region to `hnd1` (Tokyo, beside the database) and gives bulk upload a 60-second budget.
3. Add the environment variables under **Settings → Environment Variables**, for Production,
   Preview and Development:

   | Variable | Required | Notes |
   | --- | --- | --- |
   | `DATABASE_URL` | yes | Supabase **transaction pooler** connection string |
   | `DATABASE_SCHEMA` | no | defaults to `public` |
   | `ADMIN_SESSION_SECRET` | yes | 32+ characters |
   | `NEXT_PUBLIC_SITE_URL` | recommended | your live URL, used by sitemap and metadata |
   | `RESEND_API_KEY`, `ENQUIRY_TO`, `ENQUIRY_FROM` | no | server-side enquiry email |
   | `NEXT_PUBLIC_SOCIAL_*` | no | footer social links |

4. Deploy, then run `npm run seed:admin` locally with the production `DATABASE_URL` to create the
   schema and the admin account.

Three things about pooled Postgres shaped `src/lib/db.ts`, all of them the kind that only show up
under load or in production:

- The client is cached on the global object. Serverless functions are recycled constantly, and
  without the cache each invocation opens a new pool until the database refuses connections.
- `prepare: false`. Transaction pooling does not support prepared statements.
- **Every query names its schema explicitly.** The pooler ignores the `search_path` startup
  parameter and can hand back a backend whose search path was set by an unrelated session, so
  relying on it silently breaks. `DATABASE_SCHEMA` feeds that qualification.
- Queries within a request run **sequentially**, never `Promise.all`. Pipelining independent
  queries down one pooled connection stalls.

---

## 3. The admin portal

`/admin` — protected by `src/middleware.ts`, which verifies the session at the edge so an
unauthenticated request never reaches a page that would query the database.

| Screen | What it does |
| --- | --- |
| **Dashboard** | Counts, results per semester, recently updated records, quick actions |
| **Students** | Search, add, edit and delete the student register. Deleting a student deletes their results too |
| **Results** | Enter marks per subject with totals and pass/fail computed live; publish or withhold a whole semester in one action; export |
| **Bulk upload** | Upload an Excel workbook covering many students and results at once |
| **Staff** | Create and manage accounts and roles. Management only |

### Roles

Two roles, because there are two jobs:

| | Management | Teacher |
| --- | --- | --- |
| View students and results | yes | yes |
| Add and edit students and results | yes | yes |
| Bulk upload, publish a semester, export | yes | yes |
| **Delete a student record** | yes | no |
| **Staff accounts** | yes | no |

The destructive and administrative actions stay with the office. A teacher who tries one gets a
403, not a 401 — they are signed in, they simply may not do it. Enforced in the API by
`requireManagement()`, not only hidden in the UI.

The last management account cannot be demoted or deleted, and nobody can delete the account they
are signed in with — otherwise the portal could be locked shut with no way back in.

Sessions are a signed JWT in an httpOnly cookie, valid for eight hours. Passwords are bcrypt
hashed (cost 12). Login answers the same message for an unknown username and a wrong password, so
the form cannot be used to discover valid accounts. New and reset passwords are shown **once**
and never stored in readable form.

### Bulk upload

**Admin → Bulk upload → Download template** gives you a workbook with the columns already set up.

```
Sheet "Students"   rollNo | name | fatherName | dob | batch | class | branch
Sheet "Marks"      rollNo | semester | subjectCode | subject | totalMarks | obtainedMarks
```

Marks are in **long form** — one row per subject, repeating the roll number and semester. That is
what a spreadsheet exported from an examination system actually looks like, and it lets a semester
carry any number of subjects without reshaping columns. Rows are grouped by
`(rollNo, semester)` into one result each.

The importer is deliberately forgiving about input and strict about output:

- `dob` accepts `YYYY-MM-DD`, `DD/MM/YYYY` or a real Excel date cell
- `semester` accepts `I`–`VIII`, `1`–`8`, or `Sem 3`
- roll numbers are matched case-insensitively and stored uppercase
- totals, percentage and pass/fail are **calculated**, never read from the file
- a subject scoring under 35% fails that semester

**Review always runs before anything is written.** The preview reports how many records are new
versus updated, and lists every row it could not read with the sheet name and row number. Bad rows
are skipped; the rest still upload. Re-uploading a corrected sheet **updates** records rather than
duplicating them, because writes are upserts keyed on `rollNo` and `(rollNo, semester)`.

Results whose roll number has no student record are skipped and reported rather than written as
orphans.

### Export

**Results → Export** downloads the register as a workbook whose sheets match the bulk-upload
template exactly — so an export can be edited and uploaded straight back. That is the practical
way to correct a batch of marks, and it means the office is never locked out of its own data.

---

## 3a. Students checking results

`/enrollment-verification` — a student enters their **enrollment number and date of birth**, and
sees every semester published for them. Each one can be opened on screen or downloaded as a PDF.

Identity is those two facts together: an enrollment number is often printed on a noticeboard and a
date of birth is not tied to anyone, but the pair keeps a curious classmate out without asking a
student to type their own name exactly as the office recorded it. Results marked hidden are never
served — not on the page, and not through the PDF endpoint.

The PDF is drawn with `pdf-lib` (`src/lib/marksheet-pdf.ts`) rather than rendered from HTML: there
is no headless browser on a serverless function, and a marksheet is a fixed ruled document that is
easier to control by drawing than by fighting print CSS. It comes out as a single A4 page with the
institute mark embedded.

> The original page called a third-party API directly from the browser, and its JavaScript read a
> `name` field its own form did not have — so every lookup threw. The rebuilt page works.

---

## 3b. Adding photographs and video

See **[MEDIA.md](MEDIA.md)** for how the slots work, and
**[IMAGE-BRIEF.md](IMAGE-BRIEF.md)** for a plain-English list of every picture the site wants,
with the size, the folder and a prompt for each. Every optional image and video slot lives in
`src/lib/media.ts`; an empty slot renders nothing rather than a placeholder.

The honest headline in that document: most images inherited from the old site are **722px wide**
and are displayed up to 1400px, so they are upscaled about 2x. New photography at the sizes listed
there will do more for how the site looks than any further layout work.

---

## 4. How the public content got here

Nothing was copy-pasted. `npm run content` runs four scripts, each writing into `content/`:

| Script | Does | Writes |
| --- | --- | --- |
| `assets.mjs` | Copies images/PDFs out of `../source`, renaming to URL-safe slugs | `public/media/**`, `asset-map.json` |
| `images.mjs` | Caps oversized rasters, re-encodes, measures, builds blur placeholders | rewrites `public/media/**`, `image-meta.json` |
| `extract.mjs` | Parses all 70 source pages, strips chrome, pulls out headings, prose and tables | `raw-pages.json` |
| `build-content.mjs` | Maps raw pages onto the course catalogue and editorial pages, and applies the institute rename | `site.json` |

### The rename

The institute was renamed from Mahatma Gandhi Institute of Management Science & Technology to
**Vivekananda Institute of Management Science and Technology**. Two things about how that was done:

- **The rename lives in `build-content.mjs`, not in the generated JSON.** The source HTML still
  carries the old name throughout, so editing `site.json` by hand would be undone the next time
  anyone ran `npm run content`. `content/raw-pages.json` keeps the old name on purpose — it is the
  faithful extraction of the original site, and the rename is applied where source becomes content.
- **The logo is generated, not edited.** `npm run logo` renders the wordmark, crest and favicon
  through headless Chrome (`scripts/logo.mjs`). The old assets were images that read "MAHATMA
  GANDHI" and carried a portrait, so no text substitution could reach them. The replacement is
  lettering only — a crest with a portrait is something an institute commissions, and inventing one
  would be worse than type set carefully. **Replace it when the real artwork exists.**

`scripts/catalog.mjs` is the single source of truth for which source file backs which route. It
exists because the original repo ships duplicate and mislabelled files — both
`pgd chemical-engineering.html` and `pgd-chemical-engineering.html` hold the same content, and
`diploma-chemical-engineering.html` actually contains PG Diploma copy.

Two quirks of the source markup shaped the extractor:

- **Line breaks.** Prose is wrapped with literal newlines inside `<p>` (which HTML collapses)
  *and* uses `<br>` for real breaks. Splitting on both shreds sentences, so only `<br>` and block
  ends count as breaks, and a fragment not ending on sentence punctuation joins the next one.
- **Truncated headings.** Several pages finish a heading in CSS: `.card-title:after { content:
  " (BCA)" }`. Those arrive as `Bachelor in` and are repaired from the catalogue title.

### Authored content

Five pages exist in the source repo and are linked from its menus but contain **only** nav and
footer — no body copy at all: `MCA.html`, `bachelor-EEE.html`, `diploma-EEE.html`,
`master-EEE.html`, `master-computer-engineering.html`.

Rather than ship dead links, `scripts/authored.mjs` supplies copy for those five routes, written
in the shape of their sibling programmes. **Every block in that file is new text and should be
reviewed by the institute before going live.** Everything else on the site is extracted.

---

## 5. Design

### Colour

A white / off-white field: pages sit on paper white, sections step through warmer off-whites.
Colour has to earn its place, so it appears only at small scale.

**Crimson is reserved for the institute** — brand marks, primary actions, the About and Admission
menus. It is never used for a subject family, so "this is VIMST" and "this is Mechanical
Engineering" never look alike.

Each academic family then gets one muted accent (`src/lib/accents.ts`), used for a mega-menu column
heading, a hairline rule, a level badge, a card's hover glow:

| Family | Accent | | Family | Accent |
| --- | --- | --- | --- | --- |
| Diploma | teal `#14615f` | | Management | ochre `#8a5a12` |
| Bachelor | indigo `#40428f` | | Computer Applications | ocean `#1f5a8a` |
| PG Diploma | plum `#6b2d6b` | | Science | emerald `#1d6b45` |
| Master | forest `#2c5f3a` | | Commerce | bronze `#7a4a22` |
| | | | Arts | rose `#94304f` |

Engineering reads by **level** and everything else by **stream**, because that matches how the
menus are organised: a reader in the Programmes menu is choosing a level first. Every value clears
4.5:1 on white and on the off-whites.

### Type and layout

A fluid scale (`--text-2xs` … `--text-5xl`) where each step interpolates between a phone size and a
desktop size across 380–1400px, so no heading needs a breakpoint to stay readable. Prose is held to
68ch. Layout uses two utilities: `.shell` (centred, fluid gutters) and `.section-y` (fluid vertical
rhythm).

### Motion

`src/components/Motion.tsx` — one easing curve, one set of behaviours:

`Reveal` / `Stagger` (entrance on scroll) · `WordReveal` (headline words rising from a mask) ·
`Parallax` / `ParallaxPlate` (scroll-linked, spring-smoothed) · `ScrollProgress` ·
`Magnetic` (buttons leaning toward the pointer) · `Counter` (figures counting up on arrival)

Parallax runs on the hero (copy, plate and image at three different rates), every page banner, and
inside the director and campus-life image frames. Course cards tilt toward the pointer with a glow
in their family accent.

`MotionProvider` wraps the tree in `MotionConfig reducedMotion="user"`, so the OS setting
neutralises movement globally. That matters for correctness as well as taste: branching on
`useReducedMotion()` during render produces different markup on the server and the client, which is
a hydration error.

---

## 6. Verification

```bash
npm run build
npm start &
npm run audit     # every route, both widths
npm run e2e       # the whole backend against a throwaway schema in the real database
```

**`scripts/audit.mjs`** walks all 69 routes at 1440px and 390px and checks console errors, failed
requests, broken images, horizontal overflow, heading structure, dead internal links — and every
interactive element: links with no destination, buttons and fields with no accessible name, and
tap targets under 40px on a phone. Current state: **5041 interactive elements, no issues.**

**`scripts/e2e.mjs`** creates a throwaway schema in the real database, starts the production
server against it and drives the real HTTP API — sign in, bulk upload a workbook containing
deliberately malformed rows, re-upload to prove idempotency, read back through the admin
endpoints, then look a result up the way a student would, including the cases that must be
refused. It also covers role permissions, the PDF, the export and bulk publishing. The schema is
dropped afterwards, so live student data is never touched. **67 assertions, all passing.**

Both need Chrome at the path set at the top of the file.

---

## 7. Project layout

```
src/
  app/
    (site)/          public pages — the route group keeps admin out of this chrome
    admin/           the portal; guarded by src/middleware.ts
    api/
      admin/         login, students, results, import, template, stats
      verify-enrollment/   public result lookup
      enquiry/       contact form
  components/
    admin/           portal UI
    Motion.tsx       shared animation primitives
  lib/
    db.ts            Postgres connection, schema, row mapping, normalisation
    roles.ts         roles; separate from db.ts so Edge middleware can import it
    results.ts       the student-facing lookup, shared by the page and the PDF
    marksheet-pdf.ts the printed statement of marks
    auth.ts          sessions
    import.ts        workbook parsing and template generation
    accents.ts       the colour system
    content.ts       typed access to the generated site content
scripts/             content pipeline, seeding, audit, e2e
content/             generated JSON (committed, so builds need no source repo)
```

# Image brief — every picture slot on the site

Written so you can hand each prompt straight to ChatGPT. For each slot: where it shows up in
plain English, what shape and size to make it, what it should show, and the prompt to paste.

---

## Read this first — it matters

**A generated picture of "a college campus" is not a picture of *your* campus.**

A student choosing where to study looks at these photographs to judge the place. If the building
on your home page is invented, that is misleading in a way a wrong colour never is — and if
somebody visits and it looks nothing like the site, you lose their trust at exactly the wrong
moment.

A sensible line to hold:

| Safe to generate | Use a real photograph |
| --- | --- |
| Abstract and atmospheric backgrounds | The campus building |
| Close-ups of objects — books, instruments, a desk | Your classrooms, labs, library |
| Generic study scenes used as decoration | Anyone identifiable, especially the Director |
| Textures and patterns | Anything a student would take as evidence of facilities |

**Never generate the Director's portrait.** A made-up face of a named real person is the one item
on this list that could genuinely embarrass the institute.

Everything below is still worth generating — just put real photographs in the campus slots as soon
as you have them.

---

## How to use these prompts

1. Paste a prompt into ChatGPT and ask for the image.
2. ChatGPT's largest wide size is **1792 × 1024**. That is fine — it is still about 2.5× sharper
   than what is on the site now. Ask for **landscape/wide** where the brief says wide.
3. Save as JPEG. Name it exactly as the brief says.
4. Put it in the folder named in each section.
5. Run `npm run content` then `npm run dev` to see it.

**Add this line to the end of every prompt** so the whole site looks like one place:

> Photorealistic editorial photography, natural daylight, warm neutral tones, soft shadows, clean
> and uncluttered composition, shot on a 35mm lens, shallow depth of field. Absolutely no text,
> no words, no letters, no signage, no logos, and no watermarks anywhere in the image.

The "no text" part matters — generated lettering always comes out as nonsense, and on a college
site that looks careless.

---

# SECTION 1 — Home page, the big picture at the top

The wide picture beside "Learning that travels with you", which slides between six images.

**Four of the six are badly blurred and one is very small.** This is the first thing anyone sees,
so it is the highest priority on the page.

| Slide | Size now | Verdict |
| --- | --- | --- |
| 1 | 468 × 304 | far too small — replace |
| 2 | 2000 × 721 | fine, keep |
| 3–6 | 722 × 297 | too small — replace |

**Make:** wide (landscape), 1792 × 1024
**Folder:** `public/media/hero/`
**Names:** `hero-1.jpg`, `hero-3.jpg`, `hero-4.jpg`, `hero-5.jpg`, `hero-6.jpg`

### Prompt — slide 1, students outdoors

> A group of four Indian university students in smart casual clothes walking together across a
> sunlit campus courtyard, carrying notebooks and a laptop, talking and smiling naturally, modern
> college buildings softly out of focus behind them, late afternoon golden light.

### Prompt — slide 3, a lecture in progress

> A bright modern university lecture room seen from the back, Indian students seated at desks
> facing forward, a lecturer standing near a whiteboard gesturing while explaining, large windows
> along one wall letting in daylight, calm and focused atmosphere.

### Prompt — slide 4, a computer laboratory

> A tidy university computer laboratory with rows of desktop machines, several Indian students
> working at screens, one leaning across to help another, large windows and pale walls, clean and
> well-lit, quiet concentration.

### Prompt — slide 5, the library

> A university library reading room with tall shelves of books, Indian students reading at long
> wooden tables, warm daylight from high windows falling across the tables, calm and studious.

### Prompt — slide 6, an engineering workshop

> An engineering workshop at a university with machinery and workbenches, Indian students in
> safety glasses working on a mechanical assembly under supervision, industrial but clean and
> well-organised, bright practical lighting.

---

# SECTION 2 — Home page, the picture next to "Welcome"

The photograph beside the paragraph introducing the institute.

**The file currently there is a G20 India graphic, not a photograph of the college at all.** It
looks out of place.

**Make:** slightly wide, 1792 × 1024
**Folder:** `public/media/home/`
**Name:** `about-college.jpg`

> The entrance of a modern Indian university building on a clear day, clean architectural lines,
> steps leading up to glass doors, trimmed lawn and young trees in front, a few students walking
> in and out, bright natural daylight.

**Better still:** a real photograph of your actual entrance. This is exactly the slot where a
student expects to see the real place.

---

# SECTION 3 — Home page, the Director's photograph

The portrait beside "Director's Message".

**Currently 280 × 247 — the smallest and blurriest image on the whole site.**

**Do not generate this one.** Take a real photograph:

- Portrait shape (taller than wide), at least 1200 px on the short side
- Phone camera is fine — stand near a window, subject facing the light
- Plain wall behind, no clutter
- Head and shoulders, a little space above the head
- **Folder:** `public/media/home/` · **Name:** `director.jpg`

---

# SECTION 4 — Home page, the four "Discover more" cards

The four cards under "Beyond the classroom": Indian Knowledge System, Viksit Bharat @2047,
Placement, Library.

Cards 1 and 2 are acceptable. **Cards 3 and 4 are soft** and worth replacing.

**Make:** wide, 1792 × 1024
**Folder:** `public/media/home/`

### Card 3 — `discover-placement.jpg`

> A university placement interview in progress, a young Indian graduate in formal clothes sitting
> across a table from two interviewers in an office meeting room, handshake at the end of the
> interview, bright professional office lighting, encouraging atmosphere.

### Card 4 — `discover-library.jpg`

> Rows of tall library bookshelves filled with academic books, a reading desk with an open book
> and a lamp in the foreground, warm quiet light, no people.

---

# SECTION 5 — Home page, the three "Campus life" tiles

The three square-ish cards under "On campus": Placement at VIMST, Photo Gallery, Recognition &
Awards.

**The first tile is 202 × 112 — by far the worst image on the site.** The other two are fine.

**Make:** slightly wide, 1792 × 1024 (it is cropped to a 4:3 box, so keep the subject centred)
**Folder:** `public/media/home/`
**Name:** `campus-placement.jpg`

> A university campus recruitment day, Indian students in formal clothes queuing and talking
> beside company stalls in a bright hall, banners and tables without any readable writing, busy
> and optimistic atmosphere.

---

# SECTION 6 — The strip across the top of every inner page

The wide band behind the page title on About, Vision, every course page, and so on.

**These are already done.** I drew 32 of them — a structural truss for civil engineering, a
molecular lattice for chemical, orbital rings for science, and so on. They are sharp at every
size.

**Nothing needed here.** If you later want a photograph on a particular department page instead,
put a wide 2000 px image in `public/media/` and tell me which department — it is a one-line
change.

---

# SECTION 7 — Pictures inside the text pages

Six pages are currently text from top to bottom with no pictures at all. Each can take one wide
picture at the top and up to two smaller ones further down.

**Make:** top picture wide 1792 × 1024 · smaller pictures wide 1792 × 1024
**Folder:** `public/media/pages/`

### About — `about-top.jpg`, `about-1.jpg`, `about-2.jpg`

> Top: A wide view of a modern Indian university campus on a sunny day, low buildings around an
> open green quadrangle, pathways and trees, students walking between buildings.

> 1: Indian students sitting together on campus steps with books and a laptop, talking and
> laughing, relaxed between classes.

> 2: A bright university classroom with students at desks writing, a teacher walking between the
> rows, daylight from a window wall.

### Vision — `vision.jpg`

> A single Indian student standing at a large window looking out over a city skyline at dawn,
> seen from behind, thoughtful and hopeful, soft morning light.

### Mission — `mission.jpg`

> A small group of Indian students and a teacher gathered around a table working on a project
> together, hands pointing at a shared notebook, collaborative and focused.

### Career — `career-1.jpg`, `career-2.jpg`

> 1: A career counselling session, a young Indian student sitting with an advisor at a desk, both
> looking at a laptop, friendly and encouraging.

> 2: A professional skills workshop, Indian students seated in a semicircle listening to a
> speaker standing at a flip chart with no readable writing on it.

### Director's message — `director-lead.jpg`

> A calm university office interior with a desk, a bookshelf, a window with daylight, and an empty
> chair. No people.

*(An interior, not a face — the real portrait goes in Section 3.)*

### Quality policy — `quality-policy.jpg`

> A university science laboratory with glassware and instruments neatly arranged on a bench,
> a student in a lab coat carefully using a piece of equipment, clean and orderly, bright lighting.

---

# SECTION 8 — The photo gallery

29 photographs, all around 1280 × 960. **Acceptable quality — leave them.**

These are real photographs of real events at your college, which is worth more than anything
generated. Add new ones at 1400 px or wider into `public/media/gallery/`.

---

# SECTION 9 — Recruiter logos on the Placements page

79 company logos. **Do not generate these.** A made-up version of a real company's logo is a
trademark problem and an obviously wrong one at that.

Use the real logo from each company's own website, as a PNG with a transparent background.

---

# SECTION 10 — Video (optional)

Two places accept a video. Both are switched off until you add one.

1. **Top of the home page** — replaces the sliding pictures entirely.
2. **Further down the home page** — a wide band before "Campus life".

A phone video walking through the campus is genuinely better here than anything generated. One to
two minutes, held steady, good daylight.

Every video also needs a **poster** — the still picture shown before someone presses play. Take a
frame from the video itself, at least 1600 px wide.

**Folder:** `public/media/video/` · **Names:** `campus.mp4` and `campus-poster.jpg`
Keep the file **under 20 MB**.

---

# Priority, if you only do a few

1. **Director's portrait** (Section 3) — real photo, worst image on the site
2. **Campus life tile 1** (Section 5) — 202 px, embarrassing at full size
3. **Hero slide 1** (Section 1) — 468 px, and it is the first thing anyone sees
4. **Hero slides 3–6** (Section 1) — four blurred pictures in the most prominent place
5. **The "Welcome" picture** (Section 2) — currently a G20 graphic, wrong subject entirely
6. **About page** (Section 7) — the page most visitors read after the home page

---

# When the files are ready

Put them in the folders named above, then:

```bash
npm run content     # optimises, measures, builds blur placeholders
npm run dev         # look at it
```

Then send them to me, or tell me they are in place, and I will wire each one to its slot and
check the crops on a phone — several of these get cropped to a square or a 4:3 box, and a subject
sitting too close to an edge will lose its head.

# Asset slots

The site renders **complete**. Texture/atmosphere slots and category tiles are
now filled with procedurally-generated, in-repo assets. Category tiles and the
hero also accept real photos as a drop-in upgrade (see swap points below).

## `/public/assets/` — atmosphere & texture (generated)

Generated deterministically by `scripts/gen-textures.py` (Pillow + numpy).
Re-run `python scripts/gen-textures.py` to reproduce identical files.

| File                  | Used in                         | Status   |
| --------------------- | ------------------------------- | -------- |
| `hero-texture.jpg`    | Hero background                 | ✅ filled |
| `tex-thread.jpg`      | Numbers band accent (low-op)    | ✅ filled |
| `tex-ink.jpg`         | Methods band background (low-op)| ✅ filled |
| `studio-backdrop.jpg` | Selected Work empty-state slots | ✅ filled |
| `paper-grain.png`     | Global grain overlay (`--grain-url` in `globals.css`) | ✅ filled |

`hero-texture.mp4` (optional looping video) is still supported: drop it in and
the hero uses it over the still automatically.

## `/public/assets/categories/` — category tile illustrations

Eight bespoke SVG line illustrations (one per category, shared visual system,
`viewBox 0 0 480 360`). These are the default tile art.

## Swap point for REAL product photos

Per category in `lib/data/categories.ts`, the single `image` field defaults to
`/assets/categories/{slug}.svg`. To use a real photo, change that one value to a
photo path (e.g. `/products/futbolki.jpg`) and drop the file in `/public`. The
tile auto-switches from the illustration to a full-bleed photo treatment. Real,
web-optimized product photos are the recommended final asset and will materially
upgrade the tiles. (Image optimization is disabled — `images.unoptimized` in
`next.config.mjs` — so pre-size photos for web, ~1600px on the long edge.)

## Owner photo uploads — where each file goes

Image optimization is **off** (`images.unoptimized` in `next.config.mjs`), so
pre-size every photo for web: **~1600px on the long edge**, JPEG. Each section
renders cleanly with a placeholder until the matching file exists, then
auto-switches to the real photo on the next build — no code change needed.

### `/public/cases/{slug}.jpg` — portfolio photos (the centerpiece)

`slug` matches `lib/data/cases.ts`. Until a file lands, the card shows the bone
studio backdrop with the client + deliverable. Expected filenames:

| File                        | Case (client — deliverable)        |
| --------------------------- | ---------------------------------- |
| `/public/cases/uzum.jpg`      | Uzum — Корпоративные футболки     |
| `/public/cases/artel.jpg`     | Artel — Худи для команды          |
| `/public/cases/kfc.jpg`       | KFC — Форма для персонала         |
| `/public/cases/coca-cola.jpg` | Coca-Cola — Промо-мерч к запуску  |
| `/public/cases/tbc-bank.jpg`  | TBC Bank — Мерч для сотрудников   |
| `/public/cases/korzinka.jpg`  | Korzinka — Шопперы и текстиль     |
| `/public/cases/evos.jpg`      | EVOS — Кепки и фартуки            |
| `/public/cases/humans.jpg`    | Humans — Мерч-линейка бренда      |

> The case titles/descriptions in `cases.ts` are **starter content** — confirm
> the real deliverable + story per client before publishing (see the `{{CONFIRM}}`
> note at the top of that file).

### `/public/products/{slug}.jpg` — category tile photos (optional upgrade)

`slug` matches `lib/data/categories.ts`. Tiles default to the bespoke SVG
illustrations; set a category's `image` to `/products/{slug}.jpg` to switch a
tile to a full-bleed photo. Slugs: `futbolki`, `tolstovki`, `rubashki`, `kepki`,
`shoppery`, `kanctovary`, `flagi`, `podushki`.

### `/public/materials/…` and `/public/team/…` — reserved (optional)

Reserved for future material close-ups and team/workshop photos. Not required
for the current Materials section (it renders from swatches + text in
`lib/data/materials.ts`).

## `/public/logos/` — client wordmarks

35 normalized typographic placeholders (consistent 280×96 viewBox). Replace any
with the real brand logo using the same filename + viewBox. Regenerate with
`node scripts/gen-logos.mjs`. (Already wired; do not touch the marquee.)

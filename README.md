# Folk Print — Per-Part T-Shirt Designer

A browser-based custom-clothing designer. Customers design each **garment piece**
(Front, Back, Left sleeve, Right sleeve) on its own clean rectangular tile; the app
**warps every tile onto the matching part of a 3D shirt** (triangle-accurate UV
mapping) and previews it live. Fully client-side — no backend.

Available two ways: a normal Vite single-page app, and a **detachable
`<folk-designer>` web component** you can drop onto any page.

## Run it (SPA)

```bash
cd folk-print
npm install
npm run dev      # open the printed local URL (default http://localhost:5173)
npm run build    # static SPA → dist/
```

## Build the web component

```bash
npm run build:wc            # → dist-wc/folk-designer.js  (single self-contained file)
```

Then drop it on any page (everything — React, three.js, Fabric, CSS — is bundled
and isolated in a shadow root):

```html
<script type="module" src="folk-designer.js"></script>
<folk-designer lang="en" model="/models/tshirt.glb"></folk-designer>
```

- `lang` — `en` | `uz` | `ru` (optional; auto-detects from the browser / saved
  choice when omitted).
- `model` — URL of a UV-mapped `.glb` (optional; falls back to the bundled config).

`wc-demo.html` is a ready-made embed example (serve it next to `dist-wc/` and the
model). The component is self-contained and runs entirely on the client.

## What it does

- **One roamable design board** — a single canvas laying out all four garment
  zones (Front / Back / Left sleeve / Right sleeve) as clean rectangles, each
  showing its piece silhouette. A **navigator** (All / Front / Back / sleeves)
  zooms into a zone to focus, or "All" to roam the whole layout.
- **Upload & arrange** — PNG/JPG/WEBP/GIF/SVG; drag prints anywhere across the
  board, move / scale / rotate / layer / opacity. A print belongs to whichever
  zone it sits over.
- **Triangle-accurate mapping** — each zone's rectangle is warped onto the real
  garment UV islands, so a Front print appears on the chest, a Back print on the
  back, sleeve prints on the sleeves.
- **Shirt colour** — swatches + custom picker (the fabric colour shows wherever a
  tile is empty).
- **Live 3D** — the shirt sits side by side with the tiles and updates in real
  time; orbit and zoom. Only the *changed* piece is re-warped each frame.
- **Languages** — full UI in **English / Oʻzbekcha / Русский** with a switcher.
- **Export** — `Artwork (PNG)` = the composited garment texture; `3D snapshot`
  (PNG); `Export spec (JSON)` = per-piece placements + shirt colour.

## How it's built

- **React + Vite + Fabric.js** for the per-part tile editors; **Three.js / R3F /
  drei** for the 3D preview (lazy-loaded into its own chunk).
- `src/lib/garment.js` — classifies the model's UV vertices into Front / Back /
  sleeve islands (union-find + 3D-centroid heuristic) and emits per-part triangle
  lists, bounding boxes and silhouettes.
- `src/lib/composite.js` — affine triangle warp: maps each tile triangle onto its
  UV triangle on a master texture canvas, over a flat shirt-colour base.
- `src/state/DesignerContext.jsx` — owns one Fabric canvas per part, a dirty-set of
  pieces to re-warp, and the export hooks.
- `src/components/Editor3D.jsx` — shirt mesh whose `material.map` is a
  `CanvasTexture` of the composited master texture (`flipY = false`); incremental
  recomposite in `useFrame`.
- `src/i18n/` — string tables (`strings.js`) + provider (`I18nContext.jsx`).
- `src/webcomponent.jsx` + `vite.wc.config.js` — the `<folk-designer>` custom
  element and its single-file build.
- `src/config/runtime.js` — runtime overrides (e.g. the `model` attribute) applied
  before mount without a rebuild.
- Model: `public/models/tshirt.glb` (CC0, UV-mapped).

## Swapping the model

Drop a UV-mapped `.glb` in `public/models/` and set `model3d.src` + `camera` in
`src/config/products.js` (SPA), or pass the `model` attribute (web component). The
part classifier expects a conventional unwrap (front +Z, back −Z, sleeves out to
the sides); very different unwraps may need the thresholds in `garment.js` tuned.

## Next steps

- Ordering / checkout is a future module (needs a backend + payment provider).
- The part classifier's thresholds are heuristic; a model with labelled UV groups
  could replace them for exactness.

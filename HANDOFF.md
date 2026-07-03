# Folk Print — Maket Builder · Handoff

Live, in-browser **3D t-shirt mockup designer** ("maket builder"). Customers drag
their prints onto a layout of the four garment pieces and see them warped onto a
live 3D shirt, then export / order. Fully client-side (no backend required to run).

---

## 1. Where everything is

| | Path / URL |
|---|---|
| Local source | `/Users/new/vzlomjopi/folk-print` |
| VPS (host alias) | `morfo` → `deploy@167.233.74.104` (key `~/.ssh/morfo_deploy`) |
| VPS code | `~/folk-print/maket-builder/` |
| **Live** | **http://167.233.74.104:8101** |
| Sibling on VPS (NOT this app) | `~/folk-print/folkprint/` = a separate Next.js marketing site on `:8100` (github.com/ulug707/folkprint) — leave untouched |

---

## 2. What it does

- **One roamable design board** — a single canvas with the 4 garment zones
  (Front / Back / Left sleeve / Right sleeve) as clean rectangles; a navigator
  (All / Front / Back / sleeves) zooms into a zone or "All" to roam.
- **Upload & arrange** — PNG/JPG/WEBP/GIF/SVG; drag / scale / rotate / layer /
  opacity. A print belongs to whichever zone it sits over.
- **Triangle-accurate mapping** — each zone is warped onto the real garment UV
  islands → front print on the chest, back on the back, sleeves on sleeves.
- **Shirt colour** — swatches + custom picker.
- **Live 3D** — orbit/zoom; updates as you edit (recomposite throttled + only the
  dragged zone re-warped, so 2D dragging stays smooth).
- **Languages** — **UZ + RU only** (English removed). UZ|RU toggle, defaults to UZ
  (RU if the browser is Russian). Persisted in `localStorage` (`folk-lang`).
- **Tools** — one consolidated "Layers" panel: show/hide, reorder, duplicate,
  delete, opacity, center. Header buttons are uniform size.
- **Exports** — Artwork PNG (composited texture), 3D snapshot PNG, Spec JSON
  (per-zone placements + colour).
- **Order button** — assembles the full mockup (spec + artwork PNG + 3D snapshot
  PNG + colour) and POSTs it to a configurable endpoint, or downloads the JSON if
  none is set. **Intended to feed a Telegram bot** (see §5).
- **Mobile** — board scales to fit; touch dragging works.
- **Detachable web component** — `<folk-designer lang model>` built to a single
  self-contained file via `npm run build:wc`.

---

## 3. Tech stack

- React 18 + Vite 5 (plain JS/JSX, no TypeScript)
- Fabric.js v6 — the 2D design board
- Three.js 0.169 + @react-three/fiber v8 + @react-three/drei v9 — the 3D preview
- i18n: custom provider (`src/i18n/`)
- 3D model: `public/models/tshirt.glb` (CC0, UV-mapped)

### Key files
```
src/state/DesignerContext.jsx   # app state: board, dirty-set, exports, order
src/components/DesignBoard.jsx   # the single Fabric canvas + navigator
src/components/Editor3D.jsx      # 3D shirt; composites zones → CanvasTexture
src/components/PrintsPanel.jsx   # consolidated layers/tools panel
src/components/ProductHeader.jsx # header: UZ/RU toggle, exports, Order button
src/lib/garment.js               # UV → 4 zones (union-find + centroid classify)
src/lib/board.js                 # board layout + navigator viewport + guide
src/lib/composite.js             # affine triangle warp (zone tile → UV texture)
src/lib/order.js                 # buildOrderPayload + submitOrder + downloadOrder
src/lib/export.js                # PNG / JSON exports
src/i18n/strings.js              # UZ + RU strings (UZ canonical)
src/config/runtime.js            # runtime overrides: modelUrl, orderEndpoint
src/config/products.js           # model, camera, texture size, default colour
src/webcomponent.jsx + vite.wc.config.js   # <folk-designer> build
Dockerfile, docker-compose.yml, nginx.conf, .dockerignore  # deploy
```

---

## 4. Run / build / deploy

### Local
```bash
cd folk-print
npm install
npm run dev        # http://localhost:5173
npm run build      # static SPA → dist/
npm run build:wc   # web component → dist-wc/folk-designer.js
```

### Deploy / redeploy to the VPS
```bash
# 1. push the code
rsync -az --exclude node_modules --exclude dist --exclude dist-wc --exclude .git \
  /Users/new/vzlomjopi/folk-print/ morfo:/home/deploy/folk-print/maket-builder/
# 2. rebuild + restart the container
ssh morfo 'cd ~/folk-print/maket-builder && docker compose up -d --build'
```
- Docker: multi-stage `Dockerfile` (node:22 `npm ci && npm run build` → nginx:alpine
  serving `dist/`, listens 8080). `docker-compose.yml` → container `maket-builder-web`,
  `restart: unless-stopped`, **port 8101:8080**. `nginx.conf` has SPA fallback.
- `ufw 8101/tcp` is open. Plain HTTP, IP-only.

---

## 5. Order → Telegram (next step, not built)

The Order button already builds the full payload. To actually send to a Telegram
bot, stand up a small backend/serverless endpoint that receives the JSON and calls
the Telegram Bot API (`sendPhoto` / `sendDocument`) — **keep the bot token on the
server, never in the browser**. Then set `orderEndpoint` in
`src/config/runtime.js`. With no endpoint set, the button downloads the order JSON
(so the flow is testable today).

Payload shape (`src/lib/order.js`): `{ product, model, shirtColor, board,
pieces{front,back,sleeveL,sleeveR}.prints[...], generatedAt, artworkPng, snapshotPng }`.

---

## 6. Open items / notes

- **Telegram relay backend** — not built (see §5).
- **HTTPS / subdomain** — currently plain HTTP on the IP. Could front it with the
  existing Caddy + `*.cassist.uz` wildcard (e.g. `maket.cassist.uz → :8101`).
- **B2B / B2C marketing site** — explored (inspired by pnhd.ru: audience toggle
  defaulting to B2B, price quiz, process, methods, cases, FAQ, with the 3D
  constructor as the hero differentiator). A mockup exists; **not implemented** —
  paused pending a decision on which codebase it lives in.
- **Permission rule** — `Bash(rsync:*)` and `Bash(ssh:*)` were added to
  `/Users/new/vzlomjopi/.claude/settings.local.json` to allow the VPS transfer;
  remove or tighten if desired.
- **Dead code** — these are orphaned/unused from earlier iterations and can be
  deleted: `src/components/DesignCanvas2D.jsx`, `DesignerStage.jsx`,
  `PreviewStage3D.jsx`, `src/lib/printArea.js`.
- The project folder `vzlomjopi/` is otherwise a PythonAnywhere staging area
  (account `snik7`) — unrelated to this app.

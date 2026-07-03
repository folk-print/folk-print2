# Folk Print site — remaining work

Rebuilt from the claude.ai/design export (3 screens: B2B, B2C, 3D Studio).
Lives in the folk-print app. Routes: `/` entrance · `/biznesu` B2B · `/lichnoe` B2C · `/studio` designer.

## Done
- Entrance / first screen (`src/site/Entrance.jsx`) — "Куда вам?" two-polaroid design (Entry export)
- B2B landing (`src/site/B2B.jsx`) — faithful, prices → «по запросу»
- B2C landing (`src/site/B2C.jsx`) — faithful, prices → «по запросу»
- Studio (`src/site/Studio.jsx`) — re-skinned to the new design; self-contained Three.js,
  all 4 garments procedural (tee/hoodie/polo/cap), multi-print, upload/samples, zone/method,
  drag-orbit + drag-place, "Получить КП" form modal; prices → «по запросу»
- Router (`src/Site.jsx`), fonts (Oswald/Manrope/Caveat), `<Slot>` placeholder
- Old Fabric/UV engine kept at `src/App.jsx` (still used by `<folk-designer>` web component)
- All backed up on VPS `~/folk-print/maket-builder/`; live container NOT rebuilt

## Needs the owner
- [ ] Photos (~30): Entry 2 (B2C + B2B polaroids), B2B 12, B2C 16 → wire each into a `<Slot src=…>`
- [ ] Real contacts: phone, Telegram, email, address, hours (replace design placeholders)
- [ ] Text tweaks: marketing copy is in verbatim; owner marks which lines to change
- [ ] Telegram bot token + chat id (so forms/КП/studio «отправить» actually send)
- [x] ~~Models for Худи/Поло/Кепка~~ — no longer needed; studio builds all 4 procedurally

## To build
- [ ] Wire owner's photos / contacts / text edits
- [ ] Forms → Telegram relay: set `orderEndpoint` in `src/config/runtime.js` + a tiny
      relay (POSTs JSON → Telegram bot). Studio order + landing forms POST the payload.
      NB: an orphaned `maket-builder-api` container exists on the VPS (old order API,
      not wired) — that's where the Telegram relay would live.
- [ ] Mobile polish + SEO/meta (title, favicon, og-image)
- [x] ~~Deploy live (rebuild the :8101 container)~~ — LIVE 2026-06-25 at
      http://167.233.74.104:8101 ; studio lazy-split (landing 314 KB / studio chunk 544 KB)

## Deploy / backup
```bash
rsync -az --exclude node_modules --exclude dist --exclude dist-wc --exclude .git \
  ./ morfo:/home/deploy/folk-print/maket-builder/        # store
ssh morfo 'cd ~/folk-print/maket-builder && docker compose up -d --build'   # go live
```

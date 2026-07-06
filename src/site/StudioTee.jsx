import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas, StaticCanvas, Point } from 'fabric'
import Logo from './Logo.jsx'
import { runtime } from '../config/runtime.js'
import { submitOrder as submitOrderLib, downloadOrder } from '../lib/order.js'
import { addFiles as addFilesLib, styleAsPrint, PRINT_HANDLE_STYLE } from '../lib/upload.js'
import { warpPrint, decodeMap, AMP } from './warpPrint.js'

// ── Direct-placement 2D mockup studio ──────────────────────────────────────────
// The garment photo IS the canvas. A Fabric surface sits on top (clipped to the
// printable silhouette) so an uploaded print is dragged / scaled / rotated straight
// on the shirt. The tee is tinted by MULTIPLY so real folds survive on any colour.
//
// FOUR independent views: front & back (body — the SLEEVES ARE MASKED OUT so no
// print can land on them), and a dedicated Left / Right sleeve, each its own mockup
// (isolated from the real tee photo by scripts/gen-sleeves.mjs) managed separately.

const SITE = 'https://folkprint.uz' // the real site — studio nav leaves to here (this app runs on the studio subdomain)
const TEE_AR = 1700 / 1944
const CW = 850, CH = 972 // Fabric internal resolution (matches tee aspect)

// The settled warp used to render at 1× (CW×CH) while the tee photo is 1700×1944,
// so prints softened on release. Render the warp at 2× to match the photo — the
// displacement maps are smooth, so up-sampling them is loss-free (see warpPrint.js).
const WARP_SCALE = 2
const SW = CW * WARP_SCALE, SH = CH * WARP_SCALE

// Per-view config. `photo` = the garment shown + tinted (its alpha is the tint mask).
// `printMask` = where prints may land (body views cut the sleeves out → prints clip
// at the armhole; sleeve views use the sleeve silhouette). `warp` = the displacement
// map (body only; sleeves are near-flat, so no warp). `drop`/`center` in canvas frac.
const VIEWS = {
  front:   { label: 'Перёд',        tab: 'Перёд',    short: 'перёд',       photo: '/mockups/tee-front.png',   printMask: '/mockups/tee-front.body.png', warp: '/mockups/tee-front.warp.png', drop: { x: 0.30, y: 0.30, w: 0.40, h: 0.40 }, center: { x: 0.50, y: 0.46 } },
  back:    { label: 'Спина',        tab: 'Спина',    short: 'спина',       photo: '/mockups/tee-back.png',    printMask: '/mockups/tee-back.body.png',  warp: '/mockups/tee-back.warp.png',  drop: { x: 0.28, y: 0.22, w: 0.44, h: 0.50 }, center: { x: 0.50, y: 0.42 } },
  lsleeve: { label: 'Левый рукав',  tab: 'Рукав Л',  short: 'левый рукав',  photo: '/mockups/tee-lsleeve.png', printMask: '/mockups/tee-lsleeve.png',    warp: '/mockups/tee-lsleeve.warp.png', drop: { x: 0.34, y: 0.30, w: 0.32, h: 0.38 }, center: { x: 0.50, y: 0.50 } },
  rsleeve: { label: 'Правый рукав', tab: 'Рукав П',  short: 'правый рукав', photo: '/mockups/tee-rsleeve.png', printMask: '/mockups/tee-rsleeve.png',    warp: '/mockups/tee-rsleeve.warp.png', drop: { x: 0.34, y: 0.30, w: 0.32, h: 0.38 }, center: { x: 0.50, y: 0.50 } },
}
const VIEW_ORDER = ['front', 'back', 'lsleeve', 'rsleeve']

// Bounding box of all visible prints (+ AMP margin) in warp-grid (SW×SH) coords, so
// the settle only remaps the printed area, not the whole 1700×1944 canvas.
function warpRegionOf(fab) {
  const objs = fab.getObjects().filter(o => o.isPrint && o.visible !== false)
  if (!objs.length) return { x0: 0, y0: 0, x1: 0, y1: 0 }
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
  for (const o of objs) {
    const r = o.getBoundingRect()
    if (r.left < x0) x0 = r.left
    if (r.top < y0) y0 = r.top
    if (r.left + r.width > x1) x1 = r.left + r.width
    if (r.top + r.height > y1) y1 = r.top + r.height
  }
  const m = AMP + 2  // a dest pixel can pull its source up to AMP px away (CW-space)
  return { x0: (x0 - m) * WARP_SCALE, y0: (y0 - m) * WARP_SCALE, x1: (x1 + m) * WARP_SCALE, y1: (y1 + m) * WARP_SCALE }
}

const COLORS = [
  { hex: '#efeae3', name: 'Молочный' }, { hex: '#ffffff', name: 'Белый' },
  { hex: '#15171c', name: 'Чёрный' }, { hex: '#3c3a3b', name: 'Графит' },
  { hex: '#2e5db0', name: 'Синий' }, { hex: '#2e7d57', name: 'Зелёный' },
  { hex: '#b5462f', name: 'Кирпичный' }, { hex: '#d9b44a', name: 'Горчичный' },
  { hex: '#c4623d', name: 'Терракот' }, { hex: '#6a2531', name: 'Бордовый' },
]
function ColorName(hex) { const c = COLORS.find(c => c.hex.toLowerCase() === (hex || '').toLowerCase()); return c ? c.name : 'Свой цвет' }

function css(s) {
  const o = {}
  if (!s) return o
  s.split(';').forEach(d => { const i = d.indexOf(':'); if (i < 0) return; const k = d.slice(0, i).trim(); const v = d.slice(i + 1).trim(); if (!k) return; o[k.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = v })
  return o
}

function getAudience() {
  try { const v = new URLSearchParams(window.location.search).get('for'); return v === 'b2b' || v === 'biz' || v === 'business' ? 'b2b' : 'b2c' } catch { return 'b2c' }
}

const SAVE_PROPS = ['isPrint', 'layerId', 'fileName']

function maskStyleUrl(url) {
  return {
    WebkitMaskImage: `url(${url})`, maskImage: `url(${url})`,
    WebkitMaskSize: '100% 100%', maskSize: '100% 100%',
    WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
  }
}

export default function StudioTee() {
  const [side, setSide] = useState('front')
  const [color, setColor] = useState('#efeae3')
  const [layers, setLayers] = useState([])
  const [selId, setSelId] = useState(null)
  const [open, setOpen] = useState(false)
  const [ordering, setOrdering] = useState(false)
  const [guideDismissed, setGuideDismissed] = useState(false)  // show the help guide once, then remove it for good after the first touch
  const [audience] = useState(getAudience)

  const canvasElRef = useRef(null)
  const holderRef = useRef(null)
  const fabRef = useRef(null)
  const sideDataRef = useRef({ front: null, back: null, lsleeve: null, rsleeve: null })
  const sideRef = useRef('front')
  const imgRef = useRef({})       // url -> HTMLImageElement (photos, masks, warp maps)
  const mapCacheRef = useRef({})  // decoded typed-array maps, keyed by warp-map url
  const warpCanvasRef = useRef(null)  // live "settled" warped-preview overlay
  const warpTimerRef = useRef(null)
  const fileRef = useRef(null)

  const loadImg = (url) => {
    if (!url) return null
    if (imgRef.current[url]) return imgRef.current[url]
    const im = new Image(); im.crossOrigin = 'anonymous'; im.src = url
    return (imgRef.current[url] = im)
  }

  // preload every view's garment photo, print-mask and warp map (for compositing)
  useEffect(() => {
    VIEW_ORDER.forEach(s => { const v = VIEWS[s]; loadImg(v.photo); loadImg(v.printMask); loadImg(v.warp) })
  }, [])

  // decode a view's warp map once (cached by url); null for sleeve views (no warp)
  const getMaps = (s) => {
    const url = VIEWS[s].warp; if (!url) return null
    if (mapCacheRef.current[url]) return mapCacheRef.current[url]
    const im = imgRef.current[url]
    if (!im || !im.complete || !im.naturalWidth) return null
    return (mapCacheRef.current[url] = decodeMap(im, WARP_SCALE))
  }

  // Bed a warped print into the cloth: multiply the garment's OWN shading (folds,
  // collar + side shadow) over the print — clipped to the print — so the shirt's
  // wrinkles visibly cross the artwork and the curve reads as depth, not a flat
  // decal. Mutates + returns the warped canvas. Skipped when the photo isn't ready.
  const bedShading = useCallback((warped, s) => {
    const tee = imgRef.current[VIEWS[s].photo]
    if (!tee || !tee.complete || !tee.naturalWidth) return warped
    const W = warped.width, H = warped.height
    const sc = document.createElement('canvas'); sc.width = W; sc.height = H
    const sg = sc.getContext('2d')
    sg.drawImage(tee, 0, 0, W, H)                                          // garment shading
    sg.globalCompositeOperation = 'destination-in'; sg.drawImage(warped, 0, 0)  // keep only where the print is
    const og = warped.getContext('2d')
    og.globalCompositeOperation = 'multiply'; og.globalAlpha = 0.45
    og.drawImage(sc, 0, 0)
    og.globalAlpha = 1; og.globalCompositeOperation = 'source-over'
    return warped
  }, [])

  // ── live warped preview ("settle on release") ────────────────────────────────
  // Editing is FLAT (crisp Fabric handles, instant, phone-friendly). On release /
  // deselect we render the SAME warp the order snapshot uses into an overlay and
  // hide the flat layer — so the studio shows exactly what the customer receives.
  // Sleeve views have no warp map, so they simply stay flat (crisp) throughout.
  const showFlat = useCallback(() => {
    if (warpTimerRef.current) { clearTimeout(warpTimerRef.current); warpTimerRef.current = null }
    const cv = warpCanvasRef.current, fab = fabRef.current
    if (cv) cv.style.opacity = '0'
    if (fab && fab.lowerCanvasEl) fab.lowerCanvasEl.style.opacity = '1'
  }, [])

  const renderWarpOverlay = useCallback(() => {
    const cv = warpCanvasRef.current, fab = fabRef.current
    if (!cv || !fab) return
    const ctx = cv.getContext('2d'); ctx.clearRect(0, 0, SW, SH)
    const maps = fab.getObjects().length ? getMaps(sideRef.current) : null
    if (!maps) { cv.style.opacity = '0'; if (fab.lowerCanvasEl) fab.lowerCanvasEl.style.opacity = '1'; return }  // no prints or no warp → stay flat
    const flat = fab.toCanvasElement(WARP_SCALE)   // render prints at 2× so the settled preview stays crisp
    const warped = bedShading(warpPrint(flat, maps, warpRegionOf(fab)), sideRef.current)  // remap the printed area + bed into folds
    ctx.drawImage(warped, 0, 0, SW, SH)
    cv.style.opacity = '1'
    if (fab.lowerCanvasEl) fab.lowerCanvasEl.style.opacity = '0'  // hide the flat print while the warped one shows
  }, [])

  const scheduleWarp = useCallback(() => {
    if (warpTimerRef.current) clearTimeout(warpTimerRef.current)
    warpTimerRef.current = setTimeout(() => { warpTimerRef.current = null; renderWarpOverlay() }, 90)
  }, [renderWarpOverlay])

  const syncLayers = useCallback(() => {
    const c = fabRef.current; if (!c) { setLayers([]); setSelId(null); return }
    const objs = c.getObjects().filter(o => o.isPrint)
    // guarantee a stable, unique id on every object before it reaches a React key
    // (loadFromJSON adds objects — firing this — before ids are re-applied)
    objs.forEach((o, i) => { if (!o.layerId) o.layerId = `print-${Date.now()}-${i}`; if (!o.fileName) o.fileName = 'Принт' })
    const act = c.getActiveObject()
    setLayers(objs.map(o => ({ id: o.layerId, name: o.fileName, visible: o.visible !== false, opacity: o.opacity })).reverse())
    setSelId(act && act.isPrint ? act.layerId : null)
  }, [])

  // clip the print surface to the current view's PRINTABLE region (body views cut
  // the sleeves out → a print can't be placed on the arms; sleeve views = the sleeve)
  const applyMask = useCallback((c, s) => {
    const el = c && c.lowerCanvasEl; if (!el) return
    const u = `url(${VIEWS[s].printMask})`
    el.style.webkitMaskImage = u; el.style.maskImage = u
    el.style.webkitMaskSize = '100% 100%'; el.style.maskSize = '100% 100%'
    el.style.webkitMaskRepeat = 'no-repeat'; el.style.maskRepeat = 'no-repeat'
  }, [])

  // init Fabric once
  useEffect(() => {
    const c = new Canvas(canvasElRef.current, { width: CW, height: CH, selection: true, preserveObjectStacking: true, backgroundColor: '' })
    fabRef.current = c
    const on = () => syncLayers()
    c.on('object:added', on); c.on('object:removed', on); c.on('object:modified', on)
    c.on('selection:created', on); c.on('selection:updated', on); c.on('selection:cleared', on)
    // live warp: flat while touching/editing, settle to warped on release/deselect.
    // Flatten only when the pointer lands ON a print — a click on empty space is a
    // deselect, whose selection:cleared must be allowed to schedule the warp.
    c.on('mouse:down', (opt) => { setGuideDismissed(true); if (opt && opt.target) showFlat() })
    c.on('object:moving', showFlat); c.on('object:scaling', showFlat); c.on('object:rotating', showFlat)
    c.on('selection:created', showFlat); c.on('selection:updated', showFlat)
    c.on('object:modified', scheduleWarp); c.on('selection:cleared', scheduleWarp); c.on('object:removed', scheduleWarp)
    applyMask(c, sideRef.current)
    syncLayers()
    return () => { try { c.dispose() } catch (e) {} if (fabRef.current === c) fabRef.current = null }
  }, [syncLayers, applyMask, showFlat, scheduleWarp])

  // ── two-finger pinch = scale + rotate the active print (touch only) ───────────
  // Fabric v6 ships no pinch gesture, and single-finger drag alone made resizing a
  // print on a phone fiddly (you had to hit a small corner handle). We intercept
  // 2-touch gestures in the CAPTURE phase — before Fabric's own touch handling —
  // so the whole print scales/rotates under the fingers. One finger still drags.
  useEffect(() => {
    const el = holderRef.current; if (!el) return
    let g = null
    const dist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY)
    const ang = (t) => Math.atan2(t[1].clientY - t[0].clientY, t[1].clientX - t[0].clientX) * 180 / Math.PI
    // Fabric may have begun a single-finger transform on the FIRST touch; kill it so
    // it can't fight the pinch or emit a competing object:modified at gesture end.
    const abortFabric = (c) => { if (c && c._currentTransform) c._currentTransform = null }
    // prefer the selected print, else the print under the pinch midpoint, else topmost
    const pickTarget = (c, t) => {
      const active = c.getActiveObject()
      if (active && active.isPrint) return active
      const prints = c.getObjects().filter(o => o.isPrint && o.visible !== false)
      if (!prints.length) return null
      const rect = el.getBoundingClientRect()
      const mx = (t[0].clientX + t[1].clientX) / 2, my = (t[0].clientY + t[1].clientY) / 2
      const pt = new Point((mx - rect.left) / rect.width * CW, (my - rect.top) / rect.height * CH)
      for (let i = prints.length - 1; i >= 0; i--) { if (prints[i].containsPoint(pt)) return prints[i] }
      return prints[prints.length - 1]
    }
    const onStart = (e) => {
      if (e.touches.length < 2) return
      const c = fabRef.current; if (!c) return
      const o = pickTarget(c, e.touches); if (!o) return
      abortFabric(c)
      c.setActiveObject(o); showFlat()
      g = { o, d0: dist(e.touches) || 1, a0: ang(e.touches), s0: o.scaleX, r0: o.angle || 0 }
      e.preventDefault(); e.stopPropagation()
    }
    const onMove = (e) => {
      if (!g) return
      e.preventDefault(); e.stopPropagation()   // own EVERY move until the gesture fully ends
      if (e.touches.length < 2) return           // a finger lifted mid-gesture — hold, don't drive
      const c = fabRef.current; if (!c) return
      const k = dist(e.touches) / g.d0
      const s = Math.max(0.04, Math.min(g.s0 * k, 8))
      const dr = ang(e.touches) - g.a0
      g.o.set({ scaleX: s, scaleY: s, angle: g.r0 + dr })
      g.o.setCoords(); c.requestRenderAll()
    }
    const onEnd = (e) => {
      if (!g) return
      if (e.touches.length >= 1) { e.preventDefault(); e.stopPropagation(); return }  // keep owning until ALL fingers lift
      const c = fabRef.current
      abortFabric(c)                              // let Fabric see this final touchend (resets its state) but with no stale transform
      g.o.setCoords(); g = null
      if (c) { syncLayers(); scheduleWarp() }
    }
    const opt = { passive: false, capture: true }
    el.addEventListener('touchstart', onStart, opt)
    el.addEventListener('touchmove', onMove, opt)
    el.addEventListener('touchend', onEnd, opt)
    el.addEventListener('touchcancel', onEnd, opt)
    return () => {
      el.removeEventListener('touchstart', onStart, opt)
      el.removeEventListener('touchmove', onMove, opt)
      el.removeEventListener('touchend', onEnd, opt)
      el.removeEventListener('touchcancel', onEnd, opt)
    }
  }, [showFlat, scheduleWarp, syncLayers])

  // load a view into the Fabric surface when `side` changes
  useEffect(() => {
    const c = fabRef.current; if (!c) return
    sideRef.current = side
    applyMask(c, side)
    showFlat()  // reset the overlay while the new view loads
    const data = sideDataRef.current[side]
    c.clear(); c.backgroundColor = ''
    if (data) {
      c.loadFromJSON(data).then(() => {
        c.getObjects().forEach((o, i) => {
          o.set(PRINT_HANDLE_STYLE); o.isPrint = true
          if (!o.layerId) o.layerId = `print-${Date.now()}-${i}`
          if (!o.fileName) o.fileName = 'Принт'
          o.setCoords()
        })
        c.requestRenderAll(); syncLayers(); scheduleWarp()
      })
    } else { c.requestRenderAll(); syncLayers(); scheduleWarp() }
  }, [side, applyMask, syncLayers, showFlat, scheduleWarp])

  const switchSide = useCallback((next) => {
    const c = fabRef.current; if (!c || next === sideRef.current) return
    sideDataRef.current[sideRef.current] = c.toObject(SAVE_PROPS)
    setSide(next)
  }, [])

  const findById = (id) => fabRef.current?.getObjects().find(o => o.layerId === id)

  const onFiles = useCallback(async (fileList) => {
    const c = fabRef.current; if (!c) return
    const d = VIEWS[sideRef.current].drop
    const rect = { x: d.x * CW, y: d.y * CH, w: d.w * CW, h: d.h * CH }
    await addFilesLib(c, Array.from(fileList), { rect })
    c.requestRenderAll(); syncLayers()
  }, [syncLayers])

  const selectLayer = (id) => { const o = findById(id), c = fabRef.current; if (o && c) { c.setActiveObject(o); c.requestRenderAll(); syncLayers() } }
  const deleteLayer = (id) => { const o = findById(id), c = fabRef.current; if (!o || !c) return; c.remove(o); c.discardActiveObject(); c.requestRenderAll(); syncLayers() }
  const duplicateLayer = async (id) => {
    const o = findById(id), c = fabRef.current; if (!o || !c) return
    const cl = await o.clone(); cl.set({ left: o.left + 22, top: o.top + 22, ...PRINT_HANDLE_STYLE }); cl.isPrint = true; cl.layerId = `print-${Date.now()}-copy`; cl.fileName = o.fileName
    c.add(cl); c.setActiveObject(cl); c.requestRenderAll(); syncLayers()
  }
  const centerLayer = (id) => { const o = findById(id), c = fabRef.current; if (!o || !c) return; const ce = VIEWS[sideRef.current].center; o.set({ left: ce.x * CW, top: ce.y * CH }); o.setCoords(); c.requestRenderAll(); syncLayers() }
  const reorder = (id, dir) => { const o = findById(id), c = fabRef.current; if (!o || !c) return; dir === 'up' ? c.bringObjectForward(o) : c.sendObjectBackwards(o); c.requestRenderAll(); syncLayers() }
  const toggleVisible = (id) => { const o = findById(id), c = fabRef.current; if (!o || !c) return; o.visible = o.visible === false; c.requestRenderAll(); syncLayers() }
  const setOpacity = (id, v) => { const o = findById(id), c = fabRef.current; if (!o || !c) return; o.set('opacity', v); c.requestRenderAll() }

  const countLayers = (s) => {
    if (s === sideRef.current) return fabRef.current ? fabRef.current.getObjects().filter(o => o.isPrint).length : 0
    const d = sideDataRef.current[s]; return d && d.objects ? d.objects.length : 0
  }

  // compose one view (tinted garment + prints, clipped to the printable region) → canvas
  const snapshotSide = useCallback(async (s) => {
    const v = VIEWS[s]
    const tee = imgRef.current[v.photo]; if (!tee || !tee.complete || !tee.naturalWidth) return null
    const mask = imgRef.current[v.printMask] || tee
    const off = document.createElement('canvas'); off.width = SW; off.height = SH
    const g = off.getContext('2d')
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'
    g.drawImage(tee, 0, 0, SW, SH)
    g.globalCompositeOperation = 'multiply'; g.fillStyle = color; g.fillRect(0, 0, SW, SH)
    g.globalCompositeOperation = 'destination-in'; g.drawImage(tee, 0, 0, SW, SH)
    g.globalCompositeOperation = 'source-over'
    let prints = null
    if (s === sideRef.current && fabRef.current) prints = fabRef.current.toCanvasElement(WARP_SCALE)
    else {
      const data = sideDataRef.current[s]
      if (data && data.objects && data.objects.length) {
        const tmp = new StaticCanvas(undefined, { width: CW, height: CH })
        await tmp.loadFromJSON(data); tmp.renderAll(); prints = tmp.toCanvasElement(WARP_SCALE); tmp.dispose()
      }
    }
    if (prints) {
      const maps = getMaps(s)
      let warped = maps ? warpPrint(prints, maps) : prints  // bend onto the surface; flat if the map isn't ready
      if (maps) warped = bedShading(warped, s)              // bed the print into the cloth's folds/curve
      const pc = document.createElement('canvas'); pc.width = SW; pc.height = SH
      const pg = pc.getContext('2d')
      pg.drawImage(warped, 0, 0, SW, SH)
      pg.globalCompositeOperation = 'destination-in'; pg.drawImage(mask, 0, 0, SW, SH)  // clip prints to the printable region (keeps body prints off the arms)
      g.drawImage(pc, 0, 0)
    }
    return off
  }, [color])

  const buildSheet = (cells) => {
    cells = cells.filter(c => c[1])
    if (!cells.length) return null
    const scale = 360 / CW, sw = Math.round(CW * scale), sh = Math.round(CH * scale)
    const pad = 40, gap = 26, top = 70
    const W = pad * 2 + cells.length * sw + (cells.length - 1) * gap
    const H = top + sh + 40 + pad
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H
    const g = cv.getContext('2d')
    g.fillStyle = '#F1EBDF'; g.fillRect(0, 0, W, H)
    g.fillStyle = '#15120D'; g.font = "700 26px Oswald, Arial, sans-serif"
    g.fillText(`Folk Print · Футболка · ${ColorName(color)}`, pad, 42)
    cells.forEach(([label, canv], i) => {
      const x = pad + i * (sw + gap)
      g.drawImage(canv, x, top, sw, sh)
      g.fillStyle = '#6F6655'; g.font = "600 16px Oswald, Arial, sans-serif"; g.fillText(label, x + 2, top + sh + 25)
    })
    return cv.toDataURL('image/jpeg', 0.9)
  }

  // Read every print on a view straight from its serialized Fabric JSON: exact
  // placement (centre %, size % of garment width, rotation) + the ORIGINAL logo
  // file (data URL in `src`). Positions are % of the garment image so production
  // can reproduce them regardless of render size.
  const collectPrints = (s) => {
    const data = sideDataRef.current[s]
    const objs = (data && Array.isArray(data.objects)) ? data.objects : []
    const label = VIEWS[s].label
    return objs.map((o, i) => ({
      side: label,
      name: o.fileName || `logo-${s}-${i + 1}.png`,
      cx: Math.round((o.left / CW) * 100),
      cy: Math.round((o.top / CH) * 100),
      wPct: Math.round(((o.width * (o.scaleX || 1)) / CW) * 100),
      rot: ((Math.round(o.angle || 0)) % 360 + 360) % 360,
      src: o.src || null,
    }))
  }

  const submitOrder = async (contact = {}) => {
    if (ordering) return false
    setOrdering(true)
    try {
      const c = fabRef.current; if (c) sideDataRef.current[sideRef.current] = c.toObject(SAVE_PROPS)
      const shots = {}
      for (const s of VIEW_ORDER) shots[s] = await snapshotSide(s)
      const snapshot = buildSheet(VIEW_ORDER.map(s => [VIEWS[s].label, shots[s]]))
      const prints = VIEW_ORDER.flatMap(s => collectPrints(s))
      const source = contact.audience === 'b2b' ? 'b2b' : 'b2c'
      const sidesSet = [...new Set(prints.map(p => p.side.toLowerCase()))]
      const sides = sidesSet.length ? sidesSet.join(', ') : '—'
      // exact placement, one line per logo
      const layout = prints.length
        ? prints.map((p, i) => `${i + 1}) ${p.side}: ${p.name} — центр ${p.cx}%/${p.cy}%, размер ${p.wPct}%, поворот ${p.rot}°`).join('\n')
        : '—'
      const fields = {
        'Имя': contact.name || '', 'Телефон': contact.phone || '', 'Тираж': contact.qty || '',
        'Изделие': 'Футболка', 'Цвет': ColorName(color), 'Принтов': String(prints.length),
        'Стороны': sides, 'Раскладка': layout,
        'Запрос': source === 'b2b' ? 'Рассчитать в Telegram' : 'КП по 2D-макету',
      }
      // the ORIGINAL logo files — each sent as a document with its exact placement
      // caption, so the shop has print-ready art + where it goes (cap 12).
      const attachments = prints.slice(0, 12).filter(p => p.src).map((p, i) => ({
        name: p.name,
        dataUrl: p.src,
        caption: `Логотип ${i + 1} · ${p.side} · позиция ${p.cx}%/${p.cy}% · размер ${p.wPct}% · поворот ${p.rot}° · файл: ${p.name}`,
      }))
      const payload = { source, fields, snapshot, attachments }
      if (runtime.orderEndpoint) await submitOrderLib(payload, runtime.orderEndpoint)
      else downloadOrder(payload)
      return true
    } catch (e) { console.error('order failed', e); return false } finally { setOrdering(false) }
  }

  const selLayer = layers.find(l => l.id === selId)
  const biz = audience === 'b2b'
  const totalPrints = layers.length
  const totalAll = VIEW_ORDER.reduce((n, s) => n + countLayers(s), 0)

  return (
    <>
      <style>{`
        .fp-studio{display:flex;flex-direction:column;height:100vh;height:100dvh;min-height:560px;overflow:hidden;background:#F5EFE5;color:#15120D;font-family:'Manrope',system-ui,sans-serif}
        .fp-studio ::-webkit-scrollbar{width:10px;height:10px}
        .fp-studio ::-webkit-scrollbar-thumb{background:#D8CDB8;border-radius:999px;border:3px solid transparent;background-clip:content-box}
        .fp-main{flex:1;display:flex;min-height:0}
        .fp-stage{flex:1 1 460px;min-width:300px;position:relative;min-height:340px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px}
        .fp-panel{flex:1 1 400px;max-width:460px;min-width:330px;display:flex;flex-direction:column;min-height:0;background:#fff;border-left:1px solid rgba(21,18,13,.10)}
        .fp-scroll{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:18px 22px 8px}
        .fp-viewtabs{display:flex;gap:6px;margin-bottom:20px}
        .fp-vtab{flex:1 1 0;min-width:0;display:inline-flex;align-items:center;justify-content:center;gap:5px;font-family:'Oswald',sans-serif;font-weight:600;font-size:12px;letter-spacing:.01em;padding:9px 4px;border-radius:11px;border:1px solid;cursor:pointer;white-space:nowrap;transition:background .12s,color .12s}
        .mock-wrap{position:relative;height:100%;max-height:100%;max-width:100%;aspect-ratio:${TEE_AR};filter:drop-shadow(0 16px 20px rgba(24,20,16,.18))}
        .mock-wrap .tee-base{position:absolute;inset:0;width:100%;height:100%;object-fit:fill;user-select:none;-webkit-user-drag:none}
        .mock-wrap .tee-tint{position:absolute;inset:0;mix-blend-mode:multiply;pointer-events:none}
        .fab-holder{position:absolute;inset:0;touch-action:none}
        .fab-holder .canvas-container{position:absolute!important;inset:0;width:100%!important;height:100%!important}
        .fab-holder canvas{width:100%!important;height:100%!important;touch-action:none}
        .mock-wrap .tee-warp{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:0;transition:opacity .13s ease}
        @media (max-width:900px){
          .fp-studio{height:auto;min-height:100vh;min-height:100dvh;overflow:visible}
          .fp-main{flex-direction:column}
          .fp-stage{flex:none;width:100%;height:56vh;min-height:340px}
          .fp-panel{flex:none;max-width:none;width:100%;border-left:0;border-top:1px solid rgba(21,18,13,.10)}
          .fp-scroll{overflow:visible}
        }
        @media (max-width:640px){
          .fp-header{gap:11px!important;padding:11px 14px!important}
          .hdr-sub{display:none}
          .hdr-nav{display:none!important}
          .fp-stage{height:52vh;padding:6px}
          .fp-scroll{padding:16px 16px 8px}
          .fp-vtab{font-size:11px;padding:9px 3px;gap:4px}
        }
      `}</style>

      <div className="fp-studio">
        <header className="fp-header" style={css('flex:none; display:flex; align-items:center; gap:18px; padding:12px 22px; border-bottom:1px solid rgba(21,18,13,.10); background:rgba(245,239,229,.9); backdrop-filter:blur(10px); z-index:6;')}>
          <a href={SITE} aria-label="Folk Print" style={css('display:inline-flex; align-items:center; text-decoration:none;')}><Logo variant="black" height={30} /></a>
          <span style={css('width:1px; height:24px; background:rgba(21,18,13,.14);')}></span>
          <div style={css('display:flex; flex-direction:column; line-height:1;')}>
            <span style={css("font-family:'Oswald'; font-weight:600; text-transform:uppercase; font-size:15px; letter-spacing:.02em;")}>Студия мокапов</span>
            <span className="hdr-sub" style={css('font-size:11.5px; color:#988E7B; margin-top:2px;')}>Реальная футболка · перёд, спина и рукава отдельно</span>
          </div>
          <div style={{ flex: 1 }}></div>
          <div className="hdr-nav" style={css('display:flex; gap:4px; background:#fff; border:1px solid #E7DECF; border-radius:999px; padding:4px;')}>
            <a href={`${SITE}/lichnoe`} style={css('color:#15120D; font-weight:700; font-size:12px; padding:7px 14px; border-radius:999px; letter-spacing:.04em; text-decoration:none;')}>ЛИЧНОЕ</a>
            <a href={SITE} style={css('color:#15120D; font-weight:700; font-size:12px; padding:7px 14px; border-radius:999px; letter-spacing:.04em; text-decoration:none;')}>БИЗНЕСУ</a>
          </div>
        </header>

        <div className="fp-main">
          <div className="fp-stage" style={css('background:radial-gradient(125% 95% at 50% 14%, #F1EEE7 0%, #E1DACB 60%, #D2C9B8 100%);')}>
            <div className="mock-wrap">
              <img className="tee-base" src={VIEWS[side].photo} alt={VIEWS[side].label} draggable={false} />
              <div className="tee-tint" style={{ background: color, ...maskStyleUrl(VIEWS[side].photo) }} />
              <div className="fab-holder" ref={holderRef}><canvas ref={canvasElRef} /></div>
              <canvas className="tee-warp" ref={warpCanvasRef} width={SW} height={SH} style={maskStyleUrl(VIEWS[side].printMask)} />
            </div>

            {!guideDismissed && (totalPrints === 0 ? (
              <div style={css('position:absolute; left:0; right:0; bottom:16px; text-align:center; pointer-events:none; color:#A79C88; font-size:12.5px; padding:0 16px;')}>
                {side === 'lsleeve' || side === 'rsleeve'
                  ? 'Рукав отдельно · загрузите принт → тяните пальцем, два пальца — размер и поворот'
                  : 'Загрузите принт → тяните пальцем · два пальца — размер и поворот · рукава на отдельных вкладках'}
              </div>
            ) : (
              <div style={css('position:absolute; left:50%; transform:translateX(-50%); bottom:14px; pointer-events:none; display:inline-flex; align-items:center; gap:7px; max-width:calc(100% - 24px); background:rgba(255,255,255,.82); backdrop-filter:blur(6px); border:1px solid rgba(21,18,13,.08); color:#5F6B52; font-size:12px; font-weight:600; padding:7px 13px; border-radius:999px; line-height:1.3;')}>
                <span style={css('font-size:13px; line-height:1;')}>🧵</span>
                <span>{side === 'lsleeve' || side === 'rsleeve'
                  ? 'На рукаве принт ложится ровно — отпустите, чтобы увидеть на ткани'
                  : 'Отпустите — принт изгибается по форме футболки (воротник, бока, складки), как при печати'}</span>
              </div>
            ))}
          </div>

          {/* panel */}
          <aside className="fp-panel">
            <div className="fp-scroll">
              {/* view switch: перёд · спина · левый / правый рукав (moved off the mockup) */}
              <div className="fp-viewtabs">
                {VIEW_ORDER.map(s => {
                  const on = side === s, n = countLayers(s)
                  return (
                    <button key={s} className="fp-vtab" onClick={() => switchSide(s)} style={{ background: on ? '#15120D' : '#fff', color: on ? '#FCAC45' : '#6F6655', borderColor: on ? '#15120D' : '#E7DECF' }}>
                      {VIEWS[s].tab}<span style={{ width: 6, height: 6, borderRadius: 999, flex: 'none', background: n ? '#FCAC45' : 'transparent', border: n ? 'none' : '1px solid #CFC5B2' }} />
                    </button>
                  )
                })}
              </div>

              {/* colour */}
              <div style={css('margin-bottom:22px;')}>
                <div style={css('display:flex; align-items:center; gap:8px; margin-bottom:11px;')}><span style={STEP}>1</span><span style={STEP_TITLE}>Цвет футболки</span></div>
                <div style={css('display:flex; flex-wrap:wrap; gap:10px; align-items:center;')}>
                  {COLORS.map(c => {
                    const active = (color || '').toLowerCase() === c.hex.toLowerCase()
                    return <button key={c.hex} title={c.name} onClick={() => setColor(c.hex)} style={css(`width:34px; height:34px; border-radius:999px; background:${c.hex}; cursor:pointer; padding:0; border:2px solid ${active ? '#FCAC45' : 'rgba(0,0,0,.14)'}; box-shadow:${active ? '0 0 0 3px #FCAC4544' : 'none'};`)} />
                  })}
                  <label title="Свой цвет" style={css('width:34px; height:34px; border-radius:999px; cursor:pointer; display:grid; place-items:center; border:1.5px dashed #C9BBA0; background:#FAF6EE; overflow:hidden; position:relative;')}>
                    <span style={css('font-size:16px; color:#C97A14; line-height:1;')}>+</span>
                    <input type="color" value={color || '#ffffff'} onChange={(e) => setColor(e.target.value)} style={css('position:absolute; inset:0; opacity:0; cursor:pointer;')} />
                  </label>
                </div>
              </div>

              {/* prints */}
              <div style={css('margin-bottom:18px;')}>
                <div style={css('display:flex; align-items:center; gap:8px; margin-bottom:11px;')}>
                  <span style={STEP}>2</span><span style={STEP_TITLE}>Принты · {VIEWS[side].short}</span>
                  <span style={css('margin-left:auto; font-size:12px; font-weight:700; color:#988E7B;')}>{layers.length} на этой вкладке</span>
                </div>

                <button onClick={() => fileRef.current && fileRef.current.click()} style={css("display:flex; align-items:center; justify-content:center; gap:8px; width:100%; background:#15120D; color:#F5EFE5; font-weight:700; font-size:14px; padding:12px; border:0; border-radius:11px; cursor:pointer; margin-bottom:12px;")}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 16V4M7 9l5-5 5 5M5 20h14" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  Загрузить принт · {VIEWS[side].short}
                </button>
                <input ref={fileRef} type="file" accept="image/*" multiple onChange={(e) => { if (e.target.files && e.target.files.length) onFiles(e.target.files); e.target.value = '' }} style={{ display: 'none' }} />

                {selLayer && (
                  <div style={css('background:#FFFDF8; border:1.5px solid #FCAC45; border-radius:14px; padding:11px; margin-bottom:12px; box-shadow:0 0 0 3px #FCAC4522;')}>
                    <div style={css('display:flex; align-items:center; gap:8px; margin-bottom:9px;')}>
                      <span style={css('width:8px; height:8px; border-radius:999px; background:#FCAC45; flex:none;')}></span>
                      <span style={css('font-weight:800; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;')}>{selLayer.name}</span>
                      <span style={css('margin-left:auto; font-size:10.5px; font-weight:700; color:#988E7B; text-transform:uppercase; letter-spacing:.04em; white-space:nowrap;')}>{VIEWS[side].short}</span>
                    </div>
                    <div style={css('display:flex; gap:6px; margin-bottom:10px;')}>
                      <PBtn onClick={() => centerLayer(selLayer.id)} glyph="◎" label="Центр" />
                      <PBtn onClick={() => duplicateLayer(selLayer.id)} glyph="⧉" label="Копия" />
                      <PBtn onClick={() => reorder(selLayer.id, 'up')} glyph="↑" label="Выше" />
                      <PBtn onClick={() => reorder(selLayer.id, 'down')} glyph="↓" label="Ниже" />
                      <PBtn onClick={() => deleteLayer(selLayer.id)} glyph="✕" label="Удалить" danger />
                    </div>
                    <div style={css('display:flex; align-items:center; gap:10px;')}>
                      <span style={css('font-size:12px; font-weight:700; color:#6F6655; flex:none;')}>Прозрачность</span>
                      <input type="range" min="0.1" max="1" step="0.05" defaultValue={selLayer.opacity} onChange={(e) => setOpacity(selLayer.id, parseFloat(e.target.value))} style={css('flex:1; height:28px; accent-color:#FCAC45;')} />
                    </div>
                  </div>
                )}

                {layers.length === 0 ? (
                  <div style={css('width:100%; padding:16px; border-radius:13px; border:1.5px dashed #C9BBA0; background:#FAF6EE; color:#6F6655; text-align:center; font-size:12.5px;')}>Загрузите логотип или картинку — она появится на «{VIEWS[side].short}». Тяните её пальцем, уголками меняйте размер и поворот. Рукава — на отдельных вкладках сверху.</div>
                ) : (
                  <div style={css('display:flex; flex-direction:column; gap:8px;')}>
                    {layers.map(l => {
                      const sel = l.id === selId
                      return (
                        <div key={l.id} onClick={() => selectLayer(l.id)} style={css(`display:flex; align-items:center; gap:10px; border:1.5px solid ${sel ? '#FCAC45' : '#E7DECF'}; background:${sel ? '#FFFDF8' : '#fff'}; border-radius:12px; padding:9px 10px; cursor:pointer; box-shadow:${sel ? '0 0 0 3px #FCAC4533' : 'none'};`)}>
                          <button title={l.visible ? 'Скрыть' : 'Показать'} onClick={(e) => { e.stopPropagation(); toggleVisible(l.id) }} style={css(`width:38px; height:38px; flex:none; border-radius:10px; border:1px solid #E2D9C8; background:${l.visible ? '#fff' : '#F3EEE3'}; color:${l.visible ? '#15120D' : '#BCB2A0'}; cursor:pointer; display:grid; place-items:center;`)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="2.6" /></svg>
                          </button>
                          <div style={css('flex:1; min-width:0;')}>
                            <div style={css('font-weight:700; font-size:13.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;')}>{l.name}</div>
                            <div style={css('font-size:11px; color:#988E7B;')}>{sel ? 'редактируется' : 'нажмите, чтобы выбрать'}</div>
                          </div>
                          <button title="Удалить" onClick={(e) => { e.stopPropagation(); deleteLayer(l.id) }} style={css('width:38px; height:38px; flex:none; border-radius:10px; border:1px solid #f0d8d3; background:#fff; color:#B23A2E; cursor:pointer; font-size:15px; display:grid; place-items:center;')}>✕</button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* footer / order */}
            <div style={css('flex:none; border-top:1px solid rgba(21,18,13,.10); padding:16px 22px; background:#FAF6EE;')}>
              <div style={css('display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:12px;')}>
                <div style={css('display:flex; flex-direction:column; gap:2px; min-width:0;')}>
                  <span style={css("font-family:'Oswald'; font-weight:600; text-transform:uppercase; font-size:13px; letter-spacing:.03em;")}>Футболка · {ColorName(color)}</span>
                  <span style={css('font-size:12px; color:#857B69;')}>{totalAll} принт(ов) · перёд {countLayers('front')} · спина {countLayers('back')} · рукава {countLayers('lsleeve')}/{countLayers('rsleeve')}</span>
                </div>
                <div style={css('text-align:right; flex:none;')}>
                  <span style={css('font-size:11px; color:#988E7B; display:block;')}>Цена</span>
                  <span style={css("font-family:'Oswald'; font-weight:700; font-size:16px; line-height:1; white-space:nowrap;")}>по запросу</span>
                </div>
              </div>
              <button onClick={() => setOpen(true)} style={css('display:flex; align-items:center; justify-content:center; gap:9px; width:100%; background:#FCAC45; color:#15120D; font-weight:700; font-size:16px; padding:15px; border:0; border-radius:13px; cursor:pointer;')}>
                {biz ? 'Рассчитать в Telegram' : 'Получить КП на этот макет'}
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          </aside>
        </div>

        <OrderModal open={open} onClose={() => setOpen(false)} audience={audience} color={color} counts={{ front: countLayers('front'), back: countLayers('back'), lsleeve: countLayers('lsleeve'), rsleeve: countLayers('rsleeve') }} submitOrder={submitOrder} ordering={ordering} />
      </div>
    </>
  )
}

const STEP = css("width:22px; height:22px; border-radius:999px; background:#15120D; color:#FCAC45; display:grid; place-items:center; font-family:'Oswald'; font-weight:600; font-size:12px; flex:none;")
const STEP_TITLE = css("font-family:'Oswald'; font-weight:600; text-transform:uppercase; font-size:14px; letter-spacing:.03em;")

function PBtn({ onClick, glyph, label, danger, active }) {
  const border = danger ? '#f0d8d3' : active ? '#FCAC45' : '#E7DECF'
  const bg = active ? '#FFF7EA' : '#fff'
  const color = danger ? '#B23A2E' : active ? '#C97A14' : '#15120D'
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick() }} style={css(`flex:1 1 0; min-width:52px; min-height:48px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px; border-radius:11px; border:1px solid ${border}; background:${bg}; color:${color}; font-weight:700; font-size:10.5px; cursor:pointer; line-height:1; box-shadow:${active ? '0 0 0 3px #FCAC4522' : 'none'};`)}>
      <span style={css('font-size:17px; line-height:1;')}>{glyph}</span>{label}
    </button>
  )
}

const inp = css('flex:1 1 130px; min-width:0; border:1px solid #E2D9C8; background:#fff; border-radius:11px; padding:13px 15px; font-size:15px; font-family:inherit; outline:none;')

function OrderModal({ open, onClose, audience, color, counts, submitOrder, ordering }) {
  const [sent, setSent] = useState(false)
  if (!open) return null
  const biz = audience === 'b2b'
  const submit = async (e) => { e.preventDefault(); const fd = new FormData(e.target); await submitOrder({ name: fd.get('name') || '', phone: fd.get('phone') || '', qty: fd.get('qty') || '', audience }); setSent(true) }
  const placement = `перёд ${counts.front} · спина ${counts.back} · рукава ${counts.lsleeve}/${counts.rsleeve}`
  return (
    <div onClick={onClose} style={css('position:fixed; inset:0; z-index:40; background:rgba(21,18,13,.5); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; padding:24px;')}>
      <div onClick={(e) => e.stopPropagation()} style={css('width:100%; max-width:460px; max-height:88vh; overflow-y:auto; background:#F5EFE5; border-radius:22px; box-shadow:0 30px 80px rgba(0,0,0,.4);')}>
        {!sent ? (
          <div style={css('padding:26px 26px 24px;')}>
            <div style={css('display:flex; align-items:center; justify-content:space-between; margin-bottom:18px;')}>
              <h3 style={css("font-family:'Oswald'; font-weight:700; text-transform:uppercase; font-size:24px; margin:0;")}>{biz ? 'Рассчитать заказ' : 'Ваш макет'}</h3>
              <button onClick={onClose} aria-label="Закрыть" style={css('width:36px; height:36px; border-radius:999px; border:1px solid rgba(21,18,13,.14); background:#fff; font-size:17px; cursor:pointer;')}>✕</button>
            </div>
            <div style={css('background:#fff; border:1px solid #E7DECF; border-radius:16px; padding:6px 18px; margin-bottom:14px;')}>
              <div style={css('display:flex; justify-content:space-between; padding:11px 0; border-bottom:1px solid #F0E8D9;')}><span style={css('color:#857B69; font-size:14px;')}>Изделие</span><span style={css('font-weight:700; font-size:14px;')}>Футболка</span></div>
              <div style={css('display:flex; justify-content:space-between; padding:11px 0; border-bottom:1px solid #F0E8D9;')}><span style={css('color:#857B69; font-size:14px;')}>Цвет</span><span style={css('font-weight:700; font-size:14px;')}>{ColorName(color)}</span></div>
              <div style={css('display:flex; justify-content:space-between; gap:12px; padding:11px 0;')}><span style={css('color:#857B69; font-size:14px; flex:none;')}>Принты</span><span style={css('font-weight:700; font-size:13px; text-align:right;')}>{placement}</span></div>
            </div>
            <form onSubmit={submit} style={css('display:flex; flex-direction:column; gap:11px;')}>
              <div style={css('display:flex; gap:10px; flex-wrap:wrap;')}>
                <input type="text" name="name" placeholder="Имя" required style={inp} />
                <input type="tel" name="phone" placeholder="Телефон" required style={inp} />
              </div>
              <input type="text" name="qty" placeholder="Тираж, шт (например, 50)" style={css('border:1px solid #E2D9C8; background:#fff; border-radius:11px; padding:13px 15px; font-size:15px; font-family:inherit; outline:none;')} />
              <button type="submit" disabled={ordering} style={css(`display:flex; align-items:center; justify-content:center; gap:8px; background:#15120D; color:#F5EFE5; font-weight:700; font-size:16px; padding:15px; border:0; border-radius:12px; cursor:pointer; margin-top:2px; opacity:${ordering ? '.6' : '1'};`)}>{ordering ? 'Отправляем…' : (biz ? 'Рассчитать в Telegram →' : 'Отправить заявку →')}</button>
              <p style={css('margin:2px 0 0; color:#A79C88; font-size:11.5px; line-height:1.4; text-align:center;')}>Макет (перёд, спина и рукава) уйдёт менеджеру в Telegram. Пришлём точную цену и сроки в течение рабочего дня.</p>
            </form>
          </div>
        ) : (
          <div style={css('padding:40px 30px; display:flex; flex-direction:column; align-items:center; text-align:center; gap:14px;')}>
            <span style={css('width:64px; height:64px; border-radius:999px; background:#FCAC45; color:#15120D; display:grid; place-items:center; font-size:30px;')}>✓</span>
            <h3 style={css("font-family:'Oswald'; font-weight:700; text-transform:uppercase; font-size:26px; margin:0;")}>Заявка отправлена!</h3>
            <p style={css('margin:0; color:#6F6655; font-size:15px; line-height:1.5; max-width:300px;')}>Макет ушёл менеджеру в Telegram: Футболка, {ColorName(color)}. Пришлём КП в короткое время.</p>
            <button onClick={onClose} style={css('margin-top:6px; background:#15120D; color:#F5EFE5; font-weight:700; font-size:15px; padding:13px 26px; border:0; border-radius:999px; cursor:pointer;')}>Готово</button>
          </div>
        )}
      </div>
    </div>
  )
}

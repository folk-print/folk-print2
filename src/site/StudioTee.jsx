import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas, StaticCanvas } from 'fabric'
import Logo from './Logo.jsx'
import { runtime } from '../config/runtime.js'
import { submitOrder as submitOrderLib, downloadOrder } from '../lib/order.js'
import { addFiles as addFilesLib, styleAsPrint, PRINT_HANDLE_STYLE } from '../lib/upload.js'
import { warpPrint, decodeMap } from './warpPrint.js'

// ── Direct-placement 2D mockup studio ──────────────────────────────────────────
// The garment photo IS the canvas. A Fabric surface sits on top (clipped to the
// tee silhouette) so an uploaded print is dragged / scaled / rotated straight on
// the shirt — front & back only, no abstract zones. The tee is tinted by MULTIPLY
// so real folds survive on any colour.

const SITE = 'https://folkprint.uz' // the real site — studio nav leaves to here (this app runs on the studio subdomain)
const TEE = { front: '/mockups/tee-front.png', back: '/mockups/tee-back.png' }
const TEE_AR = 1700 / 1944
const CW = 850, CH = 972 // Fabric internal resolution (matches tee aspect)

// where a freshly-uploaded print lands (fractions of the canvas) — user drags it anywhere after
const DROP = {
  front: { x: 0.30, y: 0.30, w: 0.40, h: 0.40 },
  back: { x: 0.28, y: 0.22, w: 0.44, h: 0.50 },
}
const CENTER = { front: { x: 0.50, y: 0.46 }, back: { x: 0.50, y: 0.42 } }

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

function maskStyle(side) {
  return {
    WebkitMaskImage: `url(${TEE[side]})`, maskImage: `url(${TEE[side]})`,
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
  const [audience] = useState(getAudience)

  const canvasElRef = useRef(null)
  const fabRef = useRef(null)
  const sideDataRef = useRef({ front: null, back: null })
  const sideRef = useRef('front')
  const teeImgRef = useRef({})
  const warpImgRef = useRef({})   // per-side displacement+shade map images
  const mapCacheRef = useRef({})  // decoded typed-array maps, keyed by side
  const warpCanvasRef = useRef(null)  // live "settled" warped-preview overlay
  const warpTimerRef = useRef(null)
  const fileRef = useRef(null)

  // preload garment images + warp maps (for the order snapshot compositing)
  useEffect(() => {
    ;['front', 'back'].forEach(s => {
      const im = new Image(); im.crossOrigin = 'anonymous'; im.src = TEE[s]; teeImgRef.current[s] = im
      const wm = new Image(); wm.crossOrigin = 'anonymous'; wm.src = `/mockups/tee-${s}.warp.png`; warpImgRef.current[s] = wm
    })
  }, [])

  // decode a side's warp map once (cached); null until the PNG has loaded
  const getMaps = (s) => {
    if (mapCacheRef.current[s]) return mapCacheRef.current[s]
    const im = warpImgRef.current[s]
    if (!im || !im.complete || !im.naturalWidth) return null
    return (mapCacheRef.current[s] = decodeMap(im))
  }

  // ── live warped preview ("settle on release") ────────────────────────────────
  // Editing is FLAT (crisp Fabric handles, instant, phone-friendly). On release /
  // deselect we render the SAME warp the order snapshot uses into an overlay and
  // hide the flat layer — so the studio shows exactly what the customer receives.
  const showFlat = useCallback(() => {
    if (warpTimerRef.current) { clearTimeout(warpTimerRef.current); warpTimerRef.current = null }
    const cv = warpCanvasRef.current, fab = fabRef.current
    if (cv) cv.style.opacity = '0'
    if (fab && fab.lowerCanvasEl) fab.lowerCanvasEl.style.opacity = '1'
  }, [])

  const renderWarpOverlay = useCallback(() => {
    const cv = warpCanvasRef.current, fab = fabRef.current
    if (!cv || !fab) return
    const ctx = cv.getContext('2d'); ctx.clearRect(0, 0, CW, CH)
    if (!fab.getObjects().length) { cv.style.opacity = '0'; if (fab.lowerCanvasEl) fab.lowerCanvasEl.style.opacity = '1'; return }
    const maps = getMaps(sideRef.current)
    const flat = fab.toCanvasElement(1)
    const warped = maps ? warpPrint(flat, maps) : flat
    ctx.drawImage(warped, 0, 0, CW, CH)
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

  const applyMask = useCallback((c, s) => {
    const el = c && c.lowerCanvasEl; if (!el) return
    const u = `url(${TEE[s]})`
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
    // Only flatten when the pointer lands ON a print — a click on empty space is a
    // deselect, whose selection:cleared must be allowed to schedule the warp.
    c.on('mouse:down', (opt) => { if (opt && opt.target) showFlat() })
    c.on('object:moving', showFlat); c.on('object:scaling', showFlat); c.on('object:rotating', showFlat)
    c.on('selection:created', showFlat); c.on('selection:updated', showFlat)
    c.on('object:modified', scheduleWarp); c.on('selection:cleared', scheduleWarp); c.on('object:removed', scheduleWarp)
    applyMask(c, sideRef.current)
    syncLayers()
    return () => { try { c.dispose() } catch (e) {} if (fabRef.current === c) fabRef.current = null }
  }, [syncLayers, applyMask, showFlat, scheduleWarp])

  // load a side into the Fabric surface when `side` changes
  useEffect(() => {
    const c = fabRef.current; if (!c) return
    sideRef.current = side
    applyMask(c, side)
    showFlat()  // reset the overlay while the new side loads
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
    const d = DROP[sideRef.current]
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
  const centerLayer = (id) => { const o = findById(id), c = fabRef.current; if (!o || !c) return; const ce = CENTER[sideRef.current]; o.set({ left: ce.x * CW, top: ce.y * CH }); o.setCoords(); c.requestRenderAll(); syncLayers() }
  const reorder = (id, dir) => { const o = findById(id), c = fabRef.current; if (!o || !c) return; dir === 'up' ? c.bringObjectForward(o) : c.sendObjectBackwards(o); c.requestRenderAll(); syncLayers() }
  const toggleVisible = (id) => { const o = findById(id), c = fabRef.current; if (!o || !c) return; o.visible = o.visible === false; c.requestRenderAll(); syncLayers() }
  const setOpacity = (id, v) => { const o = findById(id), c = fabRef.current; if (!o || !c) return; o.set('opacity', v); c.requestRenderAll() }

  const countLayers = (s) => {
    if (s === sideRef.current) return fabRef.current ? fabRef.current.getObjects().filter(o => o.isPrint).length : 0
    const d = sideDataRef.current[s]; return d && d.objects ? d.objects.length : 0
  }

  // compose one side (tinted tee + prints, clipped to the garment) → offscreen canvas
  const snapshotSide = useCallback(async (s) => {
    const tee = teeImgRef.current[s]; if (!tee || !tee.complete || !tee.naturalWidth) return null
    const off = document.createElement('canvas'); off.width = CW; off.height = CH
    const g = off.getContext('2d')
    g.drawImage(tee, 0, 0, CW, CH)
    g.globalCompositeOperation = 'multiply'; g.fillStyle = color; g.fillRect(0, 0, CW, CH)
    g.globalCompositeOperation = 'destination-in'; g.drawImage(tee, 0, 0, CW, CH)
    g.globalCompositeOperation = 'source-over'
    let prints = null
    if (s === sideRef.current && fabRef.current) prints = fabRef.current.toCanvasElement(1)
    else {
      const data = sideDataRef.current[s]
      if (data && data.objects && data.objects.length) {
        const tmp = new StaticCanvas(undefined, { width: CW, height: CH })
        await tmp.loadFromJSON(data); tmp.renderAll(); prints = tmp.toCanvasElement(1); tmp.dispose()
      }
    }
    if (prints) {
      const maps = getMaps(s)
      const warped = maps ? warpPrint(prints, maps) : prints  // bend onto the surface; flat if map not ready
      const pc = document.createElement('canvas'); pc.width = CW; pc.height = CH
      const pg = pc.getContext('2d')
      pg.drawImage(warped, 0, 0, CW, CH)
      pg.globalCompositeOperation = 'destination-in'; pg.drawImage(tee, 0, 0, CW, CH)
      g.drawImage(pc, 0, 0)
    }
    return off
  }, [color])

  const buildSheet = (front, back) => {
    const cells = [['Перёд', front], ['Спина', back]].filter(c => c[1])
    if (!cells.length) return null
    const scale = 520 / CW, sw = Math.round(CW * scale), sh = Math.round(CH * scale)
    const pad = 40, gap = 30, top = 70
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
      g.fillStyle = '#6F6655'; g.font = "600 17px Oswald, Arial, sans-serif"; g.fillText(label, x + 2, top + sh + 26)
    })
    return cv.toDataURL('image/jpeg', 0.9)
  }

  // Read every print on a side straight from its serialized Fabric JSON: exact
  // placement (centre %, size % of garment width, rotation) + the ORIGINAL logo
  // file (data URL in `src`). Positions are % of the garment image so production
  // can reproduce them regardless of render size.
  const collectPrints = (s) => {
    const data = sideDataRef.current[s]
    // the Fabric surface holds ONLY prints (the garment is a separate DOM image),
    // so every serialized object is a placed logo.
    const objs = (data && Array.isArray(data.objects)) ? data.objects : []
    const label = s === 'front' ? 'Перёд' : 'Спина'
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
      const f = await snapshotSide('front'); const b = await snapshotSide('back')
      const snapshot = buildSheet(f, b)
      const prints = [...collectPrints('front'), ...collectPrints('back')]
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

  return (
    <>
      <style>{`
        .fp-studio{display:flex;flex-direction:column;height:100vh;height:100dvh;min-height:560px;overflow:hidden;background:#F5EFE5;color:#15120D;font-family:'Manrope',system-ui,sans-serif}
        .fp-studio ::-webkit-scrollbar{width:10px;height:10px}
        .fp-studio ::-webkit-scrollbar-thumb{background:#D8CDB8;border-radius:999px;border:3px solid transparent;background-clip:content-box}
        .fp-main{flex:1;display:flex;min-height:0}
        .fp-stage{flex:1 1 460px;min-width:300px;position:relative;min-height:340px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:14px}
        .fp-panel{flex:1 1 400px;max-width:460px;min-width:330px;display:flex;flex-direction:column;min-height:0;background:#fff;border-left:1px solid rgba(21,18,13,.10)}
        .fp-scroll{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:22px 22px 8px}
        .mock-wrap{position:relative;height:100%;max-height:100%;max-width:100%;aspect-ratio:${TEE_AR};filter:drop-shadow(0 20px 22px rgba(24,20,16,.20))}
        .mock-wrap .tee-base{position:absolute;inset:0;width:100%;height:100%;object-fit:fill;user-select:none;-webkit-user-drag:none}
        .mock-wrap .tee-tint{position:absolute;inset:0;mix-blend-mode:multiply;pointer-events:none}
        .fab-holder{position:absolute;inset:0}
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
          .fp-stage{height:52vh;padding:8px}
          .fp-scroll{padding:18px 16px 8px}
        }
      `}</style>

      <div className="fp-studio">
        <header className="fp-header" style={css('flex:none; display:flex; align-items:center; gap:18px; padding:12px 22px; border-bottom:1px solid rgba(21,18,13,.10); background:rgba(245,239,229,.9); backdrop-filter:blur(10px); z-index:6;')}>
          <a href={SITE} aria-label="Folk Print" style={css('display:inline-flex; align-items:center; text-decoration:none;')}><Logo variant="black" height={30} /></a>
          <span style={css('width:1px; height:24px; background:rgba(21,18,13,.14);')}></span>
          <div style={css('display:flex; flex-direction:column; line-height:1;')}>
            <span style={css("font-family:'Oswald'; font-weight:600; text-transform:uppercase; font-size:15px; letter-spacing:.02em;")}>Студия мокапов</span>
            <span className="hdr-sub" style={css('font-size:11.5px; color:#988E7B; margin-top:2px;')}>Реальная футболка · тяните принт прямо по макету</span>
          </div>
          <div style={{ flex: 1 }}></div>
          <div className="hdr-nav" style={css('display:flex; gap:4px; background:#fff; border:1px solid #E7DECF; border-radius:999px; padding:4px;')}>
            <a href={`${SITE}/lichnoe`} style={css('color:#15120D; font-weight:700; font-size:12px; padding:7px 14px; border-radius:999px; letter-spacing:.04em; text-decoration:none;')}>ЛИЧНОЕ</a>
            <a href={SITE} style={css('color:#15120D; font-weight:700; font-size:12px; padding:7px 14px; border-radius:999px; letter-spacing:.04em; text-decoration:none;')}>БИЗНЕСУ</a>
          </div>
        </header>

        <div className="fp-main">
          <div className="fp-stage" style={css('background:radial-gradient(125% 95% at 50% 14%, #F1EEE7 0%, #E1DACB 60%, #D2C9B8 100%);')}>
            {/* front / back switch */}
            <div style={css('position:absolute; left:50%; transform:translateX(-50%); top:14px; z-index:5; display:flex; gap:3px; background:rgba(255,255,255,.92); backdrop-filter:blur(8px); border:1px solid #E7DECF; border-radius:999px; padding:3px; box-shadow:0 4px 14px rgba(21,18,13,.08);')}>
              {[['front', 'Перёд'], ['back', 'Спина']].map(([s, l]) => (
                <button key={s} onClick={() => switchSide(s)} style={css(`display:inline-flex; align-items:center; gap:7px; font-family:'Oswald'; font-weight:600; font-size:12.5px; letter-spacing:.04em; padding:7px 17px; border-radius:999px; cursor:pointer; border:0; background:${side === s ? '#15120D' : 'transparent'}; color:${side === s ? '#FCAC45' : '#6F6655'};`)}>
                  {l}<span style={{ width: 6, height: 6, borderRadius: 999, background: countLayers(s) ? '#FCAC45' : 'transparent', border: countLayers(s) ? 'none' : '1px solid #CFC5B2' }} />
                </button>
              ))}
            </div>

            <div className="mock-wrap">
              <img className="tee-base" src={TEE[side]} alt="Мокап футболки" draggable={false} />
              <div className="tee-tint" style={{ background: color, ...maskStyle(side) }} />
              <div className="fab-holder"><canvas ref={canvasElRef} /></div>
              <canvas className="tee-warp" ref={warpCanvasRef} width={CW} height={CH} style={maskStyle(side)} />
            </div>

            {totalPrints === 0 && (
              <div style={css('position:absolute; left:0; right:0; bottom:16px; text-align:center; pointer-events:none; color:#A79C88; font-size:12.5px;')}>
                Загрузите принт → тяните его пальцем, уголки — размер и поворот
              </div>
            )}
          </div>

          {/* panel */}
          <aside className="fp-panel">
            <div className="fp-scroll">
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
                  <span style={STEP}>2</span><span style={STEP_TITLE}>Принты · {side === 'front' ? 'перёд' : 'спина'}</span>
                  <span style={css('margin-left:auto; font-size:12px; font-weight:700; color:#988E7B;')}>{layers.length} на стороне</span>
                </div>

                <button onClick={() => fileRef.current && fileRef.current.click()} style={css("display:flex; align-items:center; justify-content:center; gap:8px; width:100%; background:#15120D; color:#F5EFE5; font-weight:700; font-size:14px; padding:12px; border:0; border-radius:11px; cursor:pointer; margin-bottom:12px;")}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 16V4M7 9l5-5 5 5M5 20h14" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  Загрузить принт
                </button>
                <input ref={fileRef} type="file" accept="image/*" multiple onChange={(e) => { if (e.target.files && e.target.files.length) onFiles(e.target.files); e.target.value = '' }} style={{ display: 'none' }} />

                {selLayer && (
                  <div style={css('background:#FFFDF8; border:1.5px solid #FCAC45; border-radius:14px; padding:11px; margin-bottom:12px; box-shadow:0 0 0 3px #FCAC4522;')}>
                    <div style={css('display:flex; align-items:center; gap:8px; margin-bottom:9px;')}>
                      <span style={css('width:8px; height:8px; border-radius:999px; background:#FCAC45; flex:none;')}></span>
                      <span style={css('font-weight:800; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;')}>{selLayer.name}</span>
                      <span style={css('margin-left:auto; font-size:10.5px; font-weight:700; color:#988E7B; text-transform:uppercase; letter-spacing:.04em;')}>выбран</span>
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
                  <div style={css('width:100%; padding:16px; border-radius:13px; border:1.5px dashed #C9BBA0; background:#FAF6EE; color:#6F6655; text-align:center; font-size:12.5px;')}>Загрузите логотип или картинку — она появится на футболке. Тяните её пальцем куда угодно, уголками меняйте размер и поворот.</div>
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
                  <span style={css('font-size:12px; color:#857B69;')}>{countLayers('front') + countLayers('back')} принт(ов): перёд {countLayers('front')} · спина {countLayers('back')}</span>
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

        <OrderModal open={open} onClose={() => setOpen(false)} audience={audience} color={color} front={countLayers('front')} back={countLayers('back')} submitOrder={submitOrder} ordering={ordering} />
      </div>
    </>
  )
}

const STEP = css("width:22px; height:22px; border-radius:999px; background:#15120D; color:#FCAC45; display:grid; place-items:center; font-family:'Oswald'; font-weight:600; font-size:12px; flex:none;")
const STEP_TITLE = css("font-family:'Oswald'; font-weight:600; text-transform:uppercase; font-size:14px; letter-spacing:.03em;")

function PBtn({ onClick, glyph, label, danger }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick() }} style={css(`flex:1 1 0; min-width:52px; min-height:48px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px; border-radius:11px; border:1px solid ${danger ? '#f0d8d3' : '#E7DECF'}; background:#fff; color:${danger ? '#B23A2E' : '#15120D'}; font-weight:700; font-size:10.5px; cursor:pointer; line-height:1;`)}>
      <span style={css('font-size:17px; line-height:1;')}>{glyph}</span>{label}
    </button>
  )
}

const inp = css('flex:1 1 130px; min-width:0; border:1px solid #E2D9C8; background:#fff; border-radius:11px; padding:13px 15px; font-size:15px; font-family:inherit; outline:none;')

function OrderModal({ open, onClose, audience, color, front, back, submitOrder, ordering }) {
  const [sent, setSent] = useState(false)
  if (!open) return null
  const biz = audience === 'b2b'
  const submit = async (e) => { e.preventDefault(); const fd = new FormData(e.target); await submitOrder({ name: fd.get('name') || '', phone: fd.get('phone') || '', qty: fd.get('qty') || '', audience }); setSent(true) }
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
              <div style={css('display:flex; justify-content:space-between; padding:11px 0;')}><span style={css('color:#857B69; font-size:14px;')}>Принтов</span><span style={css('font-weight:700; font-size:14px;')}>перёд {front} · спина {back}</span></div>
            </div>
            <form onSubmit={submit} style={css('display:flex; flex-direction:column; gap:11px;')}>
              <div style={css('display:flex; gap:10px; flex-wrap:wrap;')}>
                <input type="text" name="name" placeholder="Имя" required style={inp} />
                <input type="tel" name="phone" placeholder="Телефон" required style={inp} />
              </div>
              <input type="text" name="qty" placeholder="Тираж, шт (например, 50)" style={css('border:1px solid #E2D9C8; background:#fff; border-radius:11px; padding:13px 15px; font-size:15px; font-family:inherit; outline:none;')} />
              <button type="submit" disabled={ordering} style={css(`display:flex; align-items:center; justify-content:center; gap:8px; background:#15120D; color:#F5EFE5; font-weight:700; font-size:16px; padding:15px; border:0; border-radius:12px; cursor:pointer; margin-top:2px; opacity:${ordering ? '.6' : '1'};`)}>{ordering ? 'Отправляем…' : (biz ? 'Рассчитать в Telegram →' : 'Отправить заявку →')}</button>
              <p style={css('margin:2px 0 0; color:#A79C88; font-size:11.5px; line-height:1.4; text-align:center;')}>Макет (перёд и спина) уйдёт менеджеру в Telegram. Пришлём точную цену и сроки в течение рабочего дня.</p>
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

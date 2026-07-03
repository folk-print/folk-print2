import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { defaultProduct } from '../config/products.js'
import { runtime } from '../config/runtime.js'
import { PART_KEYS } from '../lib/garment.js'
import { buildBoardLayout, zoneAt } from '../lib/board.js'
import { addFiles as addFilesLib, PRINT_HANDLE_STYLE } from '../lib/upload.js'
import { exportArtworkPng, exportSnapshotPng, exportJson as exportJsonLib, buildSummary } from '../lib/export.js'
import { submitOrder as submitOrderLib, downloadOrder } from '../lib/order.js'
import { buildContactSheet, sidesCaption } from '../lib/contactSheet.js'

const DesignerCtx = createContext(null)
export const useDesigner = () => useContext(DesignerCtx)

export const BOARD_SIZE = 600

// Owns the single design board (one Fabric canvas holding all four garment
// zones), the active zone (navigator focus), the shirt colour, and exports.
// Editor3D supplies the geometry `parts`, reads the board + layout to warp each
// zone onto the shirt, and consumes the "dirty" set to recomposite on demand.
export function DesignerProvider({ children }) {
  const product = defaultProduct
  const DESIGN = product.design

  const [parts, setPartsState] = useState(null) // geometry parts-data (set by Editor3D)
  const [layout, setLayout] = useState(null) // board rects for each zone
  const [activeZone, setActiveZoneState] = useState('all')
  const [layers, setLayers] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [notice, setNotice] = useState(null) // { key, params } | null
  const [shirtColor, setShirtColorState] = useState(DESIGN.background)

  const boardRef = useRef(null) // the single Fabric canvas
  const layoutRef = useRef(null)
  const activeRef = useRef('all')
  const lastZoneRef = useRef(null) // zone a print was last dragged over
  const dirtyRef = useRef(new Set())
  const boardRevRef = useRef(0) // bumped on every content change → raster cache key
  const glRef = useRef(null)
  const captureRef = useRef(null) // Editor3D's "render every side" fn → { front, back, sleeveL, sleeveR }
  const masterRef = useRef(null) // composited UV texture canvas (from Editor3D)
  const invalidateRef = useRef(null) // r3f invalidate() → request one on-demand frame
  const flushRef = useRef(null) // force a synchronous full recomposite (for export)

  const kick = useCallback(() => { invalidateRef.current?.() }, [])
  const markAllDirty = useCallback(() => { for (const p of PART_KEYS) dirtyRef.current.add(p) }, [])
  const consumeDirty = useCallback(() => {
    if (!dirtyRef.current.size) return null
    const arr = [...dirtyRef.current]
    dirtyRef.current.clear()
    return arr
  }, [])
  // a content change: new raster revision, all zones recomposite, ask for a frame
  const touchBoard = useCallback(() => { boardRevRef.current++; markAllDirty(); kick() }, [markAllDirty, kick])
  // during a drag only the dragged print's zone (and the one it just left) change,
  // so re-warp just those — 4× less work per frame keeps dragging smooth
  const touchZoneOf = useCallback((o) => {
    const lay = layoutRef.current
    if (!o || !lay) { markAllDirty() } else {
      const c = o.getCenterPoint ? o.getCenterPoint() : { x: o.left, y: o.top }
      const zone = zoneAt(lay, c.x, c.y)
      dirtyRef.current.add(zone)
      if (lastZoneRef.current && lastZoneRef.current !== zone) dirtyRef.current.add(lastZoneRef.current)
      lastZoneRef.current = zone
    }
    boardRevRef.current++
    kick()
  }, [markAllDirty, kick])

  const setParts = useCallback((p) => {
    setPartsState(p)
    const lay = p ? buildBoardLayout(p, { size: BOARD_SIZE }) : null
    layoutRef.current = lay
    setLayout(lay)
    boardRevRef.current++
    markAllDirty()
    kick()
  }, [markAllDirty, kick])

  const refreshLayers = useCallback(() => {
    const cv = boardRef.current
    if (!cv) { setLayers([]); setSelectedId(null); return }
    const active = cv.getActiveObject()
    const prints = cv.getObjects().filter((o) => o.isPrint)
    const lay = layoutRef.current
    setLayers(
      prints
        .map((o) => {
          const c = o.getCenterPoint ? o.getCenterPoint() : { x: o.left, y: o.top }
          return {
            id: o.layerId,
            name: o.fileName,
            visible: o.visible !== false,
            opacity: o.opacity,
            selected: o === active,
            zone: lay ? zoneAt(lay, c.x, c.y) : 'front',
          }
        })
        .reverse(),
    )
    setSelectedId(active && active.isPrint ? active.layerId : null)
  }, [])

  const registerBoard = useCallback((cv) => {
    boardRef.current = cv
    cv.backgroundColor = '' // transparent → only prints composite (shirt colour is the master base)
    const onChange = () => { lastZoneRef.current = null; touchBoard(); refreshLayers() }
    const onTransform = (opt) => { touchZoneOf(opt?.target) } // live during drag/scale/rotate
    const onSel = () => { refreshLayers(); kick() }
    const handlers = {
      'object:added': onChange,
      'object:removed': onChange,
      'object:modified': onChange,
      'object:moving': onTransform,
      'object:scaling': onTransform,
      'object:rotating': onTransform,
      'selection:created': onSel,
      'selection:updated': onSel,
      'selection:cleared': onSel,
    }
    for (const ev in handlers) cv.on(ev, handlers[ev])
    cv.__folkHandlers = handlers
    touchBoard()
    refreshLayers()
  }, [touchBoard, touchZoneOf, refreshLayers, kick])

  const unregisterBoard = useCallback((cv) => {
    if (cv?.__folkHandlers) { for (const ev in cv.__folkHandlers) cv.off(ev, cv.__folkHandlers[ev]); delete cv.__folkHandlers }
    if (boardRef.current === cv) boardRef.current = null
  }, [])

  const setActiveZone = useCallback((zone) => {
    activeRef.current = zone
    setActiveZoneState(zone)
    kick()
  }, [kick])

  const board = () => boardRef.current
  const findById = (id) => board()?.getObjects().find((o) => o.layerId === id)

  // where new uploads land: the active zone's rect, or front when "all"
  const targetRect = useCallback(() => {
    const lay = layoutRef.current
    const z = activeRef.current === 'all' ? 'front' : activeRef.current
    return lay?.zones[z] || { x: BOARD_SIZE * 0.3, y: BOARD_SIZE * 0.3, w: BOARD_SIZE * 0.4, h: BOARD_SIZE * 0.4 }
  }, [])

  const addFiles = useCallback(
    async (fileList) => {
      const cv = board()
      if (!cv) return
      const { skipped } = await addFilesLib(cv, Array.from(fileList), { rect: targetRect() })
      if (boardRef.current !== cv) return // board was swapped mid-await
      touchBoard()
      refreshLayers()
      setNotice(skipped.length ? { key: 'skipped', params: { files: skipped.join(', ') } } : null)
    },
    [targetRect, touchBoard, refreshLayers],
  )

  const selectLayer = useCallback((id) => { const o = findById(id); const cv = board(); if (!o || !cv) return; cv.setActiveObject(o); cv.requestRenderAll(); refreshLayers(); kick() }, [refreshLayers, kick])
  const deleteLayer = useCallback((id) => { const o = findById(id); const cv = board(); if (!o || !cv) return; cv.remove(o); cv.discardActiveObject(); cv.requestRenderAll(); touchBoard(); refreshLayers() }, [touchBoard, refreshLayers])
  const duplicateLayer = useCallback(async (id) => {
    const o = findById(id); const cv = board(); if (!o || !cv) return
    const c = await o.clone()
    if (boardRef.current !== cv) return // board swapped mid-clone
    c.set({ left: o.left + 18, top: o.top + 18, ...PRINT_HANDLE_STYLE }); c.isPrint = true; c.layerId = `print-${Date.now()}-copy`; c.fileName = o.fileName
    cv.add(c); cv.setActiveObject(c); cv.requestRenderAll(); touchBoard(); refreshLayers()
  }, [touchBoard, refreshLayers])
  const reorder = useCallback((id, dir) => { const o = findById(id); const cv = board(); if (!o || !cv) return; if (dir === 'up') cv.bringObjectForward(o); else cv.sendObjectBackwards(o); cv.requestRenderAll(); touchBoard(); refreshLayers() }, [touchBoard, refreshLayers])
  const toggleVisible = useCallback((id) => { const o = findById(id); const cv = board(); if (!o || !cv) return; o.visible = o.visible === false; cv.requestRenderAll(); touchBoard(); refreshLayers() }, [touchBoard, refreshLayers])
  const setOpacity = useCallback((id, v) => { const o = findById(id); const cv = board(); if (!o || !cv) return; o.set('opacity', v); cv.requestRenderAll(); touchBoard() }, [touchBoard])
  const centerSelected = useCallback((id) => { const o = findById(id); const cv = board(); if (!o || !cv) return; const r = targetRect(); o.set({ left: r.x + r.w / 2, top: r.y + r.h / 2 }); o.setCoords(); cv.requestRenderAll(); touchBoard() }, [targetRect, touchBoard])

  const setShirtColor = useCallback((hex) => { setShirtColorState(hex); markAllDirty(); kick() }, [markAllDirty, kick])

  const registerGL = useCallback((gl) => { glRef.current = gl }, [])
  const registerCaptureSides = useCallback((fn) => { captureRef.current = fn }, [])
  const registerMaster = useCallback((canvas) => { masterRef.current = canvas }, [])
  const registerInvalidate = useCallback((fn) => { invalidateRef.current = fn }, [])
  const registerFlush = useCallback((fn) => { flushRef.current = fn }, [])

  const exportArtwork = useCallback(() => { flushRef.current?.(); if (masterRef.current) exportArtworkPng(masterRef.current) }, [])
  const exportSnapshot = useCallback(() => exportSnapshotPng(glRef.current), [])
  const exportJson = useCallback(() => exportJsonLib(boardRef.current, layoutRef.current, { product, shirtColor }), [product, shirtColor])

  // Order: assemble the full mockup (spec + artwork PNG + 3D snapshot PNG) and POST
  // it to the configured endpoint (a backend that relays to the Telegram bot); when
  // no endpoint is set yet, download it so the flow is testable today.
  const [ordering, setOrdering] = useState(false)
  // КП (b2c) / "Рассчитать в Telegram" (b2b): post the contact + design summary +
  // a 3D-mockup snapshot to the leadbot, which relays it to the Telegram group.
  const submitOrder = useCallback(async (contact = {}) => {
    if (ordering) return
    setOrdering(true)
    try {
      flushRef.current?.() // synchronous full recomposite so the texture is current before we capture

      // Which logos sit on which side (front / back / sleeves), from the board.
      const summary = buildSummary(boardRef.current, layoutRef.current, { product, shirtColor })

      // "All sides in one file": render the garment from every side and composite
      // the four views into one labelled contact sheet. Falls back to the current
      // on-screen angle if multi-side capture is unavailable.
      let snapshot = null
      try {
        const views = captureRef.current ? captureRef.current() : null
        if (views) {
          snapshot = await buildContactSheet({
            views,
            summary,
            title: `Folk Print · ${contact.productLabel || 'Футболка'}`,
            subtitle: `Цвет: ${contact.colorName || shirtColor}`,
          })
        }
      } catch (err) {
        console.warn('multi-side snapshot failed, falling back to single angle', err)
      }
      if (!snapshot) {
        snapshot = glRef.current?.domElement ? glRef.current.domElement.toDataURL('image/png') : null
      }

      const prints = boardRef.current ? boardRef.current.getObjects().filter((o) => o.isPrint).length : layers.length
      const source = contact.audience === 'b2b' ? 'b2b' : 'b2c'
      const fields = {
        'Имя': contact.name || '',
        'Телефон': contact.phone || '',
        'Тираж': contact.qty || '',
        'Изделие': contact.productLabel || 'Футболка',
        'Цвет': contact.colorName || shirtColor,
        'Принтов': String(prints),
        'Стороны': sidesCaption(summary),
        'Запрос': source === 'b2b' ? 'Рассчитать в Telegram' : 'КП по 3D-макету',
      }
      const payload = { source, fields, snapshot }
      if (runtime.orderEndpoint) {
        await submitOrderLib(payload, runtime.orderEndpoint)
        setNotice({ key: 'order_sent' })
      } else {
        downloadOrder(payload)
        setNotice({ key: 'order_saved' })
      }
    } catch (err) {
      console.error('order failed', err)
      setNotice({ key: 'order_failed' })
    } finally {
      setOrdering(false)
    }
  }, [ordering, shirtColor, layers, product])

  const value = useMemo(() => ({
    product, design: DESIGN, parts, setParts, layout, boardRef, boardSize: BOARD_SIZE,
    activeZone, setActiveZone, registerBoard, unregisterBoard,
    markAllDirty, consumeDirty, dirtyRef, boardRevRef, layoutRef,
    layers, selectedId, notice, setNotice, shirtColor, setShirtColor,
    addFiles, selectLayer, deleteLayer, duplicateLayer, reorder, toggleVisible, setOpacity, centerSelected,
    registerGL, registerCaptureSides, registerMaster, registerInvalidate, registerFlush, exportArtwork, exportSnapshot, exportJson,
    ordering, submitOrder,
  }), [
    product, DESIGN, parts, setParts, layout, activeZone, setActiveZone, registerBoard, unregisterBoard,
    markAllDirty, consumeDirty, layers, selectedId, notice, shirtColor, setShirtColor, addFiles, selectLayer,
    deleteLayer, duplicateLayer, reorder, toggleVisible, setOpacity, centerSelected, registerGL, registerCaptureSides, registerMaster,
    registerInvalidate, registerFlush, exportArtwork, exportSnapshot, exportJson, ordering, submitOrder,
  ])

  return <DesignerCtx.Provider value={value}>{children}</DesignerCtx.Provider>
}

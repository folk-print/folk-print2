// Layout + navigator helpers for the single roamable design board: the four
// garment zones as rectangles on one canvas, zoomed into per zone.

import { PART_KEYS } from './garment.js'

// Pack the four zones into a `size`×`size` board as a 2×2 grid, each zone sized
// to its part's aspect and centred in its cell. Returns pixel rects in board
// coordinates (identity viewport shows the whole board).
export function buildBoardLayout(parts, { size = 600, gap = 26, pad = 22 } = {}) {
  const cols = 2, rows = 2
  const cellW = (size - pad * 2 - gap * (cols - 1)) / cols
  const cellH = (size - pad * 2 - gap * (rows - 1)) / rows
  const zones = {}
  PART_KEYS.forEach((key, i) => {
    const col = i % cols
    const row = (i / cols) | 0
    const cx = pad + col * (cellW + gap)
    const cy = pad + row * (cellH + gap)
    const part = parts?.[key]
    const aspect = part?.aspect && isFinite(part.aspect) && part.aspect > 0 ? part.aspect : 1
    let w = cellW, h = cellW / aspect
    if (h > cellH) { h = cellH; w = cellH * aspect }
    // Default: centre the bounding box in the cell. Better: centre the piece's
    // area centroid, so an irregular piece (e.g. a sleeve cap, heavy at its base)
    // sits visually balanced rather than hugging one edge. Clamp to the cell.
    let rx = cx + (cellW - w) / 2
    let ry = cy + (cellH - h) / 2
    if (part?.centroid && part.bbox) {
      const ncx = (part.centroid.x - part.bbox.x) / part.bbox.w
      const ncy = (part.centroid.y - part.bbox.y) / part.bbox.h
      rx = Math.max(cx, Math.min(cx + cellW - w, cx + cellW / 2 - ncx * w))
      ry = Math.max(cy, Math.min(cy + cellH - h, cy + cellH / 2 - ncy * h))
    }
    zones[key] = { x: rx, y: ry, w, h, cell: { x: cx, y: cy, w: cellW, h: cellH } }
  })
  return { width: size, height: size, zones }
}

// Fabric viewport transform [a,b,c,d,e,f] that frames `key` in a `display`-sized
// canvas. 'all' → fit the whole board (identity when display === board size).
export function zoneViewport(layout, key, display, focusPad = 34) {
  if (!layout) return [1, 0, 0, 1, 0, 0]
  if (key === 'all' || !layout.zones[key]) {
    const z = display / Math.max(layout.width, layout.height)
    return [z, 0, 0, z, (display - layout.width * z) / 2, (display - layout.height * z) / 2]
  }
  // Frame the piece rect (what actually warps), not the cell, so the focused view
  // matches what lands on the garment — no dead margin to drop a print into.
  const r = layout.zones[key]
  const z = (display - focusPad * 2) / Math.max(r.w, r.h)
  const e = focusPad - r.x * z + (display - focusPad * 2 - r.w * z) / 2
  const f = focusPad - r.y * z + (display - focusPad * 2 - r.h * z) / 2
  return [z, 0, 0, z, e, f]
}

// Which zone's rectangle contains board-space point (px, py)? Falls back to the
// nearest cell so a print dropped in a gap still belongs somewhere.
export function zoneAt(layout, px, py) {
  if (!layout) return 'front'
  let best = 'front', bestD = Infinity
  for (const key of PART_KEYS) {
    const c = layout.zones[key]?.cell
    if (!c) continue
    if (px >= c.x && px <= c.x + c.w && py >= c.y && py <= c.y + c.h) return key
    const dx = Math.max(c.x - px, 0, px - (c.x + c.w))
    const dy = Math.max(c.y - py, 0, py - (c.y + c.h))
    const d = dx * dx + dy * dy
    if (d < bestD) { bestD = d; best = key }
  }
  return best
}

function roundRectPath(ctx, x, y, w, h, r) {
  if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); return }
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

// Paint the static guide layer (zone cells + piece silhouettes + labels) behind
// the Fabric prints, transformed by the same viewport `vt` so it tracks the
// navigator zoom. Drawn on a separate canvas → never part of the shirt texture.
export function drawBoardGuide(ctx, layout, parts, vt, { labels = {}, active = 'all' } = {}) {
  if (!layout) return
  const W = layout.width, H = layout.height
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, W, H)
  ctx.save()
  ctx.setTransform(vt[0], vt[1], vt[2], vt[3], vt[4], vt[5])
  ctx.font = '600 13px ui-sans-serif, system-ui, -apple-system, sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  const overview = active === 'all'
  for (const key of PART_KEYS) {
    const z = layout.zones[key]
    if (!z) continue
    if (!overview && active !== key) continue // focused: only the active piece
    // cell box only delineates zones in the overview; when focused it would just
    // overflow the framed view, so skip it and show the bare silhouette.
    if (overview) {
      roundRectPath(ctx, z.cell.x, z.cell.y, z.cell.w, z.cell.h, 14)
      ctx.fillStyle = '#edeae5'
      ctx.fill()
      ctx.lineWidth = 1.5
      ctx.strokeStyle = 'rgba(43,42,51,0.08)'
      ctx.stroke()
    }
    const part = parts?.[key]
    if (part && !part.empty) {
      const { x, y, w, h } = part.bbox
      ctx.fillStyle = '#dcd6cd'
      for (const tr of part.tris) {
        const x0 = ((tr[0] - x) / w) * z.w + z.x, y0 = ((tr[1] - y) / h) * z.h + z.y
        const x1 = ((tr[2] - x) / w) * z.w + z.x, y1 = ((tr[3] - y) / h) * z.h + z.y
        const x2 = ((tr[4] - x) / w) * z.w + z.x, y2 = ((tr[5] - y) / h) * z.h + z.y
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.closePath(); ctx.fill()
      }
    }
    if (overview && labels[key]) {
      ctx.fillStyle = '#8b8578'
      ctx.fillText(labels[key], z.cell.x + 11, z.cell.y + 9)
    }
  }
  ctx.restore()
}

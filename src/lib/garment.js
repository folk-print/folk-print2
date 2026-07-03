// Groups a BufferGeometry into UV islands, classifies each as front / back /
// left- or right-sleeve by 3D centroid, and returns per-part triangle UVs +
// bbox + aspect + centroid. No three import.

const PART_KEYS = ['front', 'back', 'sleeveL', 'sleeveR']

export function buildPartsData(geometry) {
  const pos = geometry.attributes.position
  const uv = geometry.attributes.uv
  if (!uv || !pos) return null
  geometry.computeBoundingBox?.()
  const bb = geometry.boundingBox
  const minX = bb ? bb.min.x : -1, maxX = bb ? bb.max.x : 1
  const minZ = bb ? bb.min.z : -1, maxZ = bb ? bb.max.z : 1
  // Classify relative to the geometry's own centre, not the world origin, so an
  // off-centre GLB (re-export / runtime model) doesn't mislabel parts.
  const cx0 = (minX + maxX) / 2, cz0 = (minZ + maxZ) / 2
  const sleeveX = ((maxX - minX) / 2) * 0.35 || 1
  const index = geometry.index
  const triCount = index ? index.count / 3 : pos.count / 3

  // --- union-find → connected UV islands (the real pattern pieces) ---
  // Indexed geometry: union shared vertex *indices*. UV seams duplicate verts,
  // so islands fall straight out of mesh topology — robust, no quantization
  // collisions. Non-indexed fallback: union quantized UV positions.
  const parent = new Map()
  const ensure = (k) => { if (!parent.has(k)) parent.set(k, k) }
  const find = (k) => { let r = k; while (parent.get(r) !== r) r = parent.get(r); while (parent.get(k) !== r) { const n = parent.get(k); parent.set(k, r); k = n }; return r }
  const union = (x, y) => { ensure(x); ensure(y); const rx = find(x), ry = find(y); if (rx !== ry) parent.set(rx, ry) }
  const Q = 4096
  const uvKey = (vi) => Math.round(uv.getX(vi) * Q) * 1000000 + Math.round(uv.getY(vi) * Q)
  const keyFor = index ? (vi) => vi : uvKey
  const A = new Array(triCount), B = new Array(triCount), C = new Array(triCount), K = new Array(triCount)
  for (let t = 0; t < triCount; t++) {
    const a = index ? index.getX(t * 3) : t * 3
    const b = index ? index.getX(t * 3 + 1) : t * 3 + 1
    const c = index ? index.getX(t * 3 + 2) : t * 3 + 2
    A[t] = a; B[t] = b; C[t] = c
    const ka = keyFor(a), kb = keyFor(b), kc = keyFor(c)
    union(ka, kb); union(kb, kc); K[t] = ka
  }
  const islands = new Map()
  for (let t = 0; t < triCount; t++) {
    const root = find(K[t])
    let isl = islands.get(root)
    if (!isl) { isl = { cx: 0, cz: 0, count: 0, area: 0, tris: [] }; islands.set(root, isl) }
    const a = A[t], b = B[t], c = C[t]
    isl.cx += (pos.getX(a) + pos.getX(b) + pos.getX(c)) / 3
    isl.cz += (pos.getZ(a) + pos.getZ(b) + pos.getZ(c)) / 3
    isl.area += Math.abs((uv.getX(b) - uv.getX(a)) * (uv.getY(c) - uv.getY(a)) - (uv.getX(c) - uv.getX(a)) * (uv.getY(b) - uv.getY(a)))
    isl.count++
    isl.tris.push(t)
  }

  const parts = {}
  for (const k of PART_KEYS) parts[k] = { tris: [], empty: true, bbox: { x: 0, y: 0, w: 1, h: 1 }, aspect: 1 }
  const byLabel = { front: [], back: [], sleeveL: [], sleeveR: [] }

  for (const isl of islands.values()) {
    if (isl.count < 8) continue
    const avgCx = isl.cx / isl.count - cx0, avgCz = isl.cz / isl.count - cz0
    let label
    if (Math.abs(avgCx) > sleeveX) label = avgCx < 0 ? 'sleeveL' : 'sleeveR'
    else label = avgCz >= 0 ? 'front' : 'back'
    byLabel[label].push(isl)
  }

  // Keep only the DOMINANT island per part (by UV area, not triangle count — a
  // finely-tessellated binding strip can out-count the flat panel it merged with).
  // T-shirt UVs often carry small strips (a neck band reads as "back", a cuff as a
  // sleeve); dropping them lets each piece fill and centre its tile cleanly.
  for (const k of PART_KEYS) {
    const list = byLabel[k]
    if (!list.length) continue
    list.sort((a, b) => b.area - a.area || b.count - a.count)
    const main = list[0]
    if (list.length > 1) console.warn(`[garment] '${k}': used largest of ${list.length} islands, dropped ${list.length - 1} small strip(s)`)
    const arr = parts[k].tris
    for (const t of main.tris) {
      const a = A[t], b = B[t], c = C[t]
      arr.push([uv.getX(a), uv.getY(a), uv.getX(b), uv.getY(b), uv.getX(c), uv.getY(c)])
    }
  }

  for (const k of PART_KEYS) {
    const p = parts[k]
    if (!p.tris.length) continue
    let minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity
    let ax = 0, ay = 0, area = 0
    for (const tr of p.tris) {
      for (let i = 0; i < 6; i += 2) {
        minx = Math.min(minx, tr[i]); maxx = Math.max(maxx, tr[i])
        miny = Math.min(miny, tr[i + 1]); maxy = Math.max(maxy, tr[i + 1])
      }
      // area-weighted centroid (for visual centring of irregular pieces)
      const a2 = Math.abs((tr[2] - tr[0]) * (tr[5] - tr[1]) - (tr[4] - tr[0]) * (tr[3] - tr[1]))
      ax += a2 * (tr[0] + tr[2] + tr[4]) / 3
      ay += a2 * (tr[1] + tr[3] + tr[5]) / 3
      area += a2
    }
    p.empty = false
    p.bbox = { x: minx, y: miny, w: maxx - minx || 1e-6, h: maxy - miny || 1e-6 }
    p.aspect = p.bbox.w / p.bbox.h
    p.centroid = area ? { x: ax / area, y: ay / area } : { x: (minx + maxx) / 2, y: (miny + maxy) / 2 }
  }
  return parts
}

// Faint filled silhouette of a part (in tile-pixel space) for the tile editor —
// shows exactly the printable shape. Returns a PNG data URL.
export function partSilhouette(part, tileW, tileH, fill = 'rgba(43,42,51,0.06)', stroke = 'rgba(43,42,51,0.28)') {
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.round(tileW))
  c.height = Math.max(1, Math.round(tileH))
  const ctx = c.getContext('2d')
  if (part.empty) return c.toDataURL('image/png')
  const { x, y, w, h } = part.bbox
  ctx.fillStyle = fill
  for (const tr of part.tris) {
    const x0 = ((tr[0] - x) / w) * c.width, y0 = ((tr[1] - y) / h) * c.height
    const x1 = ((tr[2] - x) / w) * c.width, y1 = ((tr[3] - y) / h) * c.height
    const x2 = ((tr[4] - x) / w) * c.width, y2 = ((tr[5] - y) / h) * c.height
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.closePath(); ctx.fill()
  }
  // a soft outline around the union of triangles (approx: stroke each triangle faintly)
  ctx.strokeStyle = stroke
  ctx.lineWidth = 1
  for (const tr of part.tris) {
    const x0 = ((tr[0] - x) / w) * c.width, y0 = ((tr[1] - y) / h) * c.height
    const x1 = ((tr[2] - x) / w) * c.width, y1 = ((tr[3] - y) / h) * c.height
    const x2 = ((tr[4] - x) / w) * c.width, y2 = ((tr[5] - y) / h) * c.height
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.closePath(); ctx.stroke()
  }
  return c.toDataURL('image/png')
}

export { PART_KEYS }

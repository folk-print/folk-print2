// Warp each zone tile onto the garment UV, triangle by triangle, over a flat
// shirt-colour base. Pure canvas — no three.

// Push triangle `d`'s vertices out from its centroid to hide anti-alias seams.
function expandTri(d, px) {
  const cx = (d[0] + d[2] + d[4]) / 3
  const cy = (d[1] + d[3] + d[5]) / 3
  const out = new Array(6)
  for (let i = 0; i < 6; i += 2) {
    const dx = d[i] - cx, dy = d[i + 1] - cy
    const len = Math.hypot(dx, dy) || 1
    out[i] = d[i] + (dx / len) * px
    out[i + 1] = d[i + 1] + (dy / len) * px
  }
  return out
}

// Draw image's source triangle `s` onto ctx's destination triangle `d` via the
// affine map that sends s_i -> d_i. Clipped to `d`.
function drawTriangle(ctx, img, s, d) {
  const [sx0, sy0, sx1, sy1, sx2, sy2] = s
  const [dx0, dy0, dx1, dy1, dx2, dy2] = d
  const det = (sx1 - sx0) * (sy2 - sy0) - (sx2 - sx0) * (sy1 - sy0)
  if (!det) return
  const a = ((dx1 - dx0) * (sy2 - sy0) - (dx2 - dx0) * (sy1 - sy0)) / det
  const c = ((sx1 - sx0) * (dx2 - dx0) - (sx2 - sx0) * (dx1 - dx0)) / det
  const e = dx0 - a * sx0 - c * sy0
  const b = ((dy1 - dy0) * (sy2 - sy0) - (dy2 - dy0) * (sy1 - sy0)) / det
  const dd = ((sx1 - sx0) * (dy2 - dy0) - (sx2 - sx0) * (dy1 - dy0)) / det
  const f = dy0 - b * sx0 - dd * sy0
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(dx0, dy0); ctx.lineTo(dx1, dy1); ctx.lineTo(dx2, dy2); ctx.closePath()
  ctx.clip()
  ctx.transform(a, b, c, dd, e, f)
  ctx.drawImage(img, 0, 0)
  ctx.restore()
}

// Re-paint ONE part's region of the master texture: fill its triangles with the
// shirt colour, then warp the part's tile image over them. `tile` = { img, w, h }.
export function compositePart(masterCtx, size, part, tile, shirtColor) {
  if (!part || part.empty || !tile) return
  const { x: bx, y: by, w: bw, h: bh } = part.bbox
  const tw = tile.w, th = tile.h
  for (const tr of part.tris) {
    const d0 = [tr[0] * size, tr[1] * size, tr[2] * size, tr[3] * size, tr[4] * size, tr[5] * size]
    const d = expandTri(d0, 0.9)
    // shirt-colour base — clipped to the TRUE (un-expanded) triangle so it never
    // crosses the part silhouette. (Expanding the base would paint shirt colour
    // ~1px past the edge and re-open seams when only one part is recomposited.)
    masterCtx.save()
    masterCtx.beginPath()
    masterCtx.moveTo(d0[0], d0[1]); masterCtx.lineTo(d0[2], d0[3]); masterCtx.lineTo(d0[4], d0[5]); masterCtx.closePath()
    masterCtx.clip()
    masterCtx.fillStyle = shirtColor
    masterCtx.fillRect(0, 0, size, size)
    masterCtx.restore()
    // warp the tile (transparent bg → only the print shows)
    const s = [
      ((tr[0] - bx) / bw) * tw, ((tr[1] - by) / bh) * th,
      ((tr[2] - bx) / bw) * tw, ((tr[3] - by) / bh) * th,
      ((tr[4] - bx) / bw) * tw, ((tr[5] - by) / bh) * th,
    ]
    drawTriangle(masterCtx, tile.img, s, d)
  }
}

// Full composite: flat shirt-colour fill, then every part warped on top.
export function compositeAll(masterCtx, size, parts, tiles, shirtColor) {
  masterCtx.save()
  masterCtx.setTransform(1, 0, 0, 1, 0, 0)
  masterCtx.fillStyle = shirtColor
  masterCtx.fillRect(0, 0, size, size)
  masterCtx.restore()
  for (const key in parts) compositePart(masterCtx, size, parts[key], tiles[key], shirtColor)
}

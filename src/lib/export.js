// Exports: the flat artwork (the composited UV texture = the print file), a 3D
// snapshot, and a per-piece JSON placement spec.
import { zoneAt } from './board.js'
import { PART_KEYS } from './garment.js'

function triggerDownload(href, filename) {
  const a = document.createElement('a')
  a.href = href
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}

function round(n, dp = 3) {
  const f = 10 ** dp
  return Math.round(n * f) / f
}

// `masterCanvas` is the composited UV texture (a plain HTMLCanvasElement).
export function exportArtworkPng(masterCanvas, { filename = 'folk-print-artwork.png' } = {}) {
  if (!masterCanvas) return null
  const url = masterCanvas.toDataURL('image/png')
  triggerDownload(url, filename)
  return url
}

export function exportSnapshotPng(gl, { filename = 'folk-print-3d.png' } = {}) {
  if (!gl) return null
  const url = gl.domElement.toDataURL('image/png')
  triggerDownload(url, filename)
  return url
}

// Group the board's prints by the zone each one sits over; positions are stored
// relative to the zone rectangle (0..1) so they are board-size independent.
export function buildSummary(board, layout, { product, shirtColor }) {
  const pieces = {}
  for (const k of PART_KEYS) pieces[k] = { prints: [] }
  if (board) {
    board
      .getObjects()
      .filter((o) => o.isPrint)
      .forEach((o, i) => {
        const c = o.getCenterPoint ? o.getCenterPoint() : { x: o.left, y: o.top }
        const zone = layout ? zoneAt(layout, c.x, c.y) : 'front'
        const r = layout?.zones[zone]
        pieces[zone].prints.push({
          fileName: o.fileName,
          zIndex: i,
          visible: o.visible !== false,
          opacity: round(o.opacity ?? 1),
          center: r ? { x: round((c.x - r.x) / r.w), y: round((c.y - r.y) / r.h) } : { x: round(c.x), y: round(c.y) },
          angle: round(o.angle, 2),
          scaleX: round(o.scaleX, 4),
          scaleY: round(o.scaleY, 4),
        })
      })
  }
  return {
    product: product.id,
    model: product.model3d.src,
    shirtColor,
    board: layout ? { width: layout.width, height: layout.height } : null,
    pieces,
    generatedAt: new Date().toISOString(),
  }
}

export function exportJson(board, layout, ctx, { filename = 'folk-print-design.json' } = {}) {
  const summary = buildSummary(board, layout, ctx)
  const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  triggerDownload(url, filename)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return summary
}

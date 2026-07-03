// Assembles the full order ("3D maket") and submits it. The payload carries the
// per-zone placement spec + the composited artwork PNG + a 3D snapshot PNG, so a
// backend can relay everything to a Telegram bot (token stays server-side).
import { buildSummary } from './export.js'

export function buildOrderPayload({ master, gl, board, layout, product, shirtColor }) {
  const spec = buildSummary(board, layout, { product, shirtColor })
  return {
    ...spec,
    artworkPng: master ? master.toDataURL('image/png') : null,
    snapshotPng: gl ? gl.domElement.toDataURL('image/png') : null,
  }
}

export async function submitOrder(payload, endpoint) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`order failed: ${res.status}`)
  return res
}

export function downloadOrder(payload, filename = 'folk-print-order.json') {
  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

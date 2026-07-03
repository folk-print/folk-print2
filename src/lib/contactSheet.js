// Builds the "all sides" order deliverable: a single labelled contact sheet of
// the 3D garment rendered from each side, plus a per-side text summary of which
// logos sit on which side. Pure canvas + small data helpers — no three.js here.
// Editor3D captures the four side renders; DesignerContext feeds them + the
// buildSummary() placement spec through here and sends the one PNG to the bot.

import { PART_KEYS } from './garment.js'

// Russian side labels for the four garment parts.
export const SIDE_LABELS = {
  front: 'Перед',
  back: 'Спина',
  sleeveL: 'Левый рукав',
  sleeveR: 'Правый рукав',
}

// The order the four panels appear in the sheet (row-major, 2 columns).
export const SIDE_ORDER = ['front', 'back', 'sleeveL', 'sleeveR']

function shortName(name, max = 24) {
  const s = String(name || 'логотип')
  return s.length > max ? s.slice(0, max - 1) + '…' : s
}

// Per-side visible print filenames from a buildSummary() spec:
//   { front: ['logo1.png'], back: [], sleeveL: [], sleeveR: ['logo3.png'] }
export function sidePrints(summary) {
  const out = {}
  for (const k of PART_KEYS) {
    const prints = (summary?.pieces?.[k]?.prints || []).filter((p) => p.visible !== false)
    out[k] = prints.map((p) => shortName(p.fileName))
  }
  return out
}

// One compact line for the Telegram caption — only the sides that carry a print.
// e.g. "Перед: logo1.png · Правый рукав: logo3.png"
export function sidesCaption(summary) {
  const per = sidePrints(summary)
  const rows = SIDE_ORDER
    .map((k) => (per[k].length ? `${SIDE_LABELS[k]}: ${per[k].join(', ')}` : null))
    .filter(Boolean)
  return rows.length ? rows.join(' · ') : 'без принтов'
}

function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null)
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

// Draw an image "contain"-fitted (no crop) inside a box.
function drawContain(ctx, img, x, y, w, h) {
  if (!img || !img.width || !img.height) return
  const s = Math.min(w / img.width, h / img.height)
  const dw = img.width * s, dh = img.height * s
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh)
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

// Compose the four side renders into one labelled PNG. `views` is
// { front, back, sleeveL, sleeveR } of data-URLs (any may be null). Each panel
// is tagged with its side name and the logo filenames placed on it. Returns a
// PNG data-URL, or null if nothing could be drawn.
export async function buildContactSheet({ views, summary, title, subtitle, panelBg = '#f0eeea' }) {
  const per = sidePrints(summary)
  const imgs = {}
  await Promise.all(SIDE_ORDER.map(async (k) => { imgs[k] = await loadImage(views?.[k]) }))
  if (!SIDE_ORDER.some((k) => imgs[k])) return null

  const cell = 520          // image area (square) per panel
  const labelH = 40         // side-name bar height
  const subH = 28           // logo-filenames line height
  const gap = 16
  const pad = 26
  const headerH = title ? 66 : 0
  const cols = 2, rows = 2
  const cellW = cell
  const cellH = cell + labelH + subH
  const W = pad * 2 + cols * cellW + (cols - 1) * gap
  const H = pad * 2 + headerH + rows * cellH + (rows - 1) * gap

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)

  if (title) {
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = '#15120D'
    ctx.font = "700 30px 'Oswald', Arial, sans-serif"
    ctx.fillText(title, pad, pad + 32)
    if (subtitle) {
      ctx.fillStyle = '#857B69'
      ctx.font = "500 17px Arial, sans-serif"
      ctx.fillText(subtitle, pad, pad + 55)
    }
  }

  SIDE_ORDER.forEach((k, i) => {
    const col = i % cols
    const row = (i / cols) | 0
    const x = pad + col * (cellW + gap)
    const y = pad + headerH + row * (cellH + gap)

    // panel image area
    ctx.fillStyle = panelBg
    roundRect(ctx, x, y, cellW, cell, 16)
    ctx.fill()
    drawContain(ctx, imgs[k], x + 12, y + 12, cellW - 24, cell - 24)

    // side label
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#15120D'
    ctx.font = "700 21px 'Oswald', Arial, sans-serif"
    ctx.fillText(SIDE_LABELS[k].toUpperCase(), x + 4, y + cell + labelH / 2 + 3)

    // logos placed on this side (or a muted "no print" note)
    const list = per[k]
    ctx.fillStyle = list.length ? '#6F6655' : '#B8AE9B'
    ctx.font = '500 15px Arial, sans-serif'
    ctx.fillText(list.length ? list.join(', ') : '— без принта', x + 4, y + cell + labelH + subH / 2 + 1)
  })

  ctx.textBaseline = 'alphabetic'
  return canvas.toDataURL('image/png')
}

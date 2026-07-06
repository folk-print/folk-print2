#!/usr/bin/env node
// Build the studio's sleeve assets:
//
//   tee-lsleeve.png / tee-rsleeve.png  — a straight-on FLAT-LAY short sleeve (not the
//     angled side view you get from the body photo). Drawn procedurally in the tee's
//     own fabric tone with soft cylinder shading + a cuff, transparent background, so
//     it tints by MULTIPLY exactly like the body and clips prints to the sleeve shape.
//   tee-front.body.png / tee-back.body.png — the tee with the sleeve regions made
//     transparent, used ONLY as the print-clip mask so prints can't land on the arms.
//
// Re-run if the tee photos change:  node scripts/gen-sleeves.mjs
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { PNG } from 'pngjs'

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'mockups')
const read = (f) => PNG.sync.read(fs.readFileSync(path.join(DIR, f)))
const write = (f, png) => { fs.writeFileSync(path.join(DIR, f), PNG.sync.write(png)); console.log('  wrote', f, png.width + 'x' + png.height) }

const clamp = (v, a, b) => v < a ? a : v > b ? b : v
const smooth = (z) => { z = clamp(z, 0, 1); return z * z * (3 - 2 * z) }

// warp-map grid — MUST match src/site/warpPrint.js (CW, CH, AMP)
const CW = 850, CH = 972, AMP = 28

// sleeve silhouette geometry (fractions of the frame) — shared by the mockup + warp
const SLV = { yTop: 0.075, yBot: 0.925, topHW: 0.285, cuffHW: 0.195 }
const sleeveHalfW = (t) => SLV.topHW + (SLV.cuffHW - SLV.topHW) * smooth(t)

// ── flat-lay short sleeve, drawn straight-on ──────────────────────────────────
// Silhouette (fractions of the frame): a rounded cap at the shoulder tapering to a
// narrower cuff, symmetric about the centre. Shaded like a soft cylinder so any tint
// reads as fabric. `which` only flips the sheen so L/R feel like a mirrored pair.
function makeFlatSleeve(W, H, which) {
  const out = new PNG({ width: W, height: H }); out.data.fill(0)
  const cx = 0.5
  const { yTop, yBot } = SLV
  const capBulge = 0.055                   // top edge dips at the corners (rounded cap)
  const botBulge = 0.026                   // cuff edge dips at the corners
  const softX = 0.007, softY = 0.006     // antialiased edge widths (fractions)
  const base = 0.950                     // near-white fabric so MULTIPLY tint stays clean
  const hlPos = which === 'left' ? -0.06 : 0.06

  const halfW = (t) => sleeveHalfW(t)

  for (let py = 0; py < H; py++) {
    const ny = py / H
    const t = (ny - yTop) / (yBot - yTop)
    if (t < -0.05 || t > 1.05) continue
    const hw = halfW(clamp(t, 0, 1))
    for (let px = 0; px < W; px++) {
      const nx = px / W
      const dxn = nx - cx
      const dEdge = Math.abs(dxn) / hw               // 0 centre → 1 at the seam
      // outline coverage (rounded cap + cuff via per-column top/bottom curves)
      const capY = yTop + capBulge * dEdge * dEdge
      const botY = yBot - botBulge * dEdge * dEdge
      const covX = smooth((hw - Math.abs(dxn)) / softX)
      const covT = smooth((ny - capY) / softY)
      const covB = smooth((botY - ny) / softY)
      const a = covX * covT * covB
      if (a <= 0) continue
      // shading: cylinder across the arm + a soft sheen + a touch of cuff shadow
      let lum = base
      lum *= 1 - 0.22 * Math.pow(dEdge, 1.7)                        // round the cylinder
      lum *= 1 - 0.05 * clamp(t, 0, 1)                              // slightly darker toward cuff
      lum *= 1 + 0.035 * Math.exp(-Math.pow((dxn - hlPos) / 0.07, 2)) // sheen stripe
      if (t > 0.86) lum *= 1 - 0.10 * smooth((t - 0.86) / 0.06)     // cuff band shadow
      const v = Math.round(clamp(lum, 0, 1) * 255)
      const di = (py * W + px) * 4
      out.data[di] = v; out.data[di + 1] = v; out.data[di + 2] = v
      out.data[di + 3] = Math.round(clamp(a, 0, 1) * 255)
    }
  }
  return out
}

// procedural sleeve warp map (RGBA-packed like author_warp.py: R=dx, G=dy, B=shade):
// a gentle horizontal CYLINDER so a print compresses toward the sleeve edges and
// beds into the shade — it wraps around the arm instead of sitting flat. Grid CW×CH.
function makeSleeveWarp() {
  const out = new PNG({ width: CW, height: CH })
  for (let i = 0; i < out.data.length; i += 4) { out.data[i] = 128; out.data[i + 1] = 128; out.data[i + 2] = 255; out.data[i + 3] = 255 }
  for (let py = 0; py < CH; py++) {
    const t = (py / CH - SLV.yTop) / (SLV.yBot - SLV.yTop)
    if (t < 0 || t > 1) continue
    const hw = sleeveHalfW(t) * CW
    for (let px = 0; px < CW; px++) {
      const u = clamp((px - 0.5 * CW) / hw, -1, 1)             // -1..1 across the sleeve
      let dx = hw * (u - (2 / Math.PI) * Math.asin(u))         // cylinder foreshortening
      dx = clamp(dx, -AMP, AMP)                                 // saturate the outer band at max
      const shade = 1 - 0.32 * u * u                           // darker toward the edges (wrap shadow)
      const di = (py * CW + px) * 4
      out.data[di] = clamp(Math.round(128 + 127 * (dx / AMP)), 0, 255)
      out.data[di + 1] = 128
      out.data[di + 2] = clamp(Math.round(255 * shade), 0, 255)
      out.data[di + 3] = 255
    }
  }
  return out
}

// body mask = tee with the SLEEVES and the NECK/collar zeroed (print-clip mask only):
// prints stay on the torso, off the arms, and can't cover the neckline.
// body mask = the tee with the SLEEVES and NECK zeroed, used ONLY as the print-clip
// mask. The sleeve cut follows the REAL garment: a curved armhole scoop from the
// shoulder down to the armpit, then the vertical side seam — measured from the tee's
// own silhouette — so the whole torso is printable, sleeves are fully excluded, and
// the armhole reads as a natural curve (not a square notch).
function makeBody(src, neck) {
  const W = src.width, H = src.height
  const out = new PNG({ width: W, height: H })
  src.data.copy(out.data)
  const A = (x, y) => src.data[(y * W + x) * 4 + 3] > 100
  // per-row silhouette left/right edges + width
  const xL = new Float64Array(H), xR = new Float64Array(H), wd = new Float64Array(H)
  for (let y = 0; y < H; y++) {
    let l = -1, r = -1
    for (let x = 0; x < W; x++) if (A(x, y)) { if (l < 0) l = x; r = x }
    xL[y] = l; xR[y] = r; wd[y] = l < 0 ? NaN : r - l
  }
  const med = (arr, a, b) => { const v = []; for (let y = a; y < b; y++) if (!Number.isNaN(arr[y])) v.push(arr[y]); v.sort((p, q) => p - q); return v.length ? v[v.length >> 1] : NaN }
  const torsoW = med(wd, (0.46 * H) | 0, (0.62 * H) | 0)
  // sleeves are widest partway down; the ARMPIT is below that, where width returns to torso
  let yMax = (0.15 * H) | 0, wMax = -1
  for (let y = (0.15 * H) | 0; y < (0.58 * H) | 0; y++) if (!Number.isNaN(wd[y]) && wd[y] > wMax) { wMax = wd[y]; yMax = y }
  let ySb = (0.46 * H) | 0
  for (let y = yMax; y < (0.62 * H) | 0; y++) if (!Number.isNaN(wd[y]) && wd[y] <= torsoW * 1.05) { ySb = y; break }
  const yTop = 0.135 * H                       // top of the armhole scoop (a bit lower → keep more shoulder)
  const yScoop = yTop + (ySb - yTop) * 0.52    // scoop meets the vertical body side sooner (shallower cut)
  const bodyL = xL[ySb], bodyR = xR[ySb]       // body side at the armpit
  const xSL = bodyL + 0.028 * W, xSR = bodyR - 0.028 * W  // shoulder point close to the body side → keep the upper-chest printable
  const smooth = (t) => { t = t < 0 ? 0 : t > 1 ? 1 : t; return t * t * (3 - 2 * t) }
  const ncx = neck.cx * W, ncy = neck.cy * H, nrx = neck.rx * W, nry = neck.ry * H
  for (let y = 0; y < H; y++) {
    if (xL[y] < 0) continue
    let bL, bR
    if (y < yTop) { bL = xL[y]; bR = xR[y] }                                        // shoulders/collar: full silhouette
    else if (y <= yScoop) { const t = smooth((y - yTop) / (yScoop - yTop)); bL = xSL + (bodyL - xSL) * t; bR = xSR + (bodyR - xSR) * t }  // curved armhole
    else if (y <= ySb) { bL = bodyL; bR = bodyR }                                   // vertical side seam → sleeves fully cut
    else { bL = xL[y]; bR = xR[y] }                                                 // below the sleeve: silhouette (body taper)
    for (let x = 0; x < W; x++) {
      let cut = x < bL || x > bR
      const ex = (x - ncx) / nrx, ey = (y - ncy) / nry
      if (ex * ex + ey * ey <= 1) cut = true                                        // neck/collar ellipse
      if (cut) out.data[(y * W + x) * 4 + 3] = 0
    }
  }
  return out
}

console.log('generating flat-lay sleeve mockups + warp + body masks…')
const front = read('tee-front.png')
const back = read('tee-back.png')
const W = front.width, H = front.height
write('tee-lsleeve.png', makeFlatSleeve(W, H, 'left'))
write('tee-rsleeve.png', makeFlatSleeve(W, H, 'right'))
write('tee-lsleeve.warp.png', makeSleeveWarp())
write('tee-rsleeve.warp.png', makeSleeveWarp())
write('tee-front.body.png', makeBody(front, { cx: 0.50, cy: 0.095, rx: 0.150, ry: 0.115 }))
write('tee-back.body.png', makeBody(back, { cx: 0.50, cy: 0.075, rx: 0.150, ry: 0.100 }))
console.log('done.')

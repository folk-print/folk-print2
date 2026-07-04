// Print surface-warp — bends a flat print onto the garment's 3D shape (collar
// arc + armpit/side cylinder + folds) using a pre-authored per-side displacement
// map. Pure (no React/Fabric). CW/CH/AMP MUST match scripts/author_warp.py.
export const CW = 850, CH = 972, AMP = 28

// Decode ONE packed RGBA warp map (R=dx, G=dy around 128, B=shade) into typed
// arrays. Cache the result per side in the caller — decoding is the expensive bit.
export function decodeMap(img) {
  const c = document.createElement('canvas'); c.width = CW; c.height = CH
  const g = c.getContext('2d', { willReadFrequently: true })
  g.drawImage(img, 0, 0, CW, CH)
  const px = g.getImageData(0, 0, CW, CH).data, N = CW * CH
  const dx = new Int16Array(N), dy = new Int16Array(N), shade = new Uint8ClampedArray(N)
  for (let i = 0, p = 0; i < N; i++, p += 4) {
    dx[i] = Math.round(((px[p] - 128) / 127) * AMP)
    dy[i] = Math.round(((px[p + 1] - 128) / 127) * AMP)
    shade[i] = px[p + 2]
  }
  return { dx, dy, shade }
}

// Backward remap: each DEST pixel pulls its SOURCE from (x-dx, y-dy) with bilinear
// sampling, then multiplies RGB (not alpha) by shade/255 so the print beds into the
// cloth's folds. Deterministic → the live preview and the order snapshot are
// pixel-identical when fed the same map. Returns a fresh CW x CH canvas.
export function warpPrint(printCanvas, maps) {
  let pc = printCanvas
  if (pc.width !== CW || pc.height !== CH) {
    const t = document.createElement('canvas'); t.width = CW; t.height = CH
    t.getContext('2d').drawImage(pc, 0, 0, CW, CH); pc = t
  }
  const src = pc.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, CW, CH).data
  const out = new ImageData(CW, CH), O = out.data, { dx, dy, shade } = maps
  for (let y = 0; y < CH; y++) {
    for (let x = 0; x < CW; x++) {
      const i = y * CW + x, sx = x - dx[i], sy = y - dy[i]
      if (sx < 0 || sy < 0 || sx >= CW - 1 || sy >= CH - 1) continue
      const x0 = sx | 0, y0 = sy | 0, fx = sx - x0, fy = sy - y0
      const a = (y0 * CW + x0) * 4, b = a + 4, c = a + CW * 4, d = c + 4
      const w00 = (1 - fx) * (1 - fy), w10 = fx * (1 - fy), w01 = (1 - fx) * fy, w11 = fx * fy
      const o = i * 4, sh = shade[i] / 255
      for (let ch = 0; ch < 4; ch++) {
        const v = src[a + ch] * w00 + src[b + ch] * w10 + src[c + ch] * w01 + src[d + ch] * w11
        O[o + ch] = ch === 3 ? v : v * sh
      }
    }
  }
  const oc = document.createElement('canvas'); oc.width = CW; oc.height = CH
  oc.getContext('2d').putImageData(out, 0, 0)
  return oc
}

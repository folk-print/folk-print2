// Print surface-warp — bends a flat print onto the garment's 3D shape (collar
// arc + armpit/side cylinder + folds) using a pre-authored per-side displacement
// map. Pure (no React/Fabric). CW/CH/AMP MUST match scripts/author_warp.py.
export const CW = 850, CH = 972, AMP = 28

// Decode ONE packed RGBA warp map (R=dx, G=dy around 128, B=shade) into typed
// arrays. Cache the result per side in the caller — decoding is the expensive bit.
//
// `scale` renders the map — and the warp it drives — on a CW*scale × CH*scale
// grid. The displacement fields are smooth and low-frequency (gaussian-blurred in
// author_warp.py), so up-sampling the packed map is effectively loss-free. This
// lets the settled preview match the garment photo's OWN resolution (the tee PNGs
// are 1700×1944 = 2× the base grid) instead of softening to 850×972 on release.
export function decodeMap(img, scale = 1) {
  const W = CW * scale, H = CH * scale
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const g = c.getContext('2d', { willReadFrequently: true })
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'
  g.drawImage(img, 0, 0, W, H)
  const px = g.getImageData(0, 0, W, H).data, N = W * H
  const dx = new Int16Array(N), dy = new Int16Array(N), shade = new Uint8ClampedArray(N)
  const amp = AMP * scale  // displacements are in pixels → grow with the grid
  for (let i = 0, p = 0; i < N; i++, p += 4) {
    dx[i] = Math.round(((px[p] - 128) / 127) * amp)
    dy[i] = Math.round(((px[p + 1] - 128) / 127) * amp)
    shade[i] = px[p + 2]
  }
  return { dx, dy, shade, W, H }
}

// Backward remap: each DEST pixel pulls its SOURCE from (x-dx, y-dy) with bilinear
// sampling, then multiplies RGB (not alpha) by shade/255 so the print beds into the
// cloth's folds. Deterministic → the live preview and the order snapshot are
// pixel-identical when fed the same map. Returns a fresh W x H canvas (W/H taken
// from the decoded map, so it follows whatever scale decodeMap used).
//
// `region` ({x0,y0,x1,y1} in W×H coords) restricts the pixel loop to the prints'
// bounding box (+ AMP margin) so the settle stays cheap at 2×: cost is proportional
// to the printed area, not the whole 1700×1944 canvas (a settle used to remap ~3.3M
// px on every release — a visible phone hitch). Everything outside the box is
// transparent anyway (the source print is), so the output is identical. Omit for a
// full-canvas remap (used by the one-shot order snapshot).
export function warpPrint(printCanvas, maps, region) {
  const W = maps.W || CW, H = maps.H || CH
  let pc = printCanvas
  if (pc.width !== W || pc.height !== H) {
    const t = document.createElement('canvas'); t.width = W; t.height = H
    const tg = t.getContext('2d'); tg.imageSmoothingEnabled = true; tg.imageSmoothingQuality = 'high'
    tg.drawImage(pc, 0, 0, W, H); pc = t
  }
  const oc = document.createElement('canvas'); oc.width = W; oc.height = H
  let rx0 = 0, ry0 = 0, rx1 = W, ry1 = H
  if (region) {
    rx0 = Math.max(0, Math.floor(region.x0)); ry0 = Math.max(0, Math.floor(region.y0))
    rx1 = Math.min(W, Math.ceil(region.x1)); ry1 = Math.min(H, Math.ceil(region.y1))
  }
  if (rx1 <= rx0 || ry1 <= ry0) return oc  // nothing in view → empty canvas
  const src = pc.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, W, H).data
  const { dx, dy, shade } = maps
  const rw = rx1 - rx0, rh = ry1 - ry0
  const out = new ImageData(rw, rh), O = out.data
  for (let y = ry0; y < ry1; y++) {
    for (let x = rx0; x < rx1; x++) {
      const i = y * W + x, sx = x - dx[i], sy = y - dy[i]
      if (sx < 0 || sy < 0 || sx >= W - 1 || sy >= H - 1) continue
      const x0 = sx | 0, y0 = sy | 0, fx = sx - x0, fy = sy - y0
      const a = (y0 * W + x0) * 4, b = a + 4, c = a + W * 4, d = c + 4
      const w00 = (1 - fx) * (1 - fy), w10 = fx * (1 - fy), w01 = (1 - fx) * fy, w11 = fx * fy
      // PREMULTIPLIED bilinear: weight each sample's RGB by its own alpha, then
      // un-premultiply. A transparent neighbour (0,0,0,0) then contributes NO colour
      // instead of pulling the edge toward black → kills the dark fringe/smear that
      // plain bilinear leaves around an opaque print's boundary.
      const aa = src[a + 3], ab = src[b + 3], ac = src[c + 3], ad = src[d + 3]
      const A = aa * w00 + ab * w10 + ac * w01 + ad * w11
      const o = ((y - ry0) * rw + (x - rx0)) * 4
      if (A > 0) {
        const inv = (shade[i] / 255) / A  // fold the shade multiply into the un-premultiply divide
        O[o]     = (src[a]     * aa * w00 + src[b]     * ab * w10 + src[c]     * ac * w01 + src[d]     * ad * w11) * inv
        O[o + 1] = (src[a + 1] * aa * w00 + src[b + 1] * ab * w10 + src[c + 1] * ac * w01 + src[d + 1] * ad * w11) * inv
        O[o + 2] = (src[a + 2] * aa * w00 + src[b + 2] * ab * w10 + src[c + 2] * ac * w01 + src[d + 2] * ad * w11) * inv
        O[o + 3] = A
      }
    }
  }
  oc.getContext('2d').putImageData(out, rx0, ry0)
  return oc
}

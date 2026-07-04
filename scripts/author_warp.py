#!/usr/bin/env python3
# Offline author of the per-side print-warp maps.
#
# For each garment side we bake ONE packed RGBA PNG (tee-<side>.warp.png) on the
# SAME 850x972 grid the studio composites on:
#   R = 128 + 127*(dx/AMP)   signed horizontal displacement (px, /AMP)
#   G = 128 + 127*(dy/AMP)   signed vertical displacement
#   B = shade*255            multiply factor (255 = neutral body, <255 = fold/side shadow)
#   A = 255                  (garment alpha is applied at composite time, not here)
#
# Three additive displacement fields are summed before quantizing:
#   (A) side/armpit CYLINDER  — compress toward the silhouette in the torso band
#   (B) COLLAR/neckline       — sink + splay in the top band so prints bow around the neck
#   (C) photo WRINKLES        — luminance high-pass pushes edges along real folds
# plus a SHADE map so the print beds into the cloth.
#
# Re-run whenever the tee PNGs are re-shot/re-cropped:  python3 scripts/author_warp.py
import os
import numpy as np
from PIL import Image

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MOCK = os.path.join(BASE, 'public', 'mockups')
CW, CH, AMP = 850, 972, 28.0  # MUST match src/site/warpPrint.js


def _kernel(sigma):
    r = max(1, int(round(sigma * 3)))
    x = np.arange(-r, r + 1, dtype=np.float32)
    k = np.exp(-(x * x) / (2 * sigma * sigma))
    return (k / k.sum()).astype(np.float32)


def blur1d(v, sigma):
    return np.convolve(v.astype(np.float32), _kernel(sigma), mode='same')


def blur2d(a, sigma):
    k = _kernel(sigma)
    a = np.asarray(a, np.float32)
    a = np.apply_along_axis(lambda r: np.convolve(r, k, mode='same'), 1, a)
    a = np.apply_along_axis(lambda c: np.convolve(c, k, mode='same'), 0, a)
    return a


def smoothstep(e0, e1, v):
    t = np.clip((v - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def build(side):
    tee = Image.open(os.path.join(MOCK, f'tee-{side}.png')).convert('RGBA').resize((CW, CH), Image.LANCZOS)
    a = np.asarray(tee, np.float32)
    alpha = a[..., 3] / 255.0
    m = alpha > 0.5
    lum = 0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2]
    Y, X = np.mgrid[0:CH, 0:CW].astype(np.float32)

    dx = np.zeros((CH, CW), np.float32)
    dy = np.zeros_like(dx)
    shade = np.ones_like(dx)

    cols = np.arange(CW)[None, :]
    rowcount = np.maximum(m.sum(1), 1)
    cx = np.where(m.any(1), (cols * m).sum(1) / rowcount, CW / 2).astype(np.float32)   # garment centre per row
    halfw = np.maximum(m.sum(1) / 2.0, 20.0).astype(np.float32)                        # garment half-width per row
    # TORSO center/width: the raw half-width balloons on sleeve rows; cap it to the
    # body width (median of the pure-torso band) and smooth it into a gentle profile so
    # the cylinder is consistent from chest to hem (no mid-chest pinch).
    cxs = blur1d(cx, 30)
    ref = float(np.median(halfw[int(0.42 * CH):int(0.60 * CH)]))
    torso = blur1d(np.minimum(halfw, ref * 1.15), 30)

    # (A) SIDE / ARMPIT CYLINDER — torso is a cylinder: equal steps of real surface map
    # to ever-smaller steps of screen-x toward the sides, so a print compresses / "slides
    # over" the edge. Applied across the whole chest+torso, fading only near the collar.
    u = np.clip((X - cxs[:, None]) / torso[:, None], -1, 1)
    gate = smoothstep(0.12 * CH, 0.22 * CH, Y)
    cyl = (np.arcsin(u) * (2 / np.pi) - u)
    dx += cyl * torso[:, None] * 0.72 * gate
    dx += np.sign(u) * (u ** 4) * 12.0 * gate                # accelerate the wrap right at the side
    shade *= np.clip(1 - 0.20 * np.clip(np.abs(u) - 0.55, 0, 1) / 0.45, 0.80, 1.0)

    # (B) COLLAR / NECKLINE — detect the top garment edge per column, smooth it into a
    # neck arc, and in the band just below it sink pixels DOWN + splay them along the
    # neckline tilt so a high print bows around the collar instead of crossing it flat.
    top = np.full(CW, CH, np.float32)
    for x in range(CW):
        idx = np.where(alpha[:, x] > 0.5)[0]
        if idx.size:
            top[x] = idx[0]
    top = blur1d(top, 8)
    dist = Y - top[None, :]
    band = np.clip(1 - dist / 135.0, 0, 1)
    band[dist < 0] = 0
    slope = np.gradient(top)
    dy += band * 14.0
    dx += band * slope[None, :] * 0.8
    shade *= np.clip(1 - 0.10 * band, 0.90, 1.0)

    # (C) PHOTO WRINKLES — luminance high-pass; push print edges along real fold gradients
    Lb = blur2d(lum, 9)
    hp = blur2d(lum - Lb, 1.5)
    gy, gx = np.gradient(hp)
    dx += gx * 0.9
    dy += gy * 0.9
    denom = max(1e-3, float(np.percentile(np.abs(hp[m]), 95)))
    shade *= np.clip(1 + hp / denom * 0.16, 0.72, 1.10)

    # confine to the garment, then smooth the displacement so nothing swims/tears
    dx *= m
    dy *= m
    shade = np.where(m, shade, 1.0)
    dx = blur2d(dx, 2)
    dy = blur2d(dy, 2)

    R = np.clip(128 + 127 * (dx / AMP), 0, 255)
    G = np.clip(128 + 127 * (dy / AMP), 0, 255)
    B = np.clip(shade * 255, 0, 255)
    Aa = np.full_like(R, 255)
    out = np.dstack([R, G, B, Aa]).astype('uint8')
    Image.fromarray(out, 'RGBA').save(os.path.join(MOCK, f'tee-{side}.warp.png'))
    print(f'{side}: tee-{side}.warp.png  dx[{dx.min():.1f},{dx.max():.1f}]  '
          f'dy[{dy.min():.1f},{dy.max():.1f}]  shade[{shade.min():.2f},{shade.max():.2f}]')


if __name__ == '__main__':
    for s in ('front', 'back'):
        build(s)
    print('done ->', MOCK)

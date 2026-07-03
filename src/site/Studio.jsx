import React from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { Link } from 'react-router-dom'
import { runtime } from '../config/runtime.js'
import { prefersReducedMotion } from './motion.jsx'
import Logo from './Logo.jsx'
import { LangToggle } from './lang.jsx'
import STUDIO_STR from './studioStrings.js'

// Self-contained 3D mockup studio (ported faithfully from the Folk Print design).
// Procedural garments (tee / hoodie / polo / cap), multi-print system, drag-orbit,
// drag-to-place prints, upload + sample artworks, method/zone/scale/rotate, and a
// "Получить КП" summary form. Prices are non-disclosed → shown as «по запросу».

// CSS-string → React style object (keeps the translation faithful to the source).
function css(s) {
  const o = {}
  if (!s) return o
  s.split(';').forEach(d => {
    const i = d.indexOf(':')
    if (i < 0) return
    const k = d.slice(0, i).trim()
    const val = d.slice(i + 1).trim()
    if (!k) return
    o[k.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = val
  })
  return o
}

export default class Studio extends React.Component {
  static defaultProps = { defaultProduct: 'Футболка', studioTone: 'Тёплый', accent: '#FCAC45', lang: 'ru' }

  hostRef = React.createRef()
  fileRef = React.createRef()
  thumbRef = React.createRef()
  scaleRef = React.createRef()
  rotRef = React.createRef()
  prints = []
  _pid = 0
  state = {
    product: 'tee', color: '#1E1B16',
    autoRotate: true, loading: true,
    printsView: [], selectedId: null,
    summaryOpen: false, sent: false, closing: false,
  }

  componentDidMount() {
    this._alive = true
    const map = { 'Футболка': 'tee', 'Худи': 'hoodie', 'Поло': 'polo', 'Кепка': 'cap' }
    const p = map[this.props.defaultProduct] || 'tee'
    if (p !== this.state.product) this.state.product = p
    this.tryInit()
  }
  componentWillUnmount() {
    this._alive = false
    if (this._raf) cancelAnimationFrame(this._raf)
    if (this.ro) this.ro.disconnect()
    const el = this.hostRef.current
    if (el && this._onDown) el.removeEventListener('pointerdown', this._onDown)
    window.removeEventListener('pointermove', this._onMove)
    window.removeEventListener('pointerup', this._onUp)
    if (this.envRT) { try { this.envRT.dispose() } catch (e) {} }
    if (this.pmrem) { try { this.pmrem.dispose() } catch (e) {} }
    if (this.renderer) { try { this.renderer.dispose(); this.renderer.forceContextLoss() } catch (e) {} }
  }
  tryInit() {
    if (!this._alive) return
    if (this.hostRef.current && this.hostRef.current.clientWidth > 0) {
      try { this.init() } catch (e) { console.error('3D init failed', e) }
    } else setTimeout(() => this.tryInit(), 70)
  }

  // ---- texture helpers ----
  setSRGB(t) { if ('colorSpace' in t && THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace }
  darken(hex, f) { const c = new THREE.Color(hex); c.multiplyScalar(f); return '#' + c.getHexString() }
  studioColors() { const tone = this.props.studioTone || 'Тёплый'; if (tone === 'Светлый') return { top: '#FBF8F2', bottom: '#ECE5D7' }; if (tone === 'Тёмный') return { top: '#2A2620', bottom: '#16130F' }; return { top: '#F1E9DA', bottom: '#E2D5BF' } }
  makeBackground() { const g = this.studioColors(); const c = document.createElement('canvas'); c.width = 16; c.height = 256; const x = c.getContext('2d'); const gr = x.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, g.top); gr.addColorStop(1, g.bottom); x.fillStyle = gr; x.fillRect(0, 0, 16, 256); const t = new THREE.CanvasTexture(c); this.setSRGB(t); return t }
  makeFabricBump() { const s = 128, c = document.createElement('canvas'); c.width = c.height = s; const x = c.getContext('2d'); const im = x.createImageData(s, s); for (let i = 0; i < im.data.length; i += 4) { const v = 120 + Math.random() * 40; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255 } x.putImageData(im, 0, 0); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(5, 6); return t }
  // Bake a tileable knit + wrinkle height field, convert to a tangent-space NORMAL map
  // (via wrap-around Sobel) plus a matching roughness map. This is what makes the surface
  // read as real cloth instead of flat colour. NOTE: both are LINEAR data — never sRGB.
  makeFabricNormalSet(opts = {}) {
    const N = opts.size || 256
    const waleFreq = opts.waleFreq || 46
    const courseFreq = opts.courseFreq || 58
    const knitAmp = opts.knitAmp != null ? opts.knitAmp : 0.10
    const wrinkleAmp = opts.wrinkleAmp != null ? opts.wrinkleAmp : 0.55
    const STR = opts.sobel || 2.6
    const TWO = Math.PI * 2
    const H = new Float32Array(N * N)
    const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s) }
    const smooth = t => t * t * (3 - 2 * t)
    const vnoise = (u, v, cells) => {
      const gx = u * cells, gy = v * cells
      const x0 = Math.floor(gx), y0 = Math.floor(gy)
      const fx = smooth(gx - x0), fy = smooth(gy - y0)
      const wrap = n => ((n % cells) + cells) % cells
      const a = hash(wrap(x0), wrap(y0)), b = hash(wrap(x0 + 1), wrap(y0))
      const c = hash(wrap(x0), wrap(y0 + 1)), d = hash(wrap(x0 + 1), wrap(y0 + 1))
      return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy
    }
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const u = x / N, v = y / N
      const row = Math.floor(v * courseFreq)
      const waleShift = (row % 2) * 0.5 / waleFreq
      const wale = Math.sin((u + waleShift) * waleFreq * TWO)
      const course = Math.sin(v * courseFreq * TWO)
      let knit = (0.6 * wale + 0.6 * course + 0.5 * wale * course)
      knit += (hash(x * 1.7, y * 1.7) - 0.5) * 0.30
      const w = vnoise(u, v, 4) * 1.0 + vnoise(u, v, 8) * 0.5 + vnoise(u, v, 16) * 0.22
      const wrinkle = (w / 1.72) - 0.5
      H[y * N + x] = 0.5 + knit * knitAmp + wrinkle * wrinkleAmp
    }
    const nc = document.createElement('canvas'); nc.width = nc.height = N
    const nx = nc.getContext('2d'); const nimg = nx.createImageData(N, N)
    const rc = document.createElement('canvas'); rc.width = rc.height = N
    const rx = rc.getContext('2d'); const rimg = rx.createImageData(N, N)
    const at = (x, y) => H[(((y % N) + N) % N) * N + (((x % N) + N) % N)]
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const tl = at(x - 1, y - 1), t = at(x, y - 1), tr = at(x + 1, y - 1)
      const l = at(x - 1, y), r = at(x + 1, y)
      const bl = at(x - 1, y + 1), b = at(x, y + 1), br = at(x + 1, y + 1)
      const gx = (tr + 2 * r + br) - (tl + 2 * l + bl)
      const gy = (bl + 2 * b + br) - (tl + 2 * t + tr)
      let vxn = -gx * STR, vyn = -gy * STR, vzn = 1
      const inv = 1 / Math.sqrt(vxn * vxn + vyn * vyn + vzn * vzn)
      vxn *= inv; vyn *= inv; vzn *= inv
      const i = (y * N + x) * 4
      nimg.data[i] = Math.round((vxn * 0.5 + 0.5) * 255)
      nimg.data[i + 1] = Math.round((vyn * 0.5 + 0.5) * 255)
      nimg.data[i + 2] = Math.round((vzn * 0.5 + 0.5) * 255)
      nimg.data[i + 3] = 255
      const h = H[y * N + x]
      const rough = Math.min(0.99, Math.max(0.62, 0.93 - (h - 0.5) * 0.12))
      const rv = Math.round(rough * 255)
      rimg.data[i] = rimg.data[i + 1] = rimg.data[i + 2] = rv; rimg.data[i + 3] = 255
    }
    nx.putImageData(nimg, 0, 0); rx.putImageData(rimg, 0, 0)
    const normal = new THREE.CanvasTexture(nc)
    normal.wrapS = normal.wrapT = THREE.RepeatWrapping; normal.anisotropy = 4; normal.needsUpdate = true
    const rough = new THREE.CanvasTexture(rc)
    rough.wrapS = rough.wrapT = THREE.RepeatWrapping; rough.anisotropy = 4; rough.needsUpdate = true
    return { normal, rough }
  }
  // Project clean planar UVs from the FLAT slab bbox (U across chest, V vertical) so the
  // knit wales run vertically. MUST be called while the slab is still flat (before bendY).
  planarUV(geo) {
    geo.computeBoundingBox(); const bb = geo.boundingBox
    const sx = 1 / (bb.max.x - bb.min.x), sy = 1 / (bb.max.y - bb.min.y)
    const pos = geo.attributes.position, uv = new Float32Array(pos.count * 2)
    for (let i = 0; i < pos.count; i++) {
      uv[i * 2] = (pos.getX(i) - bb.min.x) * sx
      uv[i * 2 + 1] = (pos.getY(i) - bb.min.y) * sy
    }
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
  }
  makeShadow() { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); const g = x.createRadialGradient(128, 128, 10, 128, 128, 124); g.addColorStop(0, 'rgba(0,0,0,.42)'); g.addColorStop(.6, 'rgba(0,0,0,.18)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.beginPath(); x.arc(128, 128, 128, 0, Math.PI * 2); x.fill(); return new THREE.CanvasTexture(c) }
  star(ctx, cx, cy, sp, outer, inner) { let rot = Math.PI / 2 * 3, x = cx, y = cy, step = Math.PI / sp; ctx.beginPath(); ctx.moveTo(cx, cy - outer); for (let i = 0; i < sp; i++) { x = cx + Math.cos(rot) * outer; y = cy + Math.sin(rot) * outer; ctx.lineTo(x, y); rot += step; x = cx + Math.cos(rot) * inner; y = cy + Math.sin(rot) * inner; ctx.lineTo(x, y); rot += step } ctx.lineTo(cx, cy - outer); ctx.closePath(); ctx.fill() }
  sampleTex(kind) {
    const S = 512, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d'); x.clearRect(0, 0, S, S)
    if (kind === 0) { x.fillStyle = '#FCAC45'; x.beginPath(); x.arc(256, 256, 210, 0, Math.PI * 2); x.fill(); x.lineWidth = 10; x.strokeStyle = '#15120D'; x.beginPath(); x.arc(256, 256, 210, 0, Math.PI * 2); x.stroke(); x.beginPath(); x.arc(256, 256, 168, 0, Math.PI * 2); x.stroke(); x.fillStyle = '#15120D'; this.star(x, 256, 196, 7, 30, 15); x.textAlign = 'center'; x.font = '700 60px Oswald, sans-serif'; x.fillText('FOLK', 256, 286); x.fillText('PRINT', 256, 344); x.font = '600 26px Oswald, sans-serif'; x.fillText('EST · 2014', 256, 392) }
    else if (kind === 1) { x.fillStyle = '#15120D'; x.beginPath(); x.arc(256, 210, 96, 0, Math.PI * 2); x.fill(); x.fillStyle = '#FCAC45'; x.beginPath(); x.arc(256, 210, 64, 0, Math.PI * 2); x.fill(); x.fillStyle = '#15120D'; x.beginPath(); x.moveTo(96, 360); x.lineTo(216, 200); x.lineTo(310, 330); x.lineTo(380, 250); x.lineTo(440, 360); x.closePath(); x.fill(); x.font = '700 54px Oswald, sans-serif'; x.textAlign = 'center'; x.fillText('TASHKENT', 256, 430) }
    else { x.fillStyle = '#15120D'; x.font = '800 230px Oswald, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('FP', 256, 230); x.fillStyle = '#FCAC45'; x.fillRect(150, 360, 212, 16); x.fillStyle = '#15120D'; x.font = '600 30px Oswald, sans-serif'; x.fillText('FOLK PRINT', 256, 410) }
    const t = new THREE.CanvasTexture(c); this.setSRGB(t); t.anisotropy = 4; return { tex: t, url: c.toDataURL() }
  }

  // ---- init ----
  init() {
    const host = this.hostRef.current; const W = host.clientWidth, H = host.clientHeight
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); renderer.setSize(W, H)
    if (THREE.ACESFilmicToneMapping) { renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.90 }
    if ('outputColorSpace' in renderer && THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.domElement.style.width = '100%'; renderer.domElement.style.height = '100%'; renderer.domElement.style.display = 'block'
    host.appendChild(renderer.domElement); this.renderer = renderer

    const scene = new THREE.Scene(); scene.background = this.makeBackground(); this.scene = scene
    const camera = new THREE.PerspectiveCamera(34, W / H, 0.1, 100); camera.position.set(0, 0.15, 6.4); this.camera = camera; this.camZ = 6.4

    // Soft image-based studio lighting — the main thing that makes the fabric read as cloth.
    const pmrem = new THREE.PMREMGenerator(renderer); this.pmrem = pmrem
    const envScene = new RoomEnvironment(); const envRT = pmrem.fromScene(envScene, 0.04)
    scene.environment = envRT.texture; this.envRT = envRT

    scene.add(new THREE.HemisphereLight(0xfff6ea, 0x9a8d76, 0.30))
    const key = new THREE.DirectionalLight(0xffffff, 1.05); key.position.set(4, 6.5, 5); scene.add(key)
    const fill = new THREE.DirectionalLight(0xeef2ff, 0.28); fill.position.set(-5, 2, -3); scene.add(fill)
    const front = new THREE.DirectionalLight(0xfff4e2, 0.22); front.position.set(0, 1, 8); scene.add(front)
    const rim = new THREE.DirectionalLight(0xffffff, 0.6); rim.position.set(-4, 5, -6); scene.add(rim)

    this.root = new THREE.Group(); scene.add(this.root)
    this.fabricN = this.makeFabricNormalSet()
    const shadowMat = new THREE.MeshBasicMaterial({ map: this.makeShadow(), transparent: true, depthWrite: false })
    this.shadow = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 4.4), shadowMat); this.shadow.rotation.x = -Math.PI / 2; this.shadow.renderOrder = -1; scene.add(this.shadow)
    const softMat = new THREE.MeshBasicMaterial({ map: this.makeShadowSoft(), transparent: true, depthWrite: false })
    this.shadowSoft = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 4.4), softMat); this.shadowSoft.rotation.x = -Math.PI / 2; this.shadowSoft.renderOrder = -2; scene.add(this.shadowSoft)

    const fabric = (hex) => new THREE.MeshPhysicalMaterial({ color: new THREE.Color(hex), roughness: 1.0, metalness: 0, sheen: 0.35, sheenRoughness: 0.95, sheenColor: new THREE.Color(0x6b6256), envMapIntensity: 0.22, normalMap: this.fabricN.normal, normalScale: new THREE.Vector2(0.5, 0.5), roughnessMap: this.fabricN.rough })
    this.mat = fabric(this.state.color)
    this.matDark = fabric(this.darken(this.state.color, 0.86))
    this._targetColor = new THREE.Color(this.state.color)
    this._targetColorDark = new THREE.Color(this.darken(this.state.color, 0.86))
    this._colorTweening = false

    this.samples = [this.sampleTex(0), this.sampleTex(1), this.sampleTex(2)]

    this.buildGarment(this.state.product)
    this.camera.position.z = this.camZ
    this.targetRotY = -0.42; this.targetRotX = -0.02; this.root.rotation.set(-0.02, -0.42, 0)

    this.ray = new THREE.Raycaster(); this.plane = new THREE.Plane(); this.drag = null; this.lastInteract = performance.now()
    this._onDown = (e) => this.onDown(e); this._onMove = (e) => this.onMove(e); this._onUp = () => this.onUp()
    renderer.domElement.addEventListener('pointerdown', this._onDown)
    window.addEventListener('pointermove', this._onMove); window.addEventListener('pointerup', this._onUp)
    renderer.domElement.addEventListener('wheel', (e) => { e.preventDefault(); const lo = (this._fitZ || this.camZ) * 0.55, hi = (this._fitZ || this.camZ) * 1.4; this.camZ = Math.max(lo, Math.min(hi, this.camZ + e.deltaY * 0.002 * this.camZ)) }, { passive: false })
    this.ro = new ResizeObserver(() => this.onResize()); this.ro.observe(host)

    this.addPrint('front', 0)

    this.setState({ loading: false })
    // Fade the loading overlay out rather than popping it, then unmount it.
    if (prefersReducedMotion()) { this.setState({ loadingHidden: true }) }
    else { setTimeout(() => { if (this._alive) this.setState({ loadingHidden: true }) }, 360) }
    this.animate()
  }

  onResize() { if (!this.renderer || !this.hostRef.current) return; const W = this.hostRef.current.clientWidth, H = this.hostRef.current.clientHeight; if (!W || !H) return; this.renderer.setSize(W, H); this.camera.aspect = W / H; this.camera.updateProjectionMatrix(); this.applyFit() }
  applyFit() { if (!this._radius) return; const vfov = this.camera.fov * Math.PI / 180; const hfov = 2 * Math.atan(Math.tan(vfov / 2) * this.camera.aspect); const limit = Math.min(vfov, hfov); this._fitZ = (this._radius / Math.sin(limit / 2)) * 1.14; this.camZ = this._fitZ }
  fitCamera() { const b = new THREE.Box3().setFromObject(this.garment); const c = b.getCenter(new THREE.Vector3()); const sz = b.getSize(new THREE.Vector3()); this._radius = 0.5 * Math.sqrt(sz.x * sz.x + sz.y * sz.y + sz.z * sz.z); this.lookY = c.y; this.applyFit() }

  // ---- garment ----
  extrude(rightPts, depth) { const sh = new THREE.Shape(); sh.moveTo(rightPts[0][0], rightPts[0][1]); for (let i = 1; i < rightPts.length; i++) sh.lineTo(rightPts[i][0], rightPts[i][1]); for (let i = rightPts.length - 2; i >= 1; i--) sh.lineTo(-rightPts[i][0], rightPts[i][1]); sh.closePath(); const bs = Math.min(0.16, depth * 0.46); const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelThickness: bs, bevelSize: bs, bevelSegments: 8, steps: 1, curveSegments: 56 }); g.center(); this.planarUV(g); return g }
  // Wrap a flat extruded slab around a vertical cylinder so the chest/back curve like a
  // torso — the surface normals then vary across X and it stops reading as a flat panel.
  bendY(geo, R) {
    const pos = geo.attributes.position, nor = geo.attributes.normal
    const v = new THREE.Vector3(), n = new THREE.Vector3()
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i)
      const ang = v.x / R, r = R + v.z, c = Math.cos(ang), s = Math.sin(ang)
      pos.setXYZ(i, r * s, v.y, r * c - R)
      if (nor) { n.fromBufferAttribute(nor, i); nor.setXYZ(i, n.x * c + n.z * s, n.y, -n.x * s + n.z * c) } // reorient the original smooth normals — keeps shading smooth over coarse geometry
    }
    pos.needsUpdate = true; if (nor) nor.needsUpdate = true
  }
  // Map a LOCAL flat-slab coord to the bent world position (same math as zonePlacement),
  // so added details (collar, hem) hug the curved surface.
  bendPoint(lx, ly, lz, R = this._bendR) {
    if (!R) return new THREE.Vector3(lx, ly, lz)
    const ang = lx / R, rr = R + lz
    return new THREE.Vector3(rr * Math.sin(ang), ly, rr * Math.cos(ang) - R)
  }
  _ribbonGeo(a, b) {
    const n = a.length, pos = [], idx = []
    for (let i = 0; i < n; i++) { pos.push(a[i].x, a[i].y, a[i].z); pos.push(b[i].x, b[i].y, b[i].z) }
    for (let i = 0; i < n - 1; i++) { const o = i * 2; idx.push(o, o + 1, o + 2, o + 2, o + 1, o + 3) }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    geo.setIndex(idx); geo.computeVertexNormals()
    return geo
  }
  // Ribbed-knit material for collar/hem: clone of matDark + a 1D vertical-stripe bump.
  // Colour is kept in sync with matDark every frame in animate() (handles the tween).
  ribMat() {
    if (this._ribMat) return this._ribMat
    if (!this.matDark) return null
    const c = document.createElement('canvas'); c.width = 64; c.height = 8
    const x = c.getContext('2d')
    for (let i = 0; i < 64; i++) { const v = (i % 2 === 0) ? 90 : 200; x.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')'; x.fillRect(i, 0, 1, 8) }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(40, 1)
    const base = this.matDark.clone(); base.bumpMap = t; base.bumpScale = 0.02
    this._ribMat = base
    return base
  }
  makeShadowSoft() {
    const c = document.createElement('canvas'); c.width = c.height = 256
    const x = c.getContext('2d')
    const g = x.createRadialGradient(128, 128, 8, 128, 128, 126)
    g.addColorStop(0, 'rgba(0,0,0,.16)'); g.addColorStop(.55, 'rgba(0,0,0,.06)'); g.addColorStop(1, 'rgba(0,0,0,0)')
    x.fillStyle = g; x.beginPath(); x.arc(128, 128, 128, 0, Math.PI * 2); x.fill()
    const t = new THREE.CanvasTexture(c); t.minFilter = THREE.LinearFilter; return t
  }
  // Sewn-garment structure: ribbed crew collar + bottom hem bands (front+back), bent to
  // the body. lz uses the real face depth (d/2): 0.25 tee/polo, 0.31 hoodie.
  addGarmentDetails(product) {
    if (product === 'cap') return
    const g = this.garment
    const fZ = (product === 'hoodie') ? 0.31 : 0.25
    const rib = this.ribMat(); if (!rib) return
    if (product === 'tee' || product === 'hoodie') {
      const halfW = product === 'hoodie' ? 0.30 : 0.26
      const topY = product === 'hoodie' ? 1.02 : 1.04
      const dipY = product === 'hoodie' ? 0.84 : 0.88
      const N = 28, pts = []
      for (let i = 0; i <= N; i++) {
        const t = i / N, lx = -halfW + 2 * halfW * t
        const ly = dipY + (topY - dipY) * (4 * (t - 0.5) * (t - 0.5))
        pts.push(this.bendPoint(lx, ly, fZ + 0.012))
      }
      const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.0)
      g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.028, 10, false), rib))
    }
    {
      const bottomY = product === 'hoodie' ? -1.30 : -1.22
      const halfW = product === 'hoodie' ? 0.74 : 0.62
      const N = 40
      const topF = [], botF = [], topB = [], botB = []
      for (let i = 0; i <= N; i++) {
        const lx = -halfW + 2 * halfW * (i / N)
        topF.push(this.bendPoint(lx, bottomY + 0.075, fZ + 0.010))
        botF.push(this.bendPoint(lx, bottomY, fZ + 0.010))
        topB.push(this.bendPoint(lx, bottomY + 0.075, -fZ - 0.010))
        botB.push(this.bendPoint(lx, bottomY, -fZ - 0.010))
      }
      g.add(new THREE.Mesh(this._ribbonGeo(topF, botF), rib))
      g.add(new THREE.Mesh(this._ribbonGeo(botB, topB), rib))
    }
  }
  clearGarment() { if (this.garment) { this.garment.traverse(o => { if (o.geometry) o.geometry.dispose() }); this.root.remove(this.garment) } this.garment = new THREE.Group(); this.root.add(this.garment) }
  buildGarment(product) {
    this.clearGarment(); const g = this.garment; this._bendR = null
    // Per-fabric knit density (texture repeat) + relief strength (normalScale).
    const fab = product === 'hoodie' ? { rep: [4, 5], ns: 0.62 } : product === 'cap' ? { rep: [7, 8], ns: 0.42 } : { rep: [5, 6], ns: 0.5 }
    if (this.fabricN) { this.fabricN.normal.repeat.set(fab.rep[0], fab.rep[1]); this.fabricN.rough.repeat.set(fab.rep[0], fab.rep[1]) }
    if (this.mat) { this.mat.normalScale.set(fab.ns, fab.ns); this.matDark.normalScale.set(fab.ns, fab.ns) }
    if (product === 'tee' || product === 'polo') {
      const pts = product === 'polo'
        ? [[0, 1.00], [0.16, 1.07], [0.34, 1.19], [0.52, 1.21], [1.00, 1.04], [1.12, 0.80], [0.76, 0.66], [0.64, 0.30], [0.60, -0.30], [0.58, -0.92], [0.60, -1.18], [0, -1.22]]
        : [[0, 1.02], [0.16, 1.10], [0.34, 1.22], [0.52, 1.24], [1.06, 1.06], [1.18, 0.80], [0.78, 0.66], [0.66, 0.30], [0.62, -0.30], [0.60, -0.92], [0.62, -1.20], [0, -1.24]]
      this._bendR = 2.5; { const body = this.extrude(pts, 0.5); this.bendY(body, this._bendR); g.add(new THREE.Mesh(body, this.mat)) }
      if (product === 'polo') {
        const cg = new THREE.Shape(); cg.moveTo(0, 0); cg.lineTo(0.30, 0.06); cg.lineTo(0.16, -0.26); cg.closePath()
        const cgeo = new THREE.ExtrudeGeometry(cg, { depth: 0.05, bevelEnabled: false })
        const cl = new THREE.Mesh(cgeo, this.matDark); cl.position.set(0.02, 1.06, 0.27); g.add(cl)
        const cr = new THREE.Mesh(cgeo, this.matDark); cr.scale.x = -1; cr.position.set(-0.02, 1.06, 0.27); g.add(cr)
        const pl = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.42, 0.05), this.matDark); pl.position.set(0, 0.84, 0.28); g.add(pl)
        const bgeo = new THREE.SphereGeometry(0.028, 12, 12);[0.96, 0.74].forEach(y => { const b = new THREE.Mesh(bgeo, this.matDark); b.position.set(0, y, 0.31); g.add(b) })
      }
    } else if (product === 'hoodie') {
      const pts = [[0, 1.00], [0.18, 1.08], [0.42, 1.20], [0.62, 1.21], [1.12, 1.04], [1.16, 0.55], [1.14, -0.45], [0.90, -0.52], [0.74, 0.42], [0.72, -0.10], [0.74, -1.28], [0, -1.32]]
      this._bendR = 2.8; { const body = this.extrude(pts, 0.62); this.bendY(body, this._bendR); g.add(new THREE.Mesh(body, this.mat)) }
      const hood = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.19, 20, 40, Math.PI * 1.15), this.mat); hood.position.set(0, 1.06, -0.10); hood.rotation.z = Math.PI; g.add(hood)
      const pk = new THREE.Shape(); const w = 0.46, h = 0.30, r = 0.07; pk.moveTo(-w + r, -h); pk.lineTo(w - r, -h); pk.quadraticCurveTo(w, -h, w, -h + r); pk.lineTo(w, h - r); pk.quadraticCurveTo(w, h, w - r, h); pk.lineTo(-w + r, h); pk.quadraticCurveTo(-w, h, -w, h - r); pk.lineTo(-w, -h + r); pk.quadraticCurveTo(-w, -h, -w + r, -h)
      const pkm = new THREE.Mesh(new THREE.ExtrudeGeometry(pk, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 }), this.matDark); pkm.position.set(0, -0.66, 0.34); g.add(pkm)
      const sg = new THREE.CylinderGeometry(0.018, 0.018, 0.5, 8);[-0.12, 0.12].forEach(xx => { const s = new THREE.Mesh(sg, this.matDark); s.position.set(xx, 0.66, 0.34); g.add(s) })
    } else if (product === 'cap') {
      const crown = new THREE.Mesh(new THREE.SphereGeometry(1.0, 40, 28, 0, Math.PI * 2, 0, Math.PI * 0.52), this.mat); crown.scale.set(1.0, 0.82, 1.05); crown.position.y = -0.15; g.add(crown)
      const btn = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), this.matDark); btn.position.set(0, 0.66, 0); g.add(btn)
      const bill = new THREE.Shape(); bill.absarc(0, 0, 1.18, Math.PI * 0.18, Math.PI * 0.82, false); bill.absarc(0, 0, 0.55, Math.PI * 0.82, Math.PI * 0.18, true); bill.closePath()
      const billMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(bill, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.04, bevelSegments: 2, curveSegments: 24 }), this.mat); billMesh.rotation.x = Math.PI * 0.62; billMesh.position.set(0, -0.34, 0.30); g.add(billMesh)
      g.position.y = 0.1
    }
    const box = new THREE.Box3().setFromObject(g); this.frontZ = box.max.z; this.backZ = box.min.z
    this.addGarmentDetails(product)
    this.shadow.position.y = box.min.y + g.position.y - 0.04; this.shadow.scale.setScalar(Math.max(1, (box.max.x - box.min.x) * 0.62))
    if (this.shadowSoft) { this.shadowSoft.position.y = this.shadow.position.y - 0.02; this.shadowSoft.scale.setScalar(this.shadow.scale.x * 1.25) }
    this.fitCamera()
    this.placeAllPrints()
  }

  // ---- zones ----
  zonesFor(product) {
    const t = STUDIO_STR[this.props.lang || 'ru']
    if (product === 'cap') return [{ key: 'front', label: t.zoneCapFront, short: t.zoneCapFront }, { key: 'back', label: t.zoneCapBack, short: t.zoneCapBack }, { key: 'lside', label: t.zoneCapLeftSide, short: t.zoneCapLeftSideShort }, { key: 'rside', label: t.zoneCapRightSide, short: t.zoneCapRightSideShort }]
    return [{ key: 'front', label: t.zoneChest, short: t.zoneChest }, { key: 'leftChest', label: t.zoneLeftChest, short: t.zoneLeftChestShort }, { key: 'back', label: t.zoneBack, short: t.zoneBack }, { key: 'lsleeve', label: t.zoneLeftSleeve, short: t.zoneLeftSleeveShort }, { key: 'rsleeve', label: t.zoneRightSleeve, short: t.zoneRightSleeveShort }]
  }
  zoneLabel(zone) { const z = this.zonesFor(this.state.product).find(z => z.key === zone); return z ? z.label : zone }
  zoneShort(zone) { const z = this.zonesFor(this.state.product).find(z => z.key === zone); return z ? z.short : zone }
  zonePlacement(product, zone) {
    const fZ = this.frontZ, bZ = this.backZ, gy = this.garment ? this.garment.position.y : 0
    if (product === 'cap') {
      if (zone === 'front') return { pos: [0, 0.12 + gy, fZ], rotY: 0, base: 0.48 }
      if (zone === 'back') return { pos: [0, 0.16 + gy, bZ], rotY: Math.PI, base: 0.46 }
      if (zone === 'lside') return { pos: [-0.92, 0.05 + gy, 0], rotY: Math.PI / 2, base: 0.3 }
      if (zone === 'rside') return { pos: [0.92, 0.05 + gy, 0], rotY: -Math.PI / 2, base: 0.3 }
      return null
    }
    const fO = product === 'hoodie' ? 0.34 : 0.42; const fBase = product === 'hoodie' ? 0.72 : 0.8
    let a = null
    if (zone === 'front') a = { lx: 0, ly: fO, back: false, base: fBase }
    else if (zone === 'leftChest') a = { lx: -0.34, ly: 0.62, back: false, base: 0.3 }
    else if (zone === 'back') a = { lx: 0, ly: 0.34, back: true, base: fBase }
    else if (zone === 'lsleeve') a = { lx: -0.86, ly: 0.5, back: false, base: 0.34 }
    else if (zone === 'rsleeve') a = { lx: 0.86, ly: 0.5, back: false, base: 0.34 }
    if (!a) return null
    const lz = a.back ? bZ : fZ; const R = this._bendR
    if (R) { const ang = a.lx / R, rr = R + lz; return { pos: [rr * Math.sin(ang), a.ly, rr * Math.cos(ang) - R], rotY: a.back ? ang + Math.PI : ang, base: a.base } }
    return { pos: [a.lx, a.ly, lz], rotY: a.back ? Math.PI : 0, base: a.base }
  }
  orbitToZone(zone) {
    const m = { front: -0.42, leftChest: -0.42, back: Math.PI - 0.3, lsleeve: -1.0, rsleeve: 1.0, lside: -1.3, rside: 1.3 }
    if (m[zone] !== undefined) this.targetRotY = m[zone]
    this.lastInteract = performance.now()
  }

  // ---- prints ----
  getPrint(id) { return this.prints.find(p => p.id === id) }
  selected() { return this.getPrint(this.state.selectedId) }
  firstFreeZone() { const zk = this.zonesFor(this.state.product).map(z => z.key); const used = this.prints.map(p => p.zone); return zk.find(z => used.indexOf(z) < 0) }
  makePrintMesh(p) {
    const mat = new THREE.MeshStandardMaterial({ map: p.tex, transparent: true, alphaTest: 0.02, roughness: 0.5, metalness: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -6, polygonOffsetUnits: -6 })
    const pivot = new THREE.Group(); const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat); pivot.add(mesh); this.root.add(pivot)
    p.pivot = pivot; p.mesh = mesh; p.mat = mat
  }
  addPrint(zone, kind) {
    const z = zone || this.firstFreeZone(); if (!z) return
    const k = (kind != null) ? kind : (this.prints.length % 3); const s = this.samples[k]
    const p = { id: 'p' + (++this._pid), zone: z, method: 'dtf', tex: s.tex, url: s.url, kind: k, scale: 0.52, rot: 0, px: 0, py: 0 }
    this.makePrintMesh(p); this.prints.push(p)
    this.placePrint(p); this.applyMethodToPrint(p); this.updatePrintTransform(p)
    this._select(p.id, true)
  }
  removePrint() {
    const id = this.state.selectedId; const i = this.prints.findIndex(p => p.id === id); if (i < 0) return
    const p = this.prints[i]; this.root.remove(p.pivot); p.mesh.geometry.dispose(); p.mat.dispose()
    this.prints.splice(i, 1)
    const next = this.prints.length ? this.prints[Math.max(0, i - 1)].id : null
    this._select(next, false)
  }
  _select(id, orbit) {
    this.state.selectedId = id; const p = this.getPrint(id)
    if (p) {
      if (this.scaleRef.current) this.scaleRef.current.value = Math.round(p.scale * 100)
      if (this.rotRef.current) this.rotRef.current.value = Math.round(p.rot)
      if (this.thumbRef.current) this.thumbRef.current.src = p.url
      if (orbit) this.orbitToZone(p.zone)
    } else if (this.thumbRef.current) { this.thumbRef.current.removeAttribute('src') }
    this.sync()
  }
  selectPrint(id) { this._select(id, true) }
  placeAllPrints() {
    const valid = this.zonesFor(this.state.product).map(z => z.key)
    const used = []; const pending = []
    this.prints.forEach(p => { if (valid.indexOf(p.zone) >= 0 && used.indexOf(p.zone) < 0) { used.push(p.zone) } else { pending.push(p) } })
    pending.forEach(p => { const free = valid.find(z => used.indexOf(z) < 0); if (free) { p.zone = free; used.push(free) } })
    this.prints.forEach(p => this.placePrint(p))
    this.sync()
  }
  placePrint(p) {
    const pl = this.zonePlacement(this.state.product, p.zone)
    if (!pl) { p.pivot.visible = false; return }
    p.pivot.visible = true; p.base = pl.base
    if (!p.targetPos) p.targetPos = new THREE.Vector3()
    p.targetPos.set(pl.pos[0], pl.pos[1], pl.pos[2]); p.targetRotY = pl.rotY
    // First placement (or reduced motion) snaps; only subsequent zone CHANGES tween.
    if (!p._placed || prefersReducedMotion()) {
      p.pivot.position.copy(p.targetPos); p.pivot.rotation.set(0, p.targetRotY, 0); p._placed = true
    } else {
      p.pivot.rotation.x = 0; p.pivot.rotation.z = 0
    }
    this.updatePrintTransform(p)
  }
  updatePrintTransform(p) {
    const s = p.base * (0.45 + p.scale * 1.25); p.mesh.scale.set(s, s, 1); p.mesh.rotation.z = p.rot * Math.PI / 180
    const lim = p.base * 0.7; p.mesh.position.set(Math.max(-lim, Math.min(lim, p.px)), Math.max(-lim, Math.min(lim, p.py)), (p.method === 'emb') ? 0.03 : 0.014)
  }
  applyMethodToPrint(p) {
    const m = p.mat
    if (p.method === 'emb') { m.roughness = 0.7; m.metalness = 0.05; m.bumpMap = p.tex; m.bumpScale = 0.06 }
    else if (p.method === 'silk') { m.roughness = 0.9; m.metalness = 0; m.bumpMap = null; m.bumpScale = 0 }
    else { m.roughness = 0.5; m.metalness = 0; m.bumpMap = null; m.bumpScale = 0 }
    m.needsUpdate = true; this.updatePrintTransform(p)
  }
  setZone(zone) { const p = this.selected(); if (!p) return; const other = this.prints.find(q => q.zone === zone && q.id !== p.id); if (other) return; p.zone = zone; this.placePrint(p); this.orbitToZone(zone); this.sync() }
  setMethod(m) { const p = this.selected(); if (!p) return; p.method = m; this.applyMethodToPrint(p); this.sync() }
  setSample(i) { const p = this.selected(); if (!p) return; const s = this.samples[i]; p.tex = s.tex; p.url = s.url; p.kind = i; p.mat.map = s.tex; if (p.method === 'emb') p.mat.bumpMap = s.tex; p.mat.needsUpdate = true; if (this.thumbRef.current) this.thumbRef.current.src = s.url; this.sync() }
  onFile(e) { const f = e.target.files && e.target.files[0]; if (!f) return; const p = this.selected(); if (!p) return; const rd = new FileReader(); rd.onload = () => { const img = new Image(); img.onload = () => { const t = new THREE.Texture(img); this.setSRGB(t); t.anisotropy = 4; t.needsUpdate = true; p.tex = t; p.url = rd.result; p.kind = -1; p.mat.map = t; if (p.method === 'emb') p.mat.bumpMap = t; p.mat.needsUpdate = true; if (this.thumbRef.current) this.thumbRef.current.src = rd.result; this.sync() }; img.src = rd.result }; rd.readAsDataURL(f); e.target.value = '' }
  onScale(e) { const p = this.selected(); if (!p) return; p.scale = parseFloat(e.target.value) / 100; this.updatePrintTransform(p) }
  onRotate(e) { const p = this.selected(); if (!p) return; p.rot = parseFloat(e.target.value); this.updatePrintTransform(p) }
  triggerUpload() { this.fileRef.current && this.fileRef.current.click() }
  sync() { this.uiTick = (this.uiTick || 0) + 1; this.setState({ printsView: this.prints.map(p => ({ id: p.id, zone: p.zone, method: p.method, url: p.url })), selectedId: this.state.selectedId }) }

  // ---- pointer ----
  ndc(e) { const r = this.renderer.domElement.getBoundingClientRect(); return new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1) }
  onDown(e) {
    this.renderer.domElement.setPointerCapture && this.renderer.domElement.setPointerCapture(e.pointerId)
    this.lastInteract = performance.now()
    const meshes = this.prints.filter(p => p.pivot.visible).map(p => p.mesh)
    if (meshes.length) { this.ray.setFromCamera(this.ndc(e), this.camera); const hit = this.ray.intersectObjects(meshes, false); if (hit.length) { const p = this.prints.find(pp => pp.mesh === hit[0].object); this._select(p.id, false); this.drag = { mode: 'design', p }; this.hostRef.current.style.cursor = 'move'; return } }
    this.drag = { mode: 'orbit', x: e.clientX, y: e.clientY }; this.hostRef.current.style.cursor = 'grabbing'
  }
  onMove(e) {
    if (!this.drag) return; this.lastInteract = performance.now()
    if (this.drag.mode === 'orbit') { const dx = e.clientX - this.drag.x, dy = e.clientY - this.drag.y; this.targetRotY += dx * 0.01; this.targetRotX = Math.max(-0.6, Math.min(0.6, this.targetRotX + dy * 0.008)); this.drag.x = e.clientX; this.drag.y = e.clientY }
    else { const p = this.drag.p; this.ray.setFromCamera(this.ndc(e), this.camera); const n = new THREE.Vector3(0, 0, 1).applyQuaternion(p.pivot.getWorldQuaternion(new THREE.Quaternion())); this.plane.setFromNormalAndCoplanarPoint(n, p.pivot.getWorldPosition(new THREE.Vector3())); const hit = new THREE.Vector3(); if (this.ray.ray.intersectPlane(this.plane, hit)) { const local = p.pivot.worldToLocal(hit.clone()); p.px = local.x; p.py = local.y; this.updatePrintTransform(p) } }
  }
  onUp() { this.drag = null; if (this.hostRef.current) this.hostRef.current.style.cursor = 'grab'; this.lastInteract = performance.now() }

  // ---- loop ----
  animate() {
    this._raf = requestAnimationFrame(() => this.animate())
    const idle = performance.now() - this.lastInteract > 2600
    if (this.state.autoRotate && idle && !this.drag) this.targetRotY += 0.0032
    this.root.rotation.y += (this.targetRotY - this.root.rotation.y) * 0.1
    this.root.rotation.x += (this.targetRotX - this.root.rotation.x) * 0.1
    this.camera.position.z += (this.camZ - this.camera.position.z) * 0.1
    this.camera.lookAt(0, this.lookY || 0, 0)

    // --- colour tween: lerp BOTH materials toward their targets in lock-step ---
    if (this._colorTweening && this.mat && this._targetColor) {
      this.mat.color.lerp(this._targetColor, 0.14)
      this.matDark.color.lerp(this._targetColorDark, 0.14)
      const d1 = Math.abs(this.mat.color.r - this._targetColor.r) + Math.abs(this.mat.color.g - this._targetColor.g) + Math.abs(this.mat.color.b - this._targetColor.b)
      const d2 = Math.abs(this.matDark.color.r - this._targetColorDark.r) + Math.abs(this.matDark.color.g - this._targetColorDark.g) + Math.abs(this.matDark.color.b - this._targetColorDark.b)
      if (d1 < 0.004 && d2 < 0.004) { this.mat.color.copy(this._targetColor); this.matDark.color.copy(this._targetColorDark); this._colorTweening = false }
    }
    // keep the ribbed collar/hem material colour locked to matDark (incl. during the tween)
    if (this._ribMat) this._ribMat.color.copy(this.matDark.color)

    // --- garment product-swap cross-scale ---
    if (this._swap && this.garment) {
      const sw = this._swap
      if (sw.phase === 'out') {
        const g = this.garment
        g.scale.multiplyScalar(0.78)
        this.mat.opacity += (0 - this.mat.opacity) * 0.3; this.matDark.opacity = this.mat.opacity
        if (g.scale.x < 0.06) {
          // Trough — build the new garment EXACTLY once, then scale it back up.
          this.buildGarment(sw.product); sw.built = true
          // buildGarment→placeAllPrints re-shows the decals; keep them hidden until settle.
          this.prints.forEach(q => { if (q.pivot) q.pivot.visible = false })
          this.mat.transparent = true; this.matDark.transparent = true
          this.garment.scale.setScalar(0.6)
          this.mat.opacity = 0; this.matDark.opacity = 0
          sw.phase = 'in'
        }
      } else {
        const g = this.garment
        g.scale.x += (1 - g.scale.x) * 0.22; g.scale.y = g.scale.x; g.scale.z = g.scale.x
        this.mat.opacity += (1 - this.mat.opacity) * 0.22; this.matDark.opacity = this.mat.opacity
        if (g.scale.x > 0.992 && this.mat.opacity > 0.99) {
          g.scale.setScalar(1); this.mat.opacity = 1; this.matDark.opacity = 1
          this.mat.transparent = false; this.matDark.transparent = false
          this._swap = null
          this.prints.forEach(q => this.placePrint(q))
        }
      }
    }

    // --- decal zone tween: ease pivot toward its stored target ---
    if (!this._swap) {
      const prm = prefersReducedMotion()
      for (let i = 0; i < this.prints.length; i++) {
        const p = this.prints[i]
        if (!p.pivot || !p.pivot.visible || !p.targetPos || !p._placed) continue
        if (prm) { p.pivot.position.copy(p.targetPos); p.pivot.rotation.y = p.targetRotY; continue }
        p.pivot.position.lerp(p.targetPos, 0.12)
        let dy = p.targetRotY - p.pivot.rotation.y
        while (dy > Math.PI) dy -= Math.PI * 2
        while (dy < -Math.PI) dy += Math.PI * 2
        p.pivot.rotation.y += dy * 0.12
      }
    }

    this.renderer.render(this.scene, this.camera)
  }

  // ---- product/color/view ----
  setProduct(p) {
    if (p === this.state.product && !this._swap) return
    // Rebuild immediately — reliable across all four garments + the print decals.
    this._swap = null
    if (this.mat) { this.mat.transparent = false; this.mat.opacity = 1; this.matDark.transparent = false; this.matDark.opacity = 1 }
    this.setState({ product: p }, () => this.buildGarment(p))
  }
  // Instantly settle an in-flight swap: build (if not yet) and restore visuals.
  _finishSwap() {
    const sw = this._swap; if (!sw) return
    if (!sw.built) { this.buildGarment(sw.product); sw.built = true }
    this._swap = null
    if (this.garment) this.garment.scale.setScalar(1)
    this.mat.opacity = 1; this.matDark.opacity = 1
    this.mat.transparent = false; this.matDark.transparent = false
    this.prints.forEach(q => this.placePrint(q))
  }
  pickColor(hex) {
    this.uiTick = (this.uiTick || 0) + 1; this.setState({ color: hex })
    if (!this.mat) return
    if (this._targetColor) this._targetColor.set(hex); else this._targetColor = new THREE.Color(hex)
    const darkHex = this.darken(hex, 0.86)
    if (this._targetColorDark) this._targetColorDark.set(darkHex); else this._targetColorDark = new THREE.Color(darkHex)
    if (prefersReducedMotion()) { this.mat.color.copy(this._targetColor); this.matDark.color.copy(this._targetColorDark); this._colorTweening = false }
    else { this._colorTweening = true }
  }
  toggleAuto() { this.setState(s => ({ autoRotate: !s.autoRotate })); this.lastInteract = 0 }
  resetView() { this.targetRotY = -0.42; this.targetRotX = -0.02; this.camZ = this._fitZ || 6.4; this.lastInteract = performance.now() }
  openSummary() { this.setState({ summaryOpen: true, sent: false, closing: false }) }
  closeSummary() {
    if (prefersReducedMotion()) { this.setState({ summaryOpen: false, closing: false }); return }
    this.setState({ closing: true })
    setTimeout(() => { if (this._alive) this.setState({ summaryOpen: false, closing: false }) }, 190)
  }
  submitOrder(e) {
    e.preventDefault()
    const f = e.target
    const payload = {
      product: { tee: 'Футболка', hoodie: 'Худи', polo: 'Поло', cap: 'Кепка' }[this.state.product],
      color: this.state.color,
      prints: this.prints.map(p => ({ zone: this.zoneLabel(p.zone), method: p.method })),
      name: (f.elements[0] && f.elements[0].value) || '',
      phone: (f.elements[1] && f.elements[1].value) || '',
      qty: (f.elements[2] && f.elements[2].value) || '',
    }
    try { if (runtime.orderEndpoint) { fetch(runtime.orderEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {}) } } catch (_) {}
    this.setState({ sent: true })
  }
  stop(e) { e.stopPropagation() }

  // ---- styles ----
  seg(active) { return `display:flex;flex-direction:column;align-items:center;gap:5px;flex:1;min-width:0;padding:12px 4px;border-radius:13px;border:1.5px solid ${active ? '#15120D' : '#E2D9C8'};background:${active ? '#15120D' : '#fff'};color:${active ? '#F5EFE5' : '#15120D'};cursor:pointer;font-weight:700;font-size:11.5px;line-height:1.1;transition:all .15s;` }
  meth(active) { const a = this.props.accent || '#FCAC45'; return `display:flex;flex-direction:column;align-items:center;gap:1px;flex:1;padding:9px 4px;border-radius:11px;border:1.5px solid ${active ? a : '#E2D9C8'};background:${active ? '#FCEFD9' : '#fff'};color:#15120D;cursor:pointer;transition:all .15s;` }
  zonePill(active, taken) { if (taken) return `padding:8px 12px;border-radius:9px;border:1.5px solid #ECE3D2;background:#F3EEE3;color:#BCB2A0;cursor:not-allowed;font-weight:700;font-size:12.5px;transition:all .15s;`; return `padding:8px 12px;border-radius:9px;border:1.5px solid ${active ? '#15120D' : '#E2D9C8'};background:${active ? '#15120D' : '#fff'};color:${active ? '#F5EFE5' : '#15120D'};cursor:pointer;font-weight:700;font-size:12.5px;transition:all .15s;` }
  chip(active) { const a = this.props.accent || '#FCAC45'; return `flex:none;width:70px;padding:6px;border-radius:12px;border:2px solid ${active ? a : '#E7DECF'};background:${active ? '#FFFDF8' : '#fff'};box-shadow:${active ? '0 0 0 3px ' + a + '33' : 'none'};cursor:pointer;display:flex;flex-direction:column;align-items:center;transition:all .12s;` }

  renderVals() {
    const st = this.state; const accent = this.props.accent || '#FCAC45'
    const t = STUDIO_STR[this.props.lang || 'ru']
    const colors = [{ name: t.colorWhite, hex: '#EEEAE0' }, { name: t.colorSand, hex: '#E0D2BB' }, { name: t.colorBlack, hex: '#1E1B16' }, { name: t.colorGraphite, hex: '#3C3A3B' }, { name: t.colorBlue, hex: '#27406E' }, { name: t.colorGreen, hex: '#235C40' }, { name: t.colorBurgundy, hex: '#6A2531' }, { name: t.colorGray, hex: '#9C968B' }, { name: t.colorAmber, hex: '#FCAC45' }, { name: t.colorRed, hex: '#B23A2E' }]
    const colorList = colors.map(c => ({ name: c.name, hex: c.hex, onClick: () => this.pickColor(c.hex), style: `width:34px;height:34px;border-radius:999px;background:${c.hex};cursor:pointer;padding:0;border:2px solid ${st.color === c.hex ? accent : 'rgba(0,0,0,.14)'};box-shadow:${st.color === c.hex ? '0 0 0 3px ' + accent + '44' : 'none'};transition:all .12s;` }))
    const cname = (colors.find(c => c.hex === st.color) || {}).name || t.colorFallbackLabel
    const pLabel = { tee: t.productTee, hoodie: t.productHoodie, polo: t.productPolo, cap: t.productCap }[st.product]

    const methodLabel = { emb: t.methodEmbLabel, dtf: t.methodDtfLabel, silk: t.methodSilkLabel }
    const methodShort = { emb: t.methodEmbShort, dtf: t.methodDtfShort, silk: t.methodSilkShort }
    const methodDot = { emb: '#15120D', dtf: '#FCAC45', silk: '#9C968B' }
    const methodTint = { emb: '#ECE7DC', dtf: '#FCEFD9', silk: '#EBEAE4' }
    const pv = st.printsView
    const chips = pv.map(p => ({ id: p.id, short: this.zoneShort(p.zone), methodShort: methodShort[p.method], dot: methodDot[p.method], tint: methodTint[p.method], onClick: () => this.selectPrint(p.id), style: this.chip(p.id === st.selectedId) }))
    const count = pv.length
    const plural = (n) => { const a = n % 10, b = n % 100; return (a === 1 && b !== 11) ? 'принт' : (a >= 2 && a <= 4 && !(b >= 12 && b <= 14)) ? 'принта' : 'принтов' }
    const printsCountLabel = count + ' ' + (this.props.lang === 'uz' ? 'ta print' : plural(count))
    const printsSummary = count ? pv.map(p => this.zoneShort(p.zone)).join(' · ') : t.printsSummaryEmpty
    const printRows = pv.map(p => ({ short: this.zoneShort(p.zone), tint: methodTint[p.method], zone: this.zoneLabel(p.zone), method: methodLabel[p.method] }))

    const sel = this.selected()
    const zoneList = this.zonesFor(st.product).map(z => { const occ = this.prints.find(p => p.zone === z.key); const isSel = sel && sel.zone === z.key; const taken = occ && (!sel || occ.id !== sel.id); return { label: z.label, onClick: taken ? (() => {}) : (() => this.setZone(z.key)), style: this.zonePill(isSel, taken) } })

    return {
      loading: st.loading, loadingMounted: !st.loadingHidden, autoRotate: st.autoRotate,
      summaryOpen: st.summaryOpen, sent: st.sent, notSent: !st.sent, closing: st.closing,
      productLabel: pLabel, colorName: cname,
      colorList, chips, zoneList,
      canAdd: count < this.zonesFor(st.product).length,
      noPrints: count === 0,
      hasSelected: !!sel,
      selUrl: sel ? sel.url : null,
      selZoneLabel: sel ? this.zoneLabel(sel.zone) : '',
      printsCountLabel, printsSummary, printRows,
      priceLabel: t.priceLabelOnRequest,
      addPrint: () => this.addPrint(), removePrint: () => this.removePrint(),
      sample0: () => this.setSample(0), sample1: () => this.setSample(1), sample2: () => this.setSample(2),
      onScale: (e) => this.onScale(e), onRotate: (e) => this.onRotate(e), onFile: (e) => this.onFile(e), triggerUpload: () => this.triggerUpload(),
      toggleAuto: () => this.toggleAuto(), resetView: () => this.resetView(),
      openSummary: () => this.openSummary(), closeSummary: () => this.closeSummary(), submitOrder: (e) => this.submitOrder(e), stop: (e) => this.stop(e),
      isTee: st.product === 'tee', isHoodie: st.product === 'hoodie', isPolo: st.product === 'polo', isCap: st.product === 'cap',
      pickTee: () => this.setProduct('tee'), pickHoodie: () => this.setProduct('hoodie'), pickPolo: () => this.setProduct('polo'), pickCap: () => this.setProduct('cap'),
      isEmb: !!sel && sel.method === 'emb', isDtf: !!sel && sel.method === 'dtf', isSilk: !!sel && sel.method === 'silk',
      methodEmb: () => this.setMethod('emb'), methodDtf: () => this.setMethod('dtf'), methodSilk: () => this.setMethod('silk'),
    }
  }

  render() {
    const v = this.renderVals()
    const t = STUDIO_STR[this.props.lang || 'ru']
    return (
      <>
        <style>{`
          @keyframes fp-spin{to{transform:rotate(360deg)}}
          @keyframes fp-modal-out{from{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(.94)}}
          @keyframes fp-scrim-out{from{opacity:1}to{opacity:0}}
          .fp-modal-out{animation:fp-modal-out .19s ease-in both}
          .fp-scrim-out{animation:fp-scrim-out .19s ease-in both}
          @media (prefers-reduced-motion:reduce){.fp-modal-out,.fp-scrim-out{animation:none!important}}
          .fp-chip-in{animation:fpChipIn .2s var(--fp-ease-out,ease-out) both}
          .fp-load-out{animation:fpFadeOut .34s ease-out both}
          @media (prefers-reduced-motion:reduce){.fp-load-out{animation:none!important}}
          .fp-studio{display:flex;flex-direction:column;height:100vh;height:100dvh;min-height:560px;overflow:hidden}
          .fp-studio input[type=range]{accent-color:#FCAC45;width:100%}
          .fp-studio ::-webkit-scrollbar{width:10px;height:10px}
          .fp-studio ::-webkit-scrollbar-thumb{background:#D8CDB8;border-radius:999px;border:3px solid transparent;background-clip:content-box}
          .fp-chips::-webkit-scrollbar{height:6px}
          .fp-main{flex:1;display:flex;min-height:0}
          .fp-stage{flex:1 1 460px;min-width:300px;position:relative;min-height:340px}
          .fp-panel{flex:1 1 380px;max-width:440px;min-width:320px;display:flex;flex-direction:column;min-height:0;background:#fff;border-left:1px solid rgba(21,18,13,.10)}
          .fp-scroll{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:22px 22px 8px}
          @media (max-width:880px){
            .fp-studio{height:auto;min-height:100vh;min-height:100dvh;overflow:visible}
            .fp-main{flex-direction:column}
            .fp-stage{flex:none;width:100%;height:58vh;min-height:320px}
            .fp-panel{flex:none;max-width:none;width:100%;border-left:0;border-top:1px solid rgba(21,18,13,.10)}
            .fp-scroll{overflow:visible}
          }
          @media (max-width:600px){
            .fp-top{padding:10px 14px!important;gap:12px!important;flex-wrap:nowrap}
            .fp-top-div,.fp-top-sub,.fp-top-title{display:none!important}
          }
        `}</style>

        <div className="fp-studio" style={css("background:#F5EFE5; color:#15120D; font-family:'Manrope',system-ui,sans-serif;")}>

          {/* TOP BAR */}
          <header className="fp-top" style={css('flex:none; display:flex; align-items:center; gap:18px; padding:12px 22px; border-bottom:1px solid rgba(21,18,13,.10); background:rgba(245,239,229,.9); backdrop-filter:blur(10px); z-index:6;')}>
            <Link to="/" aria-label={t.logoHomeAria} style={css('text-decoration:none; display:flex; align-items:center;')}><Logo variant="black" height={28} /></Link>
            <span className="fp-top-div" style={css('width:1px; height:24px; background:rgba(21,18,13,.14);')}></span>
            <div style={css('display:flex; flex-direction:column; line-height:1; min-width:0;')}>
              <span className="fp-top-title" style={css("font-family:'Oswald'; font-weight:600; text-transform:uppercase; font-size:15px; letter-spacing:.02em; white-space:nowrap;")}>{t.studioTitle}</span>
              <span className="fp-top-sub" style={css('font-size:11.5px; color:#988E7B; margin-top:2px;')}>{t.studioSubtitle}</span>
            </div>
            <div style={{ flex: 1 }}></div>
            <LangToggle />
            <div style={css('display:flex; gap:4px; background:#fff; border:1px solid #E7DECF; border-radius:999px; padding:4px;')}>
              <Link to="/lichnoe" style={css('color:#15120D; font-weight:700; font-size:12px; padding:7px 14px; border-radius:999px; letter-spacing:.04em; text-decoration:none;')}>{t.navPersonal}</Link>
              <Link to="/biznesu" style={css('color:#15120D; font-weight:700; font-size:12px; padding:7px 14px; border-radius:999px; letter-spacing:.04em; text-decoration:none;')}>{t.navBusiness}</Link>
            </div>
          </header>

          {/* MAIN SPLIT */}
          <div className="fp-main">

            {/* STUDIO */}
            <div className="fp-stage">
              <div ref={this.hostRef} style={css('position:absolute; inset:0; touch-action:none; cursor:grab;')}></div>

              {v.loadingMounted && (
                <div className={v.loading ? undefined : 'fp-load-out'} style={css('position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; pointer-events:none;')}>
                  <div style={css('width:38px; height:38px; border:3px solid rgba(21,18,13,.15); border-top-color:#FCAC45; border-radius:999px; animation:fp-spin .8s linear infinite;')}></div>
                  <span style={css("font-family:'Oswald'; font-weight:600; text-transform:uppercase; font-size:13px; letter-spacing:.08em; color:#988E7B;")}>{t.loadingScene}</span>
                </div>
              )}

              <div style={css('position:absolute; left:18px; top:16px; display:flex; flex-direction:column; gap:7px; pointer-events:none;')}>
                <span style={css('display:inline-flex; align-items:center; gap:7px; background:rgba(255,255,255,.78); backdrop-filter:blur(6px); border:1px solid rgba(21,18,13,.08); color:#6F6655; font-size:12px; font-weight:600; padding:6px 11px; border-radius:999px; width:max-content;')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C97A14" strokeWidth="2"><path d="M12 3v6M12 3l-3 3M12 3l3 3M3 12h6M21 12h-6M12 21v-6" /></svg>
                  {t.hintDragRotate}
                </span>
                <span style={css('display:inline-flex; align-items:center; gap:7px; background:rgba(255,255,255,.78); backdrop-filter:blur(6px); border:1px solid rgba(21,18,13,.08); color:#6F6655; font-size:12px; font-weight:600; padding:6px 11px; border-radius:999px; width:max-content;')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C97A14" strokeWidth="2"><path d="M5 12h14M12 5v14" strokeLinecap="round" /></svg>
                  {t.hintTapPrint}
                </span>
              </div>

              <div style={css('position:absolute; left:18px; bottom:18px; display:flex; gap:8px; align-items:center;')}>
                <button onClick={v.toggleAuto} style={css(v.autoRotate
                  ? 'display:inline-flex;align-items:center;gap:7px;padding:9px 15px;border-radius:999px;border:1px solid #15120D;background:#15120D;color:#F5EFE5;cursor:pointer;font-weight:700;font-size:12.5px;'
                  : 'display:inline-flex;align-items:center;gap:7px;padding:9px 15px;border-radius:999px;border:1px solid rgba(21,18,13,.12);background:rgba(255,255,255,.85);color:#15120D;cursor:pointer;font-weight:700;font-size:12.5px;')}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 3-6.7M3 4v4h4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  {t.btnAutoRotate}
                </button>
                <button onClick={v.resetView} title={t.btnResetViewTitle} style={css('display:inline-flex; align-items:center; justify-content:center; width:38px; height:38px; border-radius:999px; border:1px solid rgba(21,18,13,.12); background:rgba(255,255,255,.85); color:#15120D; cursor:pointer;')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 1 2.6 6.3M3 21v-4h4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </div>

              <div style={css('position:absolute; right:18px; bottom:18px; pointer-events:none;')}>
                <span style={css("display:inline-flex; align-items:center; gap:8px; background:#15120D; color:#F5EFE5; font-family:'Oswald'; font-weight:600; text-transform:uppercase; font-size:12px; letter-spacing:.06em; padding:8px 14px; border-radius:999px;")}>
                  <span style={css('width:8px; height:8px; border-radius:999px; background:#FCAC45;')}></span>{v.productLabel} · {v.colorName}
                </span>
              </div>
            </div>

            {/* CONTROL PANEL */}
            <aside className="fp-panel">
              <div className="fp-scroll">

                {/* PRODUCT */}
                <div style={css('margin-bottom:22px;')}>
                  <div style={css('display:flex; align-items:center; gap:8px; margin-bottom:11px;')}><span style={css("width:22px; height:22px; border-radius:999px; background:#15120D; color:#FCAC45; display:grid; place-items:center; font-family:'Oswald'; font-weight:600; font-size:12px;")}>1</span><span style={css("font-family:'Oswald'; font-weight:600; text-transform:uppercase; font-size:14px; letter-spacing:.03em;")}>{t.stepProduct}</span></div>
                  <div style={css('display:flex; gap:8px;')}>
                    <button onClick={v.pickTee} style={css(this.seg(v.isTee))}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M8 3 5 5 3 8l3 2v11h12V10l3-2-2-3-3-2-2 2H10z" strokeLinejoin="round" /></svg>{t.productTee}</button>
                    <button onClick={v.pickHoodie} style={css(this.seg(v.isHoodie))}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M8 3 4 6 2 10l3 2v9h14v-9l3-2-2-4-4-3M9 3c0 2 1.5 3 3 3s3-1 3-3" strokeLinejoin="round" /><path d="M12 12v5" strokeLinecap="round" /></svg>{t.productHoodie}</button>
                    <button onClick={v.pickPolo} style={css(this.seg(v.isPolo))}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M8 3 5 5 3 8l3 2v11h12V10l3-2-2-3-3-2-4 3-2-3z" strokeLinejoin="round" /><path d="M10 4v4l2 1 2-1V4" strokeLinejoin="round" /></svg>{t.productPolo}</button>
                    <button onClick={v.pickCap} style={css(this.seg(v.isCap))}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 15c1-6 5-9 9-9s8 3 8 8H12" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 15h9M20 14c1 0 1.6.7 1.6 1.5S21 17 20 17" strokeLinecap="round" /></svg>{t.productCap}</button>
                  </div>
                </div>

                {/* COLOR */}
                <div style={css('margin-bottom:22px;')}>
                  <div style={css('display:flex; align-items:center; gap:8px; margin-bottom:11px;')}><span style={css("width:22px; height:22px; border-radius:999px; background:#15120D; color:#FCAC45; display:grid; place-items:center; font-family:'Oswald'; font-weight:600; font-size:12px;")}>2</span><span style={css("font-family:'Oswald'; font-weight:600; text-transform:uppercase; font-size:14px; letter-spacing:.03em;")}>{t.stepColor}</span></div>
                  <div style={css('display:flex; flex-wrap:wrap; gap:10px;')}>
                    {v.colorList.map(c => <button key={c.hex} onClick={c.onClick} title={c.name} style={css(c.style)}></button>)}
                  </div>
                </div>

                {/* PRINTS */}
                <div style={css('margin-bottom:18px;')}>
                  <div style={css('display:flex; align-items:center; gap:8px; margin-bottom:11px;')}>
                    <span style={css("width:22px; height:22px; border-radius:999px; background:#15120D; color:#FCAC45; display:grid; place-items:center; font-family:'Oswald'; font-weight:600; font-size:12px;")}>3</span>
                    <span style={css("font-family:'Oswald'; font-weight:600; text-transform:uppercase; font-size:14px; letter-spacing:.03em;")}>{t.stepPrints}</span>
                    <span style={css('margin-left:auto; font-size:12px; font-weight:700; color:#988E7B;')}>{v.printsCountLabel}</span>
                  </div>

                  {/* chips */}
                  <div className="fp-chips" style={css('display:flex; gap:9px; overflow-x:auto; padding-bottom:6px; margin-bottom:4px;')}>
                    {v.chips.map(c => (
                      <button key={c.id} onClick={c.onClick} className="fp-chip-in" style={css(c.style)}>
                        <span style={css(`position:relative; width:100%; height:46px; border-radius:8px; background:${c.tint}; display:grid; place-items:center; overflow:hidden;`)}>
                          <span style={css("font-family:'Oswald'; font-weight:600; font-size:14px; color:#15120D;")}>{c.short}</span>
                          <span style={css(`position:absolute; right:3px; top:3px; width:9px; height:9px; border-radius:999px; background:${c.dot}; border:1.5px solid #fff;`)}></span>
                        </span>
                        <span style={css('font-size:10px; font-weight:700; line-height:1; margin-top:5px; white-space:nowrap; color:#857B69;')}>{c.methodShort}</span>
                      </button>
                    ))}
                    {v.canAdd && (
                      <button onClick={v.addPrint} title={t.btnAddPrintTitle} style={css('flex:none; width:70px; min-height:75px; border-radius:12px; border:1.5px dashed #C9BBA0; background:#FAF6EE; color:#C97A14; cursor:pointer; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px; font-size:10.5px; font-weight:700;')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>{t.btnAdd}
                      </button>
                    )}
                  </div>

                  {/* empty state */}
                  {v.noPrints && (
                    <button onClick={v.addPrint} style={css('width:100%; padding:18px; border-radius:13px; border:1.5px dashed #C9BBA0; background:#FAF6EE; color:#6F6655; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:6px;')}>
                      <span style={css("font-family:'Oswald'; font-weight:600; text-transform:uppercase; font-size:14px; color:#15120D;")}>{t.emptyAddFirst}</span>
                      <span style={css('font-size:12px;')}>{t.emptyAddFirstHint}</span>
                    </button>
                  )}

                  {/* selected print editor */}
                  {v.hasSelected && (
                    <div className="fp-slide-down" style={css('background:#FAF6EE; border:1px solid #EDE3CF; border-radius:15px; padding:15px; margin-top:6px;')}>
                      <div style={css('display:flex; align-items:center; justify-content:space-between; margin-bottom:13px;')}>
                        <span style={css("font-family:'Oswald'; font-weight:600; text-transform:uppercase; font-size:13px; letter-spacing:.03em;")}>{t.printEditorTitle} · {v.selZoneLabel}</span>
                        <button onClick={v.removePrint} style={css('display:inline-flex; align-items:center; gap:5px; background:transparent; border:0; color:#B23A2E; font-weight:700; font-size:12.5px; cursor:pointer; padding:4px;')}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          {t.btnRemovePrint}
                        </button>
                      </div>

                      {/* design */}
                      <div style={css('display:flex; gap:11px; align-items:stretch; margin-bottom:14px;')}>
                        <div style={css("flex:none; width:72px; height:72px; border-radius:11px; border:1px solid #E7DECF; background:#fff; display:grid; place-items:center; overflow:hidden;")}>
                          <img ref={this.thumbRef} src={v.selUrl || undefined} alt={t.thumbAlt} style={css('max-width:100%; max-height:100%; object-fit:contain;')} />
                        </div>
                        <div style={css('flex:1; display:flex; flex-direction:column; gap:7px; min-width:0;')}>
                          <button onClick={v.triggerUpload} style={css('display:inline-flex; align-items:center; justify-content:center; gap:7px; background:#15120D; color:#F5EFE5; font-weight:700; font-size:13px; padding:10px; border:0; border-radius:10px; cursor:pointer;')}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 16V4M7 9l5-5 5 5M5 20h14" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            {t.btnUpload}
                          </button>
                          <div style={css('display:flex; gap:6px;')}>
                            <button onClick={v.sample0} style={css("flex:1; height:30px; border-radius:8px; border:1px solid #E2D9C8; background:#fff; color:#15120D; font-family:'Oswald'; font-weight:600; font-size:11px; cursor:pointer;")}>{t.sampleBadge}</button>
                            <button onClick={v.sample1} style={css("flex:1; height:30px; border-radius:8px; border:1px solid #E2D9C8; background:#fff; color:#15120D; font-family:'Oswald'; font-weight:600; font-size:11px; cursor:pointer;")}>{t.samplePrint}</button>
                            <button onClick={v.sample2} style={css("flex:1; height:30px; border-radius:8px; border:1px solid #E2D9C8; background:#fff; color:#15120D; font-family:'Oswald'; font-weight:600; font-size:11px; cursor:pointer;")}>{t.sampleLogo}</button>
                          </div>
                        </div>
                      </div>

                      {/* zone */}
                      <div style={css('margin-bottom:13px;')}>
                        <div style={css('font-size:12px; font-weight:700; color:#6F6655; margin-bottom:7px;')}>{t.zoneSectionLabel}</div>
                        <div style={css('display:flex; flex-wrap:wrap; gap:6px;')}>
                          {v.zoneList.map(z => <button key={z.label} onClick={z.onClick} style={css(z.style)}>{z.label}</button>)}
                        </div>
                      </div>

                      {/* method */}
                      <div style={css('margin-bottom:14px;')}>
                        <div style={css('font-size:12px; font-weight:700; color:#6F6655; margin-bottom:7px;')}>{t.methodSectionLabel}</div>
                        <div style={css('display:flex; gap:7px;')}>
                          <button onClick={v.methodEmb} style={css(this.meth(v.isEmb))}><span style={css("font-family:'Oswald'; font-weight:600; font-size:13px;")}>{t.methodEmbShort}</span><span style={css('font-size:10px; opacity:.7;')}>{t.methodEmbSub}</span></button>
                          <button onClick={v.methodDtf} style={css(this.meth(v.isDtf))}><span style={css("font-family:'Oswald'; font-weight:600; font-size:13px;")}>{t.methodDtfShort}</span><span style={css('font-size:10px; opacity:.7;')}>{t.methodDtfSub}</span></button>
                          <button onClick={v.methodSilk} style={css(this.meth(v.isSilk))}><span style={css("font-family:'Oswald'; font-weight:600; font-size:13px;")}>{t.methodSilkShort}</span><span style={css('font-size:10px; opacity:.7;')}>{t.methodSilkSub}</span></button>
                        </div>
                      </div>

                      {/* transform */}
                      <div style={css('display:flex; flex-direction:column; gap:11px;')}>
                        <label style={css('display:flex; flex-direction:column; gap:6px;')}><span style={css('display:flex; justify-content:space-between; font-size:12px; font-weight:600; color:#6F6655;')}>{t.scaleLabel} <span style={css('color:#988E7B;')}>{t.scaleHint}</span></span><input ref={this.scaleRef} onInput={v.onScale} type="range" min="0" max="100" defaultValue="52" /></label>
                        <label style={css('display:flex; flex-direction:column; gap:6px;')}><span style={css('font-size:12px; font-weight:600; color:#6F6655;')}>{t.rotateLabel}</span><input ref={this.rotRef} onInput={v.onRotate} type="range" min="-180" max="180" defaultValue="0" /></label>
                      </div>
                    </div>
                  )}

                  <input ref={this.fileRef} onChange={v.onFile} type="file" accept="image/*" style={{ display: 'none' }} />
                </div>

              </div>

              {/* FOOTER SPEC + CTA */}
              <div style={css('flex:none; border-top:1px solid rgba(21,18,13,.10); padding:16px 22px; background:#FAF6EE;')}>
                <div style={css('display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:12px;')}>
                  <div style={css('display:flex; flex-direction:column; gap:2px; min-width:0;')}>
                    <span style={css("font-family:'Oswald'; font-weight:600; text-transform:uppercase; font-size:13px; letter-spacing:.03em;")}>{v.productLabel} · {v.colorName}</span>
                    <span style={css('font-size:12px; color:#857B69; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;')}>{v.printsSummary}</span>
                  </div>
                  <div style={css('text-align:right; flex:none;')}>
                    <span style={css('font-size:11px; color:#988E7B; display:block;')}>{t.footerPriceLabel}</span>
                    <span style={css("font-family:'Oswald'; font-weight:700; font-size:16px; line-height:1; white-space:nowrap;")}>{v.priceLabel}</span>
                  </div>
                </div>
                <button onClick={v.openSummary} style={css('display:flex; align-items:center; justify-content:center; gap:9px; width:100%; background:#FCAC45; color:#15120D; font-weight:700; font-size:16px; padding:15px; border:0; border-radius:13px; cursor:pointer;')}>
                  {t.ctaGetQuote}
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </div>
            </aside>
          </div>

          {/* SUMMARY MODAL */}
          {v.summaryOpen && (
            <div onClick={v.closeSummary} className={v.closing ? 'fp-scrim-out' : undefined} style={css('position:fixed; inset:0; z-index:40; background:rgba(21,18,13,.5); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; padding:24px;')}>
              <div onClick={v.stop} className={v.closing ? 'fp-modal-out' : 'fp-pop'} style={css('width:100%; max-width:460px; max-height:88vh; overflow-y:auto; background:#F5EFE5; border-radius:22px; box-shadow:0 30px 80px rgba(0,0,0,.4);')}>
                {v.notSent && (
                  <div style={css('padding:26px 26px 24px;')}>
                    <div style={css('display:flex; align-items:center; justify-content:space-between; margin-bottom:18px;')}>
                      <h3 style={css("font-family:'Oswald'; font-weight:700; text-transform:uppercase; font-size:24px; margin:0;")}>{t.modalTitle}</h3>
                      <button onClick={v.closeSummary} aria-label={t.modalCloseAria} style={css('width:36px; height:36px; border-radius:999px; border:1px solid rgba(21,18,13,.14); background:#fff; font-size:17px; cursor:pointer;')}>✕</button>
                    </div>
                    <div style={css('background:#fff; border:1px solid #E7DECF; border-radius:16px; padding:6px 18px; margin-bottom:14px;')}>
                      <div style={css('display:flex; justify-content:space-between; padding:11px 0; border-bottom:1px solid #F0E8D9;')}><span style={css('color:#857B69; font-size:14px;')}>{t.summaryRowProduct}</span><span style={css('font-weight:700; font-size:14px;')}>{v.productLabel}</span></div>
                      <div style={css('display:flex; justify-content:space-between; padding:11px 0;')}><span style={css('color:#857B69; font-size:14px;')}>{t.summaryRowColor}</span><span style={css('font-weight:700; font-size:14px;')}>{v.colorName}</span></div>
                    </div>
                    <div style={css("font-family:'Oswald'; font-weight:600; text-transform:uppercase; font-size:13px; letter-spacing:.03em; color:#857B69; margin:0 2px 9px;")}>{v.printsCountLabel}</div>
                    <div style={css('display:flex; flex-direction:column; gap:8px; margin-bottom:18px;')}>
                      {v.printRows.map((r, i) => (
                        <div key={i} style={css('display:flex; align-items:center; gap:12px; background:#fff; border:1px solid #E7DECF; border-radius:13px; padding:10px 13px;')}>
                          <span style={css(`flex:none; width:40px; height:40px; border-radius:9px; background:${r.tint}; display:grid; place-items:center; font-family:'Oswald'; font-weight:600; font-size:11px; color:#15120D;`)}>{r.short}</span>
                          <div style={css('flex:1; min-width:0;')}><div style={css('font-weight:700; font-size:14px;')}>{r.zone}</div><div style={css('color:#857B69; font-size:12.5px;')}>{r.method}</div></div>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={v.submitOrder} style={css('display:flex; flex-direction:column; gap:11px;')}>
                      <div style={css('display:flex; gap:10px; flex-wrap:wrap;')}>
                        <input type="text" placeholder={t.formNamePlaceholder} required style={css('flex:1 1 130px; min-width:0; border:1px solid #E2D9C8; background:#fff; border-radius:11px; padding:13px 15px; font-size:15px; font-family:inherit; outline:none;')} />
                        <input type="tel" placeholder={t.formPhonePlaceholder} required style={css('flex:1 1 130px; min-width:0; border:1px solid #E2D9C8; background:#fff; border-radius:11px; padding:13px 15px; font-size:15px; font-family:inherit; outline:none;')} />
                      </div>
                      <input type="text" placeholder={t.formQtyPlaceholder} style={css('border:1px solid #E2D9C8; background:#fff; border-radius:11px; padding:13px 15px; font-size:15px; font-family:inherit; outline:none;')} />
                      <button type="submit" style={css('display:flex; align-items:center; justify-content:center; gap:8px; background:#15120D; color:#F5EFE5; font-weight:700; font-size:16px; padding:15px; border:0; border-radius:12px; cursor:pointer; margin-top:2px;')}>{t.btnSubmitOrder}</button>
                      <p style={css('margin:2px 0 0; color:#A79C88; font-size:11.5px; line-height:1.4; text-align:center;')}>{t.formFootnote}</p>
                    </form>
                  </div>
                )}
                {v.sent && (
                  <div className="fp-route" style={css('padding:40px 30px; display:flex; flex-direction:column; align-items:center; text-align:center; gap:14px;')}>
                    <span className="fp-badge-pop" style={css('width:64px; height:64px; border-radius:999px; background:#FCAC45; color:#15120D; display:grid; place-items:center; font-size:30px;')}>✓</span>
                    <h3 style={css("font-family:'Oswald'; font-weight:700; text-transform:uppercase; font-size:26px; margin:0;")}>{t.sentTitle}</h3>
                    <p style={css('margin:0; color:#6F6655; font-size:15px; line-height:1.5; max-width:300px;')}>{t.sentBody.replace('{product}', v.productLabel).replace('{printsCount}', v.printsCountLabel)}</p>
                    <button onClick={v.closeSummary} style={css('margin-top:6px; background:#15120D; color:#F5EFE5; font-weight:700; font-size:15px; padding:13px 26px; border:0; border-radius:999px; cursor:pointer;')}>{t.btnDone}</button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </>
    )
  }
}

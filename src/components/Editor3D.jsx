import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF, ContactShadows, Center } from '@react-three/drei'
import * as THREE from 'three'
import { defaultProduct } from '../config/products.js'
import { runtime } from '../config/runtime.js'
import { useDesigner } from '../state/DesignerContext.jsx'
import { buildPartsData, PART_KEYS } from '../lib/garment.js'
import { compositeAll, compositePart } from '../lib/composite.js'

const MODEL = defaultProduct.model3d
const TEX = defaultProduct.design.textureSize || 1024
const RASTER = 2 // board → tile rasterisation multiplier
const COMPOSITE_MS = 55 // cap incremental recomposite rate so 2D dragging stays smooth

// Builds the per-part geometry OUTSIDE the R3F Canvas, so setParts reaches
// DesignBoard (a DOM sibling of the Canvas — a setState from inside the Canvas's
// reconciler doesn't reliably flush out). drei caches the GLTF, so Shirt reuses it.
function GeometryLoader() {
  const { nodes } = useGLTF(runtime.modelUrl || MODEL.src)
  const { setParts } = useDesigner()
  const mesh = useMemo(() => Object.values(nodes).find((n) => n.isMesh && n.geometry), [nodes])
  useEffect(() => {
    if (!mesh || !setParts) return
    try {
      const p = buildPartsData(mesh.geometry)
      if (p) setParts(p)
    } catch (err) {
      console.warn('parts build failed', err)
    }
  }, [mesh, setParts])
  return null
}

// Warps each board zone onto the garment's UV map over a flat shirt-colour base.
// The board is rasterised once per revision (cached); only dirty zones re-warp,
// throttled so the 2D drag stays smooth.
function Shirt() {
  const { nodes } = useGLTF(runtime.modelUrl || MODEL.src)
  const mesh = useMemo(() => Object.values(nodes).find((n) => n.isMesh && n.geometry), [nodes])
  const { parts, boardRef, layoutRef, boardRevRef, dirtyRef, consumeDirty, shirtColor, registerMaster, registerInvalidate, registerFlush } = useDesigner()
  const invalidate = useThree((s) => s.invalidate)

  const masterRef = useRef(null)
  const ctxRef = useRef(null)
  const texRef = useRef(null)
  const fullRef = useRef(true)
  const lastRef = useRef(0)
  const pendingRef = useRef(false)
  const rasterRef = useRef({ rev: -1, canvas: null })
  const cropRef = useRef({})
  const partsRef = useRef(parts); partsRef.current = parts
  const colorRef = useRef(shirtColor); colorRef.current = shirtColor
  const [tex, setTex] = useState(null)

  // master texture canvas + three texture (once)
  useEffect(() => {
    const m = document.createElement('canvas')
    m.width = TEX
    m.height = TEX
    masterRef.current = m
    ctxRef.current = m.getContext('2d')
    registerMaster(m)
    const tx = new THREE.CanvasTexture(m)
    tx.colorSpace = THREE.SRGBColorSpace
    tx.flipY = false
    tx.anisotropy = 8
    texRef.current = tx
    setTex(tx)
    return () => {
      tx.dispose()
      registerMaster(null)
      masterRef.current = null
      ctxRef.current = null
      texRef.current = null
    }
  }, [registerMaster])

  // a full recomposite whenever the geometry parts arrive (built outside)
  useEffect(() => { if (parts) { fullRef.current = true; invalidate() } }, [parts, invalidate])

  // colour change → full recomposite
  useEffect(() => { fullRef.current = true; invalidate() }, [shirtColor, invalidate])

  // let the board-edit path (Fabric events in the context) request a frame
  useEffect(() => { registerInvalidate(invalidate); return () => registerInvalidate(null) }, [registerInvalidate, invalidate])

  // rasterise the whole board (at identity viewport) once per revision, cached
  const boardRaster = useCallback(() => {
    const cv = boardRef.current
    if (!cv) return null
    const rev = boardRevRef.current
    if (rasterRef.current.rev === rev && rasterRef.current.canvas) return rasterRef.current.canvas
    const saved = cv.viewportTransform
    cv.viewportTransform = [1, 0, 0, 1, 0, 0]
    let out = null
    try { out = cv.toCanvasElement(RASTER) } finally { cv.viewportTransform = saved }
    rasterRef.current = { rev, canvas: out }
    return out
  }, [boardRef, boardRevRef])

  // a zone's tile = its rectangle cropped from the board raster, cached per rev
  const tileImg = useCallback((key) => {
    const r = layoutRef.current?.zones[key]
    if (!r) return null
    const cached = cropRef.current[key]
    const rev = boardRevRef.current
    if (cached && cached.rev === rev) return cached.data
    const raster = boardRaster()
    if (!raster) return null
    const sw = Math.max(1, Math.round(r.w * RASTER)), sh = Math.max(1, Math.round(r.h * RASTER))
    const crop = document.createElement('canvas')
    crop.width = sw; crop.height = sh
    crop.getContext('2d').drawImage(raster, Math.round(r.x * RASTER), Math.round(r.y * RASTER), sw, sh, 0, 0, sw, sh)
    const data = { img: crop, w: sw, h: sh }
    cropRef.current[key] = { rev, data }
    return data
  }, [layoutRef, boardRevRef, boardRaster])

  // synchronous full recomposite (export needs the master current even if idle)
  const flush = useCallback(() => {
    const ctx = ctxRef.current, p = partsRef.current
    if (!ctx || !p) return
    const tiles = {}
    for (const k of PART_KEYS) tiles[k] = tileImg(k)
    compositeAll(ctx, TEX, p, tiles, colorRef.current)
    if (texRef.current) texRef.current.needsUpdate = true
    invalidate()
  }, [tileImg, invalidate])
  useEffect(() => { registerFlush(flush); return () => registerFlush(null) }, [registerFlush, flush])

  useFrame(() => {
    const ctx = ctxRef.current, tx = texRef.current, p = partsRef.current
    if (!ctx || !tx || !p) return
    if (fullRef.current) {
      const tiles = {}
      for (const k of PART_KEYS) tiles[k] = tileImg(k)
      compositeAll(ctx, TEX, p, tiles, colorRef.current)
      fullRef.current = false
      consumeDirty()
      lastRef.current = performance.now()
      tx.needsUpdate = true
      return
    }
    if (dirtyRef.current.size === 0) return
    const now = performance.now()
    const wait = COMPOSITE_MS - (now - lastRef.current)
    if (wait > 0) {
      // throttle: keep the Fabric drag at 60fps, but schedule one trailing frame
      // so the final (released) position always composites — even under demand.
      if (!pendingRef.current) {
        pendingRef.current = true
        setTimeout(() => { pendingRef.current = false; invalidate() }, wait)
      }
      return
    }
    const dirty = consumeDirty()
    for (const key of dirty) compositePart(ctx, TEX, p[key], tileImg(key), colorRef.current)
    lastRef.current = now
    tx.needsUpdate = true
  })

  const material = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.92, metalness: 0 }), [])
  useEffect(() => () => material.dispose(), [material])
  useEffect(() => {
    if (tex) {
      material.map = tex
      material.needsUpdate = true
    }
  }, [material, tex])

  if (!mesh) return null
  return <mesh geometry={mesh.geometry} material={material} dispose={null} />
}

function GLCapture() {
  const gl = useThree((s) => s.gl)
  const { registerGL } = useDesigner()
  useEffect(() => registerGL(gl), [gl, registerGL])
  return null
}

// Renders the garment from each side (front / back / left / right) and returns a
// data-URL per side, so an order can show how the logo looks from every side in
// one file. Runs synchronously between renders — `preserveDrawingBuffer` on the
// Canvas keeps each frame readable by toDataURL. Camera is restored afterwards.
function SideCapture() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls)
  const { registerCaptureSides } = useDesigner()

  useEffect(() => {
    const R = Math.hypot(...MODEL.camera.position) || 2.15 // keep every side framed at the load distance
    const yBase = MODEL.camera.position[1] || 0
    // unit view directions; sleeves get a slight forward+up tilt so the sleeve
    // print reads as a 3/4 view rather than a thin edge-on profile.
    const dirs = {
      front: [0, 0.06, 1],
      back: [0, 0.06, -1],
      sleeveL: [-1, 0.14, 0.34],
      sleeveR: [1, 0.14, 0.34],
    }
    const capture = () => {
      if (!gl || !scene || !camera) return null
      const savedPos = camera.position.clone()
      const savedQuat = camera.quaternion.clone()
      const out = {}
      try {
        if (controls) controls.enabled = false
        for (const k of ['front', 'back', 'sleeveL', 'sleeveR']) {
          const [dx, dy, dz] = dirs[k]
          const len = Math.hypot(dx, dy, dz) || 1
          camera.position.set((dx / len) * R, (dy / len) * R + yBase, (dz / len) * R)
          camera.lookAt(0, 0, 0)
          camera.updateMatrixWorld()
          gl.render(scene, camera)
          out[k] = gl.domElement.toDataURL('image/png')
        }
      } catch (err) {
        console.warn('side capture failed', err)
      } finally {
        camera.position.copy(savedPos)
        camera.quaternion.copy(savedQuat)
        camera.updateMatrixWorld()
        if (controls) { controls.enabled = true; controls.update?.() }
        gl.render(scene, camera)
      }
      return out
    }
    registerCaptureSides(capture)
    return () => registerCaptureSides(null)
  }, [gl, scene, camera, controls, registerCaptureSides])
  return null
}

export default function Editor3D() {
  return (
    <div className="preview3d canvas-wrap">
      <Suspense fallback={null}>
        <GeometryLoader />
      </Suspense>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: MODEL.camera.position, fov: MODEL.camera.fov }}
        gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.7} />
        <hemisphereLight args={['#ffffff', '#d8d4cd', 0.5]} />
        <directionalLight position={[4, 6, 5]} intensity={1.5} />
        <directionalLight position={[-5, 2, -3]} intensity={0.5} />
        <directionalLight position={[0, 2, -6]} intensity={0.45} />
        <Suspense fallback={null}>
          <Center>
            <Shirt />
          </Center>
        </Suspense>
        <ContactShadows position={[0, -0.62, 0]} opacity={0.3} scale={2.6} blur={2.6} far={1.1} resolution={512} color="#2b2a33" />
        <OrbitControls makeDefault enablePan={false} minDistance={1.3} maxDistance={4} />
        <GLCapture />
        <SideCapture />
      </Canvas>
    </div>
  )
}

useGLTF.preload(runtime.modelUrl || MODEL.src)

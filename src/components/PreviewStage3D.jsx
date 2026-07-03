import { Suspense, useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Center, Decal, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { defaultProduct } from '../config/products.js'
import { useDesigner } from '../state/DesignerContext.jsx'

const product = defaultProduct
const MODEL = product.model3d

// Load one side's design (prints only, transparent, cropped to its textureArea)
// as a Three.js texture. Re-runs whenever any side's design changes.
function useSideTexture(side) {
  const { getDesignTexture, designVersion } = useDesigner()
  const [tex, setTex] = useState(null)
  useEffect(() => {
    const url = getDesignTexture(side)
    if (!url) {
      setTex(null)
      return
    }
    let active = true
    new THREE.TextureLoader().load(url, (t) => {
      if (!active) return
      t.colorSpace = THREE.SRGBColorSpace
      t.anisotropy = 8
      setTex(t)
    })
    return () => {
      active = false
    }
  }, [getDesignTexture, designVersion, side])
  return tex
}

function SideDecal({ view, texture }) {
  if (!texture) return null
  return (
    <Decal position={view.decal.position} rotation={view.decal.rotation} scale={view.decal.scale}>
      <meshStandardMaterial
        map={texture}
        transparent
        polygonOffset
        polygonOffsetFactor={-10}
        roughness={0.75}
        metalness={0}
      />
    </Decal>
  )
}

// The garment with each side's design projected onto the matching face. The
// mesh is discovered from the GLB so swapping the model "just works"; tune
// placement via each view's `decal` in config/products.js.
function Shirt() {
  const { nodes } = useGLTF(MODEL.src)
  const mesh = useMemo(
    () => Object.values(nodes).find((n) => n.isMesh && n.geometry),
    [nodes],
  )
  const frontView = product.views.find((v) => v.id === 'front')
  const backView = product.views.find((v) => v.id === 'back')
  const frontTex = useSideTexture('front')
  const backTex = useSideTexture('back')
  if (!mesh) return null
  return (
    <mesh geometry={mesh.geometry} material={mesh.material} dispose={null}>
      <SideDecal view={frontView} texture={frontTex} />
      <SideDecal view={backView} texture={backTex} />
    </mesh>
  )
}

// Orbitable 3D preview. Lit with plain lights (no external HDRI) so it works
// offline and loads instantly. Orbit to see the front and back designs.
export default function PreviewStage3D() {
  return (
    <div className="preview3d canvas-wrap">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: MODEL.camera.position, fov: MODEL.camera.fov }}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
      >
        <color attach="background" args={['#f0eeea']} />
        <ambientLight intensity={0.85} />
        <hemisphereLight args={['#ffffff', '#bdbdc2', 0.6]} />
        <directionalLight position={[3, 4, 5]} intensity={1.0} />
        <directionalLight position={[-4, 2, -3]} intensity={0.55} />
        <Suspense fallback={null}>
          <Center>
            <Shirt />
          </Center>
        </Suspense>
        <OrbitControls enablePan={false} minDistance={1.3} maxDistance={4} />
      </Canvas>
      <div className="preview3d-hint">Drag to rotate · scroll to zoom</div>
    </div>
  )
}

useGLTF.preload(MODEL.src)

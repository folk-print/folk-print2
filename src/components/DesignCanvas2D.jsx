import { useEffect, useRef } from 'react'
import { Canvas } from 'fabric'
import { defaultProduct } from '../config/products.js'
import { useDesigner } from '../state/DesignerContext.jsx'

const DESIGN = defaultProduct.design

// The 2D layout. Everything drawn here becomes the shirt's texture. The Parts
// navigator zooms the canvas into one zone (front / back / sleeve) at a time so
// it's easy to work on a single part; "All" shows the whole layout.
export default function DesignCanvas2D() {
  const elRef = useRef(null)
  const fabricRef = useRef(null)
  const { attachCanvas, guideUrl, showGuide, zones, activePart } = useDesigner()

  useEffect(() => {
    if (fabricRef.current) return
    const canvas = new Canvas(elRef.current, {
      width: DESIGN.size,
      height: DESIGN.size,
      backgroundColor: DESIGN.background,
      preserveObjectStacking: true,
      selection: true,
    })
    fabricRef.current = canvas
    attachCanvas(canvas)
    return () => {
      canvas.dispose()
      fabricRef.current = null
    }
  }, [attachCanvas])

  // Zoom/pan the editor viewport to the active part (texture stays full-design).
  useEffect(() => {
    const cv = fabricRef.current
    if (!cv) return
    const z = activePart !== 'full' && zones ? zones[activePart] : null
    if (!z) {
      cv.setViewportTransform([1, 0, 0, 1, 0, 0])
    } else {
      const S = DESIGN.size
      const scale = (S * 0.9) / Math.max(z.w, z.h)
      const tx = S / 2 - scale * (z.x + z.w / 2)
      const ty = S / 2 - scale * (z.y + z.h / 2)
      cv.setViewportTransform([scale, 0, 0, scale, tx, ty])
    }
    cv.requestRenderAll()
  }, [zones, activePart])

  // The full-unwrap guide only makes sense in the "All" view.
  const showFullGuide = guideUrl && showGuide && activePart === 'full'

  return (
    <div className="design2d canvas-wrap" style={{ width: DESIGN.size, height: DESIGN.size }}>
      <canvas ref={elRef} />
      {showFullGuide && <img className="region-guide" src={guideUrl} alt="" />}
    </div>
  )
}

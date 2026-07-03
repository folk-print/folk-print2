import { useEffect, useRef } from 'react'
import { Canvas, FabricImage } from 'fabric'
import { CANVAS } from '../config/products.js'
import { makeSilhouetteClip } from '../lib/printArea.js'
import { useDesigner } from '../state/DesignerContext.jsx'

// One Fabric canvas for a single side (front or back). Loads that side's mockup
// as a locked background and builds a silhouette clip so prints stay on the
// shirt but can be placed anywhere on it. Registers itself with the context.
export default function DesignerStage({ view }) {
  const canvasElRef = useRef(null)
  const fabricRef = useRef(null)
  const { attachCanvas } = useDesigner()

  useEffect(() => {
    if (fabricRef.current) return // guard against re-init

    const canvas = new Canvas(canvasElRef.current, {
      width: CANVAS.width,
      height: CANVAS.height,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
      selection: true,
    })
    fabricRef.current = canvas

    FabricImage.fromURL(view.mockupSrc)
      .then((img) => {
        const scale = Math.min(CANVAS.width / img.width, CANVAS.height / img.height)
        img.scale(scale)
        img.set({
          left: (CANVAS.width - img.getScaledWidth()) / 2,
          top: (CANVAS.height - img.getScaledHeight()) / 2,
          selectable: false,
          evented: false,
        })
        canvas.backgroundImage = img
        canvas.requestRenderAll()
      })
      .catch((err) => console.error('Failed to load garment mockup', err))

    const clip = makeSilhouetteClip(view.silhouette)
    attachCanvas(view.id, canvas, clip)

    return () => {
      canvas.dispose()
      fabricRef.current = null
    }
  }, [attachCanvas, view])

  return (
    <div className="canvas-wrap" style={{ width: CANVAS.width, height: CANVAS.height }}>
      <canvas ref={canvasElRef} />
    </div>
  )
}

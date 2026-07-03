import { FabricImage, loadSVGFromString, util } from 'fabric'

export const ACCEPTED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]

let counter = 0
const nextId = () => `print-${Date.now()}-${counter++}`

// Touch-first selection controls. The default Fabric handles (~13px) are almost
// impossible to grab with a finger; bumping the visual corner and especially the
// invisible touch hit-area (touchCornerSize) makes scaling/rotating a print on a
// phone reliable. Brand-amber styling so the handles read as "grab here".
export const PRINT_HANDLE_STYLE = {
  cornerSize: 20,
  touchCornerSize: 44,
  cornerStyle: 'circle',
  transparentCorners: false,
  cornerColor: '#FCAC45',
  cornerStrokeColor: '#15120D',
  borderColor: '#FCAC45',
  borderScaleFactor: 2,
  padding: 6,
  lockScalingFlip: true,
}

// Apply the touch handle style + mark a fabric object as a print layer.
export function styleAsPrint(obj) {
  obj.set(PRINT_HANDLE_STYLE)
  obj.isPrint = true
  return obj
}

function readAs(file, how) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    if (how === 'text') reader.readAsText(file)
    else reader.readAsDataURL(file)
  })
}

async function buildObject(file) {
  if (file.type === 'image/svg+xml') {
    const svg = await readAs(file, 'text')
    const { objects, options } = await loadSVGFromString(svg)
    return util.groupSVGElements(objects.filter(Boolean), options)
  }
  const dataUrl = await readAs(file, 'dataurl')
  return FabricImage.fromURL(dataUrl)
}

// Add files to the design board, centered in the target zone rectangle `rect`
// ({ x, y, w, h } in board coordinates) and scaled to fit it. Returns
// { added, skipped }.
export async function addFiles(canvas, files, { rect }) {
  const added = []
  const skipped = []
  const cx = rect.x + rect.w / 2
  const cy = rect.y + rect.h / 2
  const fitW = rect.w * 0.8
  const fitH = rect.h * 0.8

  for (const file of files) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      skipped.push(file.name)
      continue
    }
    try {
      const obj = await buildObject(file)
      obj.set({ originX: 'center', originY: 'center', left: cx, top: cy })
      const fit = Math.min(fitW / (obj.width || 1), fitH / (obj.height || 1), 1)
      obj.scale(fit)
      styleAsPrint(obj)
      obj.layerId = nextId()
      obj.fileName = file.name
      obj.setCoords()
      canvas.add(obj)
      canvas.setActiveObject(obj)
      added.push(obj)
    } catch (err) {
      console.error('Failed to load file', file.name, err)
      skipped.push(file.name)
    }
  }

  canvas.requestRenderAll()
  return { added, skipped }
}

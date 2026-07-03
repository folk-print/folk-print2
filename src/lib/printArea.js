import { Path } from 'fabric'

// A clipPath that constrains prints to the garment silhouette — so a print can
// be placed ANYWHERE on the shirt but never spills onto the background. The
// path is authored in canvas coordinates (the same 600x720 space as the mockup),
// and `absolutePositioned` makes the clip apply in those canvas coordinates.
export function makeSilhouetteClip(pathString) {
  return new Path(pathString, { absolutePositioned: true })
}

// Center an object inside `area` and scale it down to fit if it is larger than
// the area (never scales small artwork up). Objects use a center origin so
// move / scale / rotate feel natural.
export function fitInto(obj, area, { pad = 0.9 } = {}) {
  const maxW = area.width * pad
  const maxH = area.height * pad
  const baseW = obj.width || 1
  const baseH = obj.height || 1
  const scale = Math.min(maxW / baseW, maxH / baseH, 1)
  obj.set({
    originX: 'center',
    originY: 'center',
    left: area.x + area.width / 2,
    top: area.y + area.height / 2,
  })
  obj.scale(scale)
  obj.setCoords()
}

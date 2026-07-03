import { useEffect, useMemo, useRef } from 'react'
import { Canvas } from 'fabric'
import { useDesigner } from '../state/DesignerContext.jsx'
import { useI18n } from '../i18n/I18nContext.jsx'
import { PART_KEYS } from '../lib/garment.js'
import { zoneViewport, drawBoardGuide } from '../lib/board.js'

const LABEL_KEY = { front: 'part_front', back: 'part_back', sleeveL: 'part_sleeveL', sleeveR: 'part_sleeveR' }
const NAV = ['all', ...PART_KEYS]

// The single roamable design board: one transparent Fabric canvas + a guide layer
// behind it + a navigator that zooms into a zone. The canvas keeps a fixed
// backstore resolution and is scaled to fit via CSS (Fabric maps pointers to the
// scaled size), so it stays crisp and usable on phones.
export default function DesignBoard() {
  const elRef = useRef(null)
  const guideRef = useRef(null)
  const fabricRef = useRef(null)
  const { layout, boardSize, activeZone, setActiveZone, registerBoard, unregisterBoard, parts } = useDesigner()
  const { t } = useI18n()

  const labels = useMemo(
    () => ({ front: t('part_front'), back: t('part_back'), sleeveL: t('part_sleeveL'), sleeveR: t('part_sleeveR') }),
    [t],
  )

  useEffect(() => {
    if (!layout || fabricRef.current) return
    const canvas = new Canvas(elRef.current, {
      width: boardSize,
      height: boardSize,
      backgroundColor: '',
      preserveObjectStacking: true,
      selection: true,
    })
    fabricRef.current = canvas
    registerBoard(canvas)
    return () => {
      fabricRef.current = null
      unregisterBoard(canvas)
      canvas.dispose()
    }
  }, [layout, boardSize, registerBoard, unregisterBoard])

  useEffect(() => {
    const cv = fabricRef.current
    if (!cv || !layout) return
    const vt = zoneViewport(layout, activeZone, boardSize)
    cv.setViewportTransform(vt)
    cv.requestRenderAll()
    const g = guideRef.current?.getContext('2d')
    if (g) drawBoardGuide(g, layout, parts, vt, { labels, active: activeZone })
  }, [activeZone, layout, parts, boardSize, labels])

  if (!layout) {
    return <div className="board-loading">{t('loading_3d')}</div>
  }

  return (
    <div className="board">
      <div className="zone-nav" role="group" aria-label={t('pieces_title')}>
        {NAV.map((z) => (
          <button key={z} className={activeZone === z ? 'active' : ''} onClick={() => setActiveZone(z)}>
            {z === 'all' ? t('zone_all') : t(LABEL_KEY[z])}
          </button>
        ))}
      </div>
      <div className="board-wrap" style={{ maxWidth: boardSize }}>
        <canvas ref={guideRef} className="board-guide" width={boardSize} height={boardSize} />
        <canvas ref={elRef} className="board-fabric" />
      </div>
      <p className="board-hint">{t('board_hint')}</p>
    </div>
  )
}

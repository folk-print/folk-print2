import { lazy, Suspense } from 'react'
import DesignBoard from './DesignBoard.jsx'
import { useI18n } from '../i18n/I18nContext.jsx'

// 3D preview is lazy so three.js loads after the shell paints.
const Editor3D = lazy(() => import('./Editor3D.jsx'))

// One roamable design board on the left, live 3D shirt on the right.
export default function StageArea() {
  const { t } = useI18n()
  return (
    <section className="stage-area">
      <div className="stage-split">
        <div className="split-pane board-pane">
          <div className="pane-label"><span>{t('pieces_title')}</span></div>
          <DesignBoard />
        </div>
        <div className="split-pane grow">
          <div className="pane-label"><span>{t('preview_3d')}</span></div>
          <Suspense fallback={<div className="preview3d canvas-wrap loading3d">{t('loading_3d')}</div>}>
            <Editor3D />
          </Suspense>
        </div>
      </div>
    </section>
  )
}

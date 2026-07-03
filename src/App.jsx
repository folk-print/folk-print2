import { I18nProvider, useI18n } from './i18n/I18nContext.jsx'
import { DesignerProvider, useDesigner } from './state/DesignerContext.jsx'
import ProductHeader from './components/ProductHeader.jsx'
import StageArea from './components/StageArea.jsx'
import UploadZone from './components/UploadZone.jsx'
import PrintsPanel from './components/PrintsPanel.jsx'

function Notice() {
  const { notice, setNotice } = useDesigner()
  const { t } = useI18n()
  if (!notice) return null
  return (
    <div className="notice" role="alert">
      <span>{t(notice.key, notice.params)}</span>
      <button className="icon-btn" onClick={() => setNotice(null)} aria-label="×">×</button>
    </div>
  )
}

const SWATCHES = ['#efeae3', '#ffffff', '#15171c', '#c4623d', '#2e5db0', '#2e7d57', '#b5462f', '#d9b44a']

function ColourPanel() {
  const { shirtColor, setShirtColor } = useDesigner()
  const { t } = useI18n()
  return (
    <div className="panel garment">
      <h3>{t('shirt_colour')}</h3>
      <div className="swatches">
        {SWATCHES.map((c) => (
          <button
            key={c}
            className={`swatch${shirtColor === c ? ' active' : ''}`}
            style={{ background: c }}
            onClick={() => setShirtColor(c)}
            aria-label={c}
          />
        ))}
        <label className="swatch custom" title={t('custom_colour')}>
          <input type="color" value={shirtColor} onChange={(e) => setShirtColor(e.target.value)} />
        </label>
      </div>
    </div>
  )
}

function Shell() {
  return (
    <div className="app">
      <ProductHeader />
      <Notice />
      <main className="workspace">
        <aside className="col left">
          <UploadZone />
          <ColourPanel />
          <PrintsPanel />
        </aside>
        <StageArea />
      </main>
    </div>
  )
}

export default function App({ lang } = {}) {
  return (
    <I18nProvider lang={lang}>
      <DesignerProvider>
        <Shell />
      </DesignerProvider>
    </I18nProvider>
  )
}

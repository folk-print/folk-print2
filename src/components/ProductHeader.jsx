import { useDesigner } from '../state/DesignerContext.jsx'
import { useI18n } from '../i18n/I18nContext.jsx'

export default function ProductHeader() {
  const { exportArtwork, exportSnapshot, exportJson, submitOrder, ordering } = useDesigner()
  const { t, lang, setLang, langs, controlled } = useI18n()

  return (
    <header className="app-header">
      <div className="brand">
        <span className="logo" aria-hidden>◐</span>
        <div>
          <h1>{t('brand')}</h1>
          <p className="tagline">{t('tagline', { product: t('product_tshirt') })}</p>
        </div>
      </div>
      <div className="header-actions">
        {!controlled && (
          <div className="lang-switch" role="group" aria-label={t('lang_label')}>
            {langs.map((l) => (
              <button key={l} className={lang === l ? 'active' : ''} aria-pressed={lang === l} onClick={() => setLang(l)}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        )}
        <div className="exports">
          <button onClick={exportArtwork}>{t('export_artwork')}</button>
          <button onClick={exportSnapshot}>{t('export_snapshot')}</button>
          <button onClick={exportJson}>{t('export_spec')}</button>
        </div>
        <button className="primary order-btn" onClick={submitOrder} disabled={ordering}>
          {ordering ? t('order_sending') : t('order')}
        </button>
      </div>
    </header>
  )
}

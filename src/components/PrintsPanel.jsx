import { useDesigner } from '../state/DesignerContext.jsx'
import { useI18n } from '../i18n/I18nContext.jsx'
import { Eye, EyeOff, ArrowUp, ArrowDown, Copy, Trash, Target } from './Icons.jsx'

export default function PrintsPanel() {
  const { layers, selectedId, selectLayer, deleteLayer, duplicateLayer, reorder, toggleVisible, setOpacity, centerSelected } = useDesigner()
  const { t } = useI18n()
  const current = layers.find((l) => l.id === selectedId)

  return (
    <div className="panel prints">
      <h3>{t('layers')}{layers.length > 0 && <span className="count">{layers.length}</span>}</h3>

      {layers.length === 0 ? (
        <p className="empty">{t('layers_empty')}</p>
      ) : (
        <ul className="layer-list">
          {layers.map((l) => {
            const stop = (fn) => (e) => { e.stopPropagation(); fn() }
            return (
              <li key={l.id} className={l.selected ? 'sel' : ''} onClick={() => selectLayer(l.id)}>
                <button className="ico" title={l.visible ? t('tip_hide') : t('tip_show')} aria-label={l.visible ? t('tip_hide') : t('tip_show')} onClick={stop(() => toggleVisible(l.id))}>
                  {l.visible ? <Eye /> : <EyeOff />}
                </button>
                <span className="nm" title={l.name}>{l.name}</span>
                <span className="acts">
                  <button className="ico" title={t('tip_forward')} aria-label={t('tip_forward')} onClick={stop(() => reorder(l.id, 'up'))}><ArrowUp /></button>
                  <button className="ico" title={t('tip_backward')} aria-label={t('tip_backward')} onClick={stop(() => reorder(l.id, 'down'))}><ArrowDown /></button>
                  <button className="ico" title={t('action_duplicate')} aria-label={t('action_duplicate')} onClick={stop(() => duplicateLayer(l.id))}><Copy /></button>
                  <button className="ico danger" title={t('action_delete')} aria-label={t('action_delete')} onClick={stop(() => deleteLayer(l.id))}><Trash /></button>
                </span>
              </li>
            )
          })}
        </ul>
      )}

      {current && (
        <div className="sel-tools">
          <input
            className="op"
            key={selectedId}
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            defaultValue={current.opacity ?? 1}
            title={t('opacity')}
            aria-label={t('opacity')}
            onChange={(e) => setOpacity(selectedId, parseFloat(e.target.value))}
          />
          <button className="ico" title={t('action_center')} aria-label={t('action_center')} onClick={() => centerSelected(selectedId)}><Target /></button>
        </div>
      )}
    </div>
  )
}

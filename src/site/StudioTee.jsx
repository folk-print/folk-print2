import React, { useRef, useState, Suspense, lazy } from 'react'
import { Link } from 'react-router-dom'
import { I18nProvider } from '../i18n/I18nContext.jsx'
import { DesignerProvider, useDesigner } from '../state/DesignerContext.jsx'
import DesignBoard from '../components/DesignBoard.jsx'
import Logo from './Logo.jsx'

// Real t-shirt engine (Fabric board + UV-warp on a real GLB) dressed in the new
// step-panel toolbar. The heavy 3D editor is lazy so it only loads on /studio.
const Editor3D = lazy(() => import('../components/Editor3D.jsx'))

// CSS-string → React style object.
function css(s) {
  const o = {}
  if (!s) return o
  s.split(';').forEach(d => {
    const i = d.indexOf(':'); if (i < 0) return
    const k = d.slice(0, i).trim(); const v = d.slice(i + 1).trim(); if (!k) return
    o[k.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = v
  })
  return o
}

const COLORS = [
  { hex: '#efeae3', name: 'Молочный' }, { hex: '#ffffff', name: 'Белый' },
  { hex: '#15171c', name: 'Чёрный' }, { hex: '#3c3a3b', name: 'Графит' },
  { hex: '#2e5db0', name: 'Синий' }, { hex: '#2e7d57', name: 'Зелёный' },
  { hex: '#b5462f', name: 'Кирпичный' }, { hex: '#d9b44a', name: 'Горчичный' },
  { hex: '#c4623d', name: 'Терракот' }, { hex: '#6a2531', name: 'Бордовый' },
]

const STEP = (n) => css('width:22px; height:22px; border-radius:999px; background:#15120D; color:#FCAC45; display:grid; place-items:center; font-family:\'Oswald\'; font-weight:600; font-size:12px; flex:none;')
const STEP_TITLE = css("font-family:'Oswald'; font-weight:600; text-transform:uppercase; font-size:14px; letter-spacing:.03em;")

function ColorName(hex) { const c = COLORS.find(c => c.hex.toLowerCase() === (hex || '').toLowerCase()); return c ? c.name : 'Свой цвет' }

// Studio audience: `?for=b2b` (entered from business) switches the order CTA from
// a formal "КП" to "Рассчитать в Telegram"; default is personal (b2c).
function getAudience() {
  try {
    const v = new URLSearchParams(window.location.search).get('for')
    return v === 'b2b' || v === 'biz' || v === 'business' ? 'b2b' : 'b2c'
  } catch { return 'b2c' }
}

// Big-target action bar for the print that's currently selected on the board.
// Lives right beneath the board so center / copy / reorder / opacity / delete are
// reachable with a thumb — no scrolling down into the layers list on a phone.
function SelectedPrintBar({ d, layer }) {
  if (!layer) return null
  const Btn = ({ onClick, glyph, label, danger }) => (
    <button onClick={(e) => { e.stopPropagation(); onClick() }} style={css(`flex:1 1 0; min-width:56px; min-height:48px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px; border-radius:11px; border:1px solid ${danger ? '#f0d8d3' : '#E7DECF'}; background:#fff; color:${danger ? '#B23A2E' : '#15120D'}; font-weight:700; font-size:10.5px; cursor:pointer; line-height:1;`)}>
      <span style={css('font-size:17px; line-height:1;')}>{glyph}</span>{label}
    </button>
  )
  return (
    <div style={css('background:#FFFDF8; border:1.5px solid #FCAC45; border-radius:14px; padding:11px; margin-bottom:12px; box-shadow:0 0 0 3px #FCAC4522;')}>
      <div style={css('display:flex; align-items:center; gap:8px; margin-bottom:9px;')}>
        <span style={css('width:8px; height:8px; border-radius:999px; background:#FCAC45; flex:none;')}></span>
        <span style={css('font-weight:800; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;')}>{layer.name || 'Принт'}</span>
        <span style={css('margin-left:auto; font-size:10.5px; font-weight:700; color:#988E7B; flex:none; text-transform:uppercase; letter-spacing:.04em;')}>выбран</span>
      </div>
      <div style={css('display:flex; gap:6px; margin-bottom:10px;')}>
        <Btn onClick={() => d.centerSelected(layer.id)} glyph="◎" label="По центру" />
        <Btn onClick={() => d.duplicateLayer(layer.id)} glyph="⧉" label="Копия" />
        <Btn onClick={() => d.reorder(layer.id, 'up')} glyph="↑" label="Выше" />
        <Btn onClick={() => d.reorder(layer.id, 'down')} glyph="↓" label="Ниже" />
        <Btn onClick={() => d.deleteLayer(layer.id)} glyph="✕" label="Удалить" danger />
      </div>
      <div style={css('display:flex; align-items:center; gap:10px;')}>
        <span style={css('font-size:12px; font-weight:700; color:#6F6655; flex:none;')}>Прозрачность</span>
        <input type="range" min="0.1" max="1" step="0.05" value={layer.opacity} onChange={(e) => d.setOpacity(layer.id, parseFloat(e.target.value))} style={css('flex:1; height:28px; accent-color:#FCAC45;')} />
      </div>
    </div>
  )
}

function Panel({ onOrder, audience }) {
  const d = useDesigner()
  const fileRef = useRef(null)
  const layers = d.layers || []
  const selLayer = layers.find(l => l.id === d.selectedId)
  const biz = audience === 'b2b'

  return (
    <aside className="fp-panel">
      <div className="fp-scroll">

        {/* 1 · Изделие */}
        <div style={css('margin-bottom:22px;')}>
          <div style={css('display:flex; align-items:center; gap:8px; margin-bottom:11px;')}><span style={STEP(1)}>1</span><span style={STEP_TITLE}>Изделие</span></div>
          <div style={css('display:flex; gap:8px;')}>
            <button style={css("flex:1; display:flex; flex-direction:column; align-items:center; gap:5px; padding:12px 4px; border-radius:13px; border:1.5px solid #15120D; background:#15120D; color:#F5EFE5; font-weight:700; font-size:11.5px; cursor:default;")}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M8 3 5 5 3 8l3 2v11h12V10l3-2-2-3-3-2-2 2H10z" strokeLinejoin="round" /></svg>Футболка
            </button>
            <div style={css('flex:1; display:flex; align-items:center; justify-content:center; padding:12px 4px; border-radius:13px; border:1.5px dashed #E2D9C8; background:#FAF6EE; color:#BCB2A0; font-size:11px; font-weight:700; text-align:center; line-height:1.2;')}>Худи, поло,<br />кепка — скоро</div>
          </div>
        </div>

        {/* 2 · Цвет */}
        <div style={css('margin-bottom:22px;')}>
          <div style={css('display:flex; align-items:center; gap:8px; margin-bottom:11px;')}><span style={STEP(2)}>2</span><span style={STEP_TITLE}>Цвет футболки</span></div>
          <div style={css('display:flex; flex-wrap:wrap; gap:10px; align-items:center;')}>
            {COLORS.map(c => {
              const active = (d.shirtColor || '').toLowerCase() === c.hex.toLowerCase()
              return <button key={c.hex} title={c.name} onClick={() => d.setShirtColor(c.hex)} style={css(`width:34px; height:34px; border-radius:999px; background:${c.hex}; cursor:pointer; padding:0; border:2px solid ${active ? '#FCAC45' : 'rgba(0,0,0,.14)'}; box-shadow:${active ? '0 0 0 3px #FCAC4544' : 'none'};`)} />
            })}
            <label title="Свой цвет" style={css('width:34px; height:34px; border-radius:999px; cursor:pointer; display:grid; place-items:center; border:1.5px dashed #C9BBA0; background:#FAF6EE; overflow:hidden; position:relative;')}>
              <span style={css('font-size:16px; color:#C97A14; line-height:1;')}>+</span>
              <input type="color" value={d.shirtColor || '#ffffff'} onChange={(e) => d.setShirtColor(e.target.value)} style={css('position:absolute; inset:0; opacity:0; cursor:pointer;')} />
            </label>
          </div>
        </div>

        {/* 3 · Принты */}
        <div style={css('margin-bottom:18px;')}>
          <div style={css('display:flex; align-items:center; gap:8px; margin-bottom:11px;')}>
            <span style={STEP(3)}>3</span><span style={STEP_TITLE}>Принты</span>
            <span style={css('margin-left:auto; font-size:12px; font-weight:700; color:#988E7B;')}>{layers.length} {layers.length === 1 ? 'принт' : (layers.length >= 2 && layers.length <= 4) ? 'принта' : 'принтов'}</span>
          </div>

          <button onClick={() => fileRef.current && fileRef.current.click()} style={css("display:flex; align-items:center; justify-content:center; gap:8px; width:100%; background:#15120D; color:#F5EFE5; font-weight:700; font-size:14px; padding:12px; border:0; border-radius:11px; cursor:pointer; margin-bottom:12px;")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 16V4M7 9l5-5 5 5M5 20h14" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Загрузить принт
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={(e) => { if (e.target.files && e.target.files.length) d.addFiles(e.target.files); e.target.value = '' }} style={{ display: 'none' }} />

          {/* design board — arrange prints onto the t-shirt pattern */}
          <div style={css('background:#FAF6EE; border:1px solid #EDE3CF; border-radius:15px; padding:10px; margin-bottom:12px;')}>
            <div style={css('font-size:11px; font-weight:700; color:#857B69; text-transform:uppercase; letter-spacing:.04em; margin:0 2px 8px;')}>Раскладка по зонам</div>
            <DesignBoard />
          </div>

          {/* quick toolbar for the selected print — sits right under the board so
              the common actions are one tap away, no scrolling to the layers list */}
          {selLayer && <SelectedPrintBar d={d} layer={selLayer} />}

          {/* layers — a touch-friendly list to pick / show-hide / remove a print */}
          {layers.length === 0 ? (
            <div style={css('width:100%; padding:16px; border-radius:13px; border:1.5px dashed #C9BBA0; background:#FAF6EE; color:#6F6655; text-align:center; font-size:12.5px;')}>Загрузите логотип или картинку — она появится на раскладке, тяните её пальцем в нужную зону.</div>
          ) : (
            <div style={css('display:flex; flex-direction:column; gap:8px;')}>
              {layers.map(l => {
                const sel = l.id === d.selectedId
                return (
                  <div key={l.id} onClick={() => d.selectLayer(l.id)} style={css(`display:flex; align-items:center; gap:10px; border:1.5px solid ${sel ? '#FCAC45' : '#E7DECF'}; background:${sel ? '#FFFDF8' : '#fff'}; border-radius:12px; padding:9px 10px; cursor:pointer; box-shadow:${sel ? '0 0 0 3px #FCAC4533' : 'none'};`)}>
                    <button title={l.visible ? 'Скрыть' : 'Показать'} onClick={(e) => { e.stopPropagation(); d.toggleVisible(l.id) }} style={css(`width:38px; height:38px; flex:none; border-radius:10px; border:1px solid #E2D9C8; background:${l.visible ? '#fff' : '#F3EEE3'}; color:${l.visible ? '#15120D' : '#BCB2A0'}; cursor:pointer; display:grid; place-items:center;`)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="2.6" /></svg>
                    </button>
                    <div style={css('flex:1; min-width:0;')}>
                      <div style={css('font-weight:700; font-size:13.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;')}>{l.name || 'Принт'}</div>
                      <div style={css('font-size:11px; color:#988E7B;')}>{({ front: 'Перёд', back: 'Спина', sleeveL: 'Лев. рукав', sleeveR: 'Прав. рукав' })[l.zone] || 'Все зоны'}{sel ? ' · редактируется' : ''}</div>
                    </div>
                    <button title="Удалить" onClick={(e) => { e.stopPropagation(); d.deleteLayer(l.id) }} style={css('width:38px; height:38px; flex:none; border-radius:10px; border:1px solid #f0d8d3; background:#fff; color:#B23A2E; cursor:pointer; font-size:15px; display:grid; place-items:center;')}>✕</button>
                  </div>
                )
              })}
            </div>
          )}

          {/* exports */}
          <div style={css('display:flex; gap:6px; margin-top:14px;')}>
            <button onClick={() => d.exportArtwork()} title="Файл для печати (PNG)" style={exportBtn}>Артворк</button>
            <button onClick={() => d.exportSnapshot()} title="Снимок 3D (PNG)" style={exportBtn}>3D-снимок</button>
            <button onClick={() => d.exportJson()} title="Спецификация (JSON)" style={exportBtn}>JSON</button>
          </div>
        </div>
      </div>

      {/* footer */}
      <div style={css('flex:none; border-top:1px solid rgba(21,18,13,.10); padding:16px 22px; background:#FAF6EE;')}>
        <div style={css('display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:12px;')}>
          <div style={css('display:flex; flex-direction:column; gap:2px; min-width:0;')}>
            <span style={css("font-family:'Oswald'; font-weight:600; text-transform:uppercase; font-size:13px; letter-spacing:.03em;")}>Футболка · {ColorName(d.shirtColor)}</span>
            <span style={css('font-size:12px; color:#857B69;')}>{layers.length ? `${layers.length} ${layers.length === 1 ? 'принт' : 'принтов'} на макете` : 'Принты не добавлены'}</span>
          </div>
          <div style={css('text-align:right; flex:none;')}>
            <span style={css('font-size:11px; color:#988E7B; display:block;')}>Цена</span>
            <span style={css("font-family:'Oswald'; font-weight:700; font-size:16px; line-height:1; white-space:nowrap;")}>по запросу</span>
          </div>
        </div>
        <button onClick={onOrder} style={css('display:flex; align-items:center; justify-content:center; gap:9px; width:100%; background:#FCAC45; color:#15120D; font-weight:700; font-size:16px; padding:15px; border:0; border-radius:13px; cursor:pointer;')}>
          {biz ? 'Рассчитать в Telegram' : 'Получить КП на этот макет'}
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </aside>
  )
}

const iconBtn = css('width:26px; height:26px; border-radius:7px; border:1px solid #E2D9C8; background:#fff; color:#15120D; cursor:pointer; font-size:13px; line-height:1;')
const exportBtn = css('flex:1; font-size:11.5px; font-weight:700; color:#6F6655; background:#fff; border:1px solid #E2D9C8; border-radius:9px; padding:9px 4px; cursor:pointer;')

function OrderModal({ open, onClose, audience }) {
  const d = useDesigner()
  const [sent, setSent] = useState(false)
  if (!open) return null
  const biz = audience === 'b2b'
  const layers = d.layers || []
  const submit = (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    try {
      d.submitOrder({
        name: fd.get('name') || '',
        phone: fd.get('phone') || '',
        qty: fd.get('qty') || '',
        audience,
        colorName: ColorName(d.shirtColor),
        productLabel: 'Футболка',
      })
    } catch (_) {}
    setSent(true)
  }
  return (
    <div onClick={onClose} style={css('position:fixed; inset:0; z-index:40; background:rgba(21,18,13,.5); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; padding:24px;')}>
      <div onClick={(e) => e.stopPropagation()} style={css('width:100%; max-width:460px; max-height:88vh; overflow-y:auto; background:#F5EFE5; border-radius:22px; box-shadow:0 30px 80px rgba(0,0,0,.4);')}>
        {!sent ? (
          <div style={css('padding:26px 26px 24px;')}>
            <div style={css('display:flex; align-items:center; justify-content:space-between; margin-bottom:18px;')}>
              <h3 style={css("font-family:'Oswald'; font-weight:700; text-transform:uppercase; font-size:24px; margin:0;")}>{biz ? 'Рассчитать заказ' : 'Ваш макет'}</h3>
              <button onClick={onClose} aria-label="Закрыть" style={css('width:36px; height:36px; border-radius:999px; border:1px solid rgba(21,18,13,.14); background:#fff; font-size:17px; cursor:pointer;')}>✕</button>
            </div>
            <div style={css('background:#fff; border:1px solid #E7DECF; border-radius:16px; padding:6px 18px; margin-bottom:14px;')}>
              <div style={css('display:flex; justify-content:space-between; padding:11px 0; border-bottom:1px solid #F0E8D9;')}><span style={css('color:#857B69; font-size:14px;')}>Изделие</span><span style={css('font-weight:700; font-size:14px;')}>Футболка</span></div>
              <div style={css('display:flex; justify-content:space-between; padding:11px 0; border-bottom:1px solid #F0E8D9;')}><span style={css('color:#857B69; font-size:14px;')}>Цвет</span><span style={css('font-weight:700; font-size:14px;')}>{ColorName(d.shirtColor)}</span></div>
              <div style={css('display:flex; justify-content:space-between; padding:11px 0;')}><span style={css('color:#857B69; font-size:14px;')}>Принтов</span><span style={css('font-weight:700; font-size:14px;')}>{layers.length}</span></div>
            </div>
            <form onSubmit={submit} style={css('display:flex; flex-direction:column; gap:11px;')}>
              <div style={css('display:flex; gap:10px; flex-wrap:wrap;')}>
                <input type="text" name="name" placeholder="Имя" required style={inp} />
                <input type="tel" name="phone" placeholder="Телефон" required style={inp} />
              </div>
              <input type="text" name="qty" placeholder="Тираж, шт (например, 50)" style={css('border:1px solid #E2D9C8; background:#fff; border-radius:11px; padding:13px 15px; font-size:15px; font-family:inherit; outline:none;')} />
              <button type="submit" style={css('display:flex; align-items:center; justify-content:center; gap:8px; background:#15120D; color:#F5EFE5; font-weight:700; font-size:16px; padding:15px; border:0; border-radius:12px; cursor:pointer; margin-top:2px;')}>{biz ? 'Рассчитать в Telegram →' : 'Отправить заявку →'}</button>
              <p style={css('margin:2px 0 0; color:#A79C88; font-size:11.5px; line-height:1.4; text-align:center;')}>Макет со всех сторон уйдёт менеджеру в Telegram. Пришлём точную цену и сроки в течение рабочего дня.</p>
            </form>
          </div>
        ) : (
          <div style={css('padding:40px 30px; display:flex; flex-direction:column; align-items:center; text-align:center; gap:14px;')}>
            <span style={css('width:64px; height:64px; border-radius:999px; background:#FCAC45; color:#15120D; display:grid; place-items:center; font-size:30px;')}>✓</span>
            <h3 style={css("font-family:'Oswald'; font-weight:700; text-transform:uppercase; font-size:26px; margin:0;")}>{biz ? 'Запрос отправлен!' : 'Заявка отправлена!'}</h3>
            <p style={css('margin:0; color:#6F6655; font-size:15px; line-height:1.5; max-width:300px;')}>Макет ушёл менеджеру в Telegram: Футболка, {ColorName(d.shirtColor)}, {layers.length} принт(ов). {biz ? 'Пришлём расчёт в короткое время.' : 'Пришлём КП в короткое время.'}</p>
            <button onClick={onClose} style={css('margin-top:6px; background:#15120D; color:#F5EFE5; font-weight:700; font-size:15px; padding:13px 26px; border:0; border-radius:999px; cursor:pointer;')}>Готово</button>
          </div>
        )}
      </div>
    </div>
  )
}
const inp = css('flex:1 1 130px; min-width:0; border:1px solid #E2D9C8; background:#fff; border-radius:11px; padding:13px 15px; font-size:15px; font-family:inherit; outline:none;')

function Inner() {
  const [open, setOpen] = useState(false)
  const [audience] = useState(getAudience)
  return (
    <>
      <style>{`
        @keyframes fp-spin{to{transform:rotate(360deg)}}
        .fp-studio{display:flex;flex-direction:column;height:100vh;height:100dvh;min-height:560px;overflow:hidden;background:#F5EFE5;color:#15120D;font-family:'Manrope',system-ui,sans-serif}
        .fp-studio ::-webkit-scrollbar{width:10px;height:10px}
        .fp-studio ::-webkit-scrollbar-thumb{background:#D8CDB8;border-radius:999px;border:3px solid transparent;background-clip:content-box}
        .fp-main{flex:1;display:flex;min-height:0}
        .fp-stage{flex:1 1 460px;min-width:300px;position:relative;min-height:340px;display:flex;flex-direction:column}
        .fp-panel{flex:1 1 400px;max-width:460px;min-width:330px;display:flex;flex-direction:column;min-height:0;background:#fff;border-left:1px solid rgba(21,18,13,.10)}
        .fp-scroll{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:22px 22px 8px}
        .ftee-3d{flex:1;min-height:0;position:relative}
        .ftee-3d .preview3d{position:absolute;inset:0;height:100%!important;width:100%}
        @media (max-width:900px){
          .fp-studio{height:auto;min-height:100vh;min-height:100dvh;overflow:visible}
          .fp-main{flex-direction:column}
          .fp-stage{flex:none;width:100%;height:54vh;min-height:320px}
          .ftee-3d{min-height:300px}
          .fp-panel{flex:none;max-width:none;width:100%;border-left:0;border-top:1px solid rgba(21,18,13,.10)}
          .fp-scroll{overflow:visible}
        }
      `}</style>

      <div className="fp-studio">
        <header style={css('flex:none; display:flex; align-items:center; gap:18px; padding:12px 22px; border-bottom:1px solid rgba(21,18,13,.10); background:rgba(245,239,229,.9); backdrop-filter:blur(10px); z-index:6;')}>
          <Link to="/" aria-label="Folk Print" style={css('display:inline-flex; align-items:center; text-decoration:none;')}><Logo variant="black" height={30} /></Link>
          <span style={css('width:1px; height:24px; background:rgba(21,18,13,.14);')}></span>
          <div style={css('display:flex; flex-direction:column; line-height:1;')}>
            <span style={css("font-family:'Oswald'; font-weight:600; text-transform:uppercase; font-size:15px; letter-spacing:.02em;")}>Студия 3D-мокапов</span>
            <span style={css('font-size:11.5px; color:#988E7B; margin-top:2px;')}>Реальная футболка · точная печать · отправьте на расчёт</span>
          </div>
          <div style={{ flex: 1 }}></div>
          <div style={css('display:flex; gap:4px; background:#fff; border:1px solid #E7DECF; border-radius:999px; padding:4px;')}>
            <Link to="/lichnoe" style={css('color:#15120D; font-weight:700; font-size:12px; padding:7px 14px; border-radius:999px; letter-spacing:.04em; text-decoration:none;')}>ЛИЧНОЕ</Link>
            <Link to="/biznesu" style={css('color:#15120D; font-weight:700; font-size:12px; padding:7px 14px; border-radius:999px; letter-spacing:.04em; text-decoration:none;')}>БИЗНЕСУ</Link>
          </div>
        </header>

        <div className="fp-main">
          <div className="fp-stage" style={css('background:radial-gradient(125% 95% at 50% 14%, #F1EEE7 0%, #E1DACB 60%, #D2C9B8 100%);')}>
            <div style={css('position:absolute; left:18px; top:16px; z-index:3; pointer-events:none; display:flex; flex-direction:column; gap:7px;')}>
              <span style={css('display:inline-flex; align-items:center; gap:7px; background:rgba(255,255,255,.78); backdrop-filter:blur(6px); border:1px solid rgba(21,18,13,.08); color:#6F6655; font-size:12px; font-weight:600; padding:6px 11px; border-radius:999px; width:max-content;')}>Тяните — повернуть · два пальца — приблизить</span>
            </div>
            <div className="ftee-3d">
              <Suspense fallback={<div style={css('position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:#988E7B; font-family:\'Oswald\'; font-weight:600; text-transform:uppercase; font-size:13px; letter-spacing:.08em;')}>Загружаем 3D…</div>}>
                <Editor3D />
              </Suspense>
            </div>
          </div>
          <Panel onOrder={() => setOpen(true)} audience={audience} />
        </div>

        <OrderModal open={open} onClose={() => setOpen(false)} audience={audience} />
      </div>
    </>
  )
}

export default function StudioTee({ lang } = {}) {
  return (
    <I18nProvider lang="ru">
      <DesignerProvider>
        <Inner />
      </DesignerProvider>
    </I18nProvider>
  )
}

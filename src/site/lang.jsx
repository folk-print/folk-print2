import { createContext, useContext, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

// Bilingual UZ / RU. Language is URL-driven so each language has a crawlable,
// shareable address (RU at /…, UZ under /uz/…) — required for hreflang SEO.
// The toggle navigates between the mirrored URLs; RU is the default (no prefix).
const LANGS = ['ru', 'uz']
const LangContext = createContext({ lang: 'ru', setLang: () => {} })

const isUz = (p) => p === '/uz' || p.startsWith('/uz/')

export function LangProvider({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const lang = isUz(location.pathname) ? 'uz' : 'ru'

  useEffect(() => { try { document.documentElement.lang = lang } catch (e) {} }, [lang])

  const setLang = (l) => {
    if (!LANGS.includes(l) || l === lang) return
    const p = location.pathname
    const next = l === 'uz'
      ? (p === '/' ? '/uz' : '/uz' + p)                 // /lichnoe → /uz/lichnoe
      : (p.replace(/^\/uz(?=\/|$)/, '') || '/')         // /uz/lichnoe → /lichnoe
    try { localStorage.setItem('fp-lang', l) } catch (e) {}
    navigate(next + location.search + location.hash)
  }

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
}

export function useLang() { return useContext(LangContext) }

// UZ | RU pill toggle — drop into any header. `tone="dark"` for placing on dark surfaces.
export function LangToggle({ style, tone }) {
  const { lang, setLang } = useLang()
  const dark = tone === 'dark'
  const wrap = { display: 'inline-flex', gap: '2px', borderRadius: '999px', padding: '3px', background: dark ? 'rgba(255,255,255,.12)' : '#fff', border: dark ? '1px solid rgba(255,255,255,.22)' : '1px solid #E7DECF', ...style }
  const base = { fontFamily: "'Oswald',sans-serif", fontWeight: 600, fontSize: '12px', letterSpacing: '.04em', padding: '6px 11px', borderRadius: '999px', border: 0, cursor: 'pointer', background: 'transparent', color: dark ? '#F5EFE5' : '#15120D', textTransform: 'uppercase', lineHeight: 1 }
  const on = { ...base, background: dark ? '#F5EFE5' : '#15120D', color: dark ? '#15120D' : '#F5EFE5' }
  return (
    <div style={wrap}>
      <button type="button" className="fp-lang-btn" onClick={() => setLang('uz')} style={lang === 'uz' ? on : base} aria-pressed={lang === 'uz'}>UZ</button>
      <button type="button" className="fp-lang-btn" onClick={() => setLang('ru')} style={lang === 'ru' ? on : base} aria-pressed={lang === 'ru'}>RU</button>
    </div>
  )
}

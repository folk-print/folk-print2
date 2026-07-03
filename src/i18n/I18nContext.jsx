import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { STRINGS, LANGS } from './strings.js'

const I18nCtx = createContext(null)
export const useI18n = () => useContext(I18nCtx)

function detectInitial() {
  try {
    const saved = localStorage.getItem('folk-lang')
    if (saved && LANGS.includes(saved)) return saved
  } catch {
    /* ignore */
  }
  const nav = (typeof navigator !== 'undefined' && navigator.language ? navigator.language : '').slice(0, 2)
  return LANGS.includes(nav) ? nav : 'uz'
}

function interpolate(str, params) {
  if (!params) return str
  return str.replace(/\{(\w+)\}/g, (m, k) => (k in params ? params[k] : m))
}

// `lang` may also be forced via the `lang` prop (e.g. from the web component).
// When forced, the provider is "controlled": the in-app switcher is hidden and
// nothing is persisted, so a host-controlled widget can't clobber the standalone
// app's saved language or any other instance on the page.
export function I18nProvider({ lang: forced, children }) {
  const controlled = !!(forced && LANGS.includes(forced))
  const [lang, setLangState] = useState(forced || detectInitial)
  const active = controlled ? forced : lang

  // Keep the last forced value as resolved state, so if the host later clears the
  // attribute the UI stays on that language instead of snapping to the initial one.
  useEffect(() => {
    if (controlled) setLangState(forced)
  }, [controlled, forced])

  const setLang = useCallback((l) => {
    if (controlled || !LANGS.includes(l)) return
    setLangState(l)
    try {
      localStorage.setItem('folk-lang', l)
    } catch {
      /* ignore */
    }
  }, [controlled])

  const t = useCallback(
    (key, params) => {
      const dict = STRINGS[active] || STRINGS.uz
      const s = dict[key] ?? STRINGS.uz[key] ?? key
      return interpolate(s, params)
    },
    [active],
  )

  const value = useMemo(() => ({ lang: active, setLang, t, langs: LANGS, controlled }), [active, setLang, t, controlled])
  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>
}

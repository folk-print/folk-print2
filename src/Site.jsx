import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Suspense, lazy, useEffect, useRef } from 'react'
import { LangProvider, useLang } from './site/lang.jsx'
import { seoForPath } from './config/seo.js'
import { runtime } from './config/runtime.js'
import { track } from './lib/analytics.js'
import B2B from './site/B2B.jsx'
import B2C from './site/B2C.jsx'

// Studio pulls in three.js — lazy-load it so the entrance/landings stay light.
const Studio = lazy(() => import('./site/StudioTee.jsx'))

function StudioFallback({ lang }) {
  const label = lang === 'uz' ? 'Studiya yuklanmoqda…' : 'Загружаем студию…'
  return (
    <div className="fp-route" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: '#F5EFE5', color: '#988E7B', fontFamily: "'Manrope',system-ui,sans-serif" }}>
      <style>{'@keyframes fp-spin{to{transform:rotate(360deg)}}'}</style>
      <div style={{ width: 38, height: 38, border: '3px solid rgba(21,18,13,.15)', borderTopColor: '#FCAC45', borderRadius: 999, animation: 'fp-spin .8s linear infinite' }} />
      <span style={{ fontFamily: "'Oswald',sans-serif", fontWeight: 600, textTransform: 'uppercase', fontSize: 13, letterSpacing: '.08em' }}>{label}</span>
    </div>
  )
}

// Studio is a class component — feed it the current language as a prop.
// Interim split-hosting: on the apex (Vercel) the studio lives on the VPS at
// runtime.studioOrigin — server-side redirects in vercel.json cover full page
// loads; this covers SPA navigations (header links render the route locally
// otherwise). localhost / IP staging / the studio subdomain render in place.
function StudioRoute() {
  const { lang } = useLang()
  const onApex = typeof window !== 'undefined' && /^(www\.)?folkprint\.uz$/.test(window.location.hostname)
  if (runtime.studioOrigin && onApex) {
    window.location.replace(runtime.studioOrigin + window.location.pathname + window.location.search)
    return <StudioFallback lang={lang} />
  }
  return <Suspense fallback={<StudioFallback lang={lang} />}><Studio lang={lang} /></Suspense>
}

// Wraps a freshly-mounted 2D route so .fp-route replays fpRouteIn on every nav.
function Page({ children }) {
  return <div className="fp-route">{children}</div>
}

// Reset scroll on navigation, but keep #anchor deep-links working.
function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) return
    window.scrollTo({ top: 0, left: 0 })
  }, [pathname, hash])
  return null
}

// The static per-route shells set the right <title> for crawlers + first paint;
// this keeps the browser tab title correct on client-side (SPA) navigation, and
// fires a GA4/Ads page_view for SPA navs (the initial load's page_view comes from
// the gtag config in index.html — skip the first run to avoid double-counting).
function TitleSync() {
  const { pathname } = useLocation()
  const firstRun = useRef(true)
  useEffect(() => {
    const s = seoForPath(pathname)
    if (s && s.title) document.title = s.title
    if (firstRun.current) { firstRun.current = false; return }
    track('page_view', {
      page_location: window.location.href,
      page_path: pathname,
      page_title: document.title,
    })
  }, [pathname])
  return null
}

// / = business landing (home, RU). /lichnoe = personal; /studio = designer.
// UZ mirrors live under /uz (crawlable for hreflang). /biznesu kept as an alias.
export default function Site() {
  return (
    <BrowserRouter>
      <LangProvider>
        <ScrollToTop />
        <TitleSync />
        <Routes>
          {/* RU (default, no prefix) */}
          <Route path="/" element={<Page><B2B /></Page>} />
          <Route path="/lichnoe" element={<Page><B2C /></Page>} />
          <Route path="/studio" element={<StudioRoute />} />
          {/* UZ mirror */}
          <Route path="/uz" element={<Page><B2B /></Page>} />
          <Route path="/uz/lichnoe" element={<Page><B2C /></Page>} />
          <Route path="/uz/studio" element={<StudioRoute />} />
          {/* alias + fallback */}
          <Route path="/biznesu" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LangProvider>
    </BrowserRouter>
  )
}

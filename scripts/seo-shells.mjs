// Post-build SEO: turn the single Vite index.html into per-route, per-language
// static shells (correct <title>/description/canonical/hreflang/OG/JSON-LD baked
// into the HTML head), and emit a real robots.txt + sitemap.xml. Crawlers and
// social scrapers (which don't run JS) get the right meta for every URL; the SPA
// still hydrates normally from the same bundle.
//
// Run automatically after `vite build` (see package.json "build").
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SITE_URL, BUSINESS, SERVICES, PAGES } from '../src/config/seo.js'

const DIST = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const OG_IMAGE = SITE_URL + BUSINESS.ogImage

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// RU lives at /path, UZ mirrors under /uz/path. `base` defaults to the site host
// but a page can override it (page.canonHost) when it's served from another host
// (the studio lives on the cassist VPS) — its shell then self-canonicals there.
const ruUrl = (path, base = SITE_URL) => base + path
const uzUrl = (path, base = SITE_URL) => base + '/uz' + (path === '/' ? '' : path)
const outFile = (path, lang) => {
  const seg = path === '/' ? '' : path
  return lang === 'uz' ? `${DIST}/uz${seg}/index.html` : (path === '/' ? `${DIST}/index.html` : `${DIST}${seg}/index.html`)
}

function jsonLd(page, lang, canonical) {
  const org = {
    '@type': 'Organization', '@id': `${SITE_URL}/#org`, name: BUSINESS.name, url: SITE_URL + '/',
    foundingDate: BUSINESS.foundingDate, logo: OG_IMAGE, sameAs: [BUSINESS.telegram, BUSINESS.telegramBiz, BUSINESS.instagram, BUSINESS.instagram2],
  }
  const biz = {
    '@type': ['LocalBusiness', 'ClothingStore'], '@id': `${SITE_URL}/#business`, name: BUSINESS.name, url: SITE_URL + '/',
    image: OG_IMAGE, foundingDate: BUSINESS.foundingDate,
    telephone: [BUSINESS.phone, BUSINESS.phone2],
    address: { '@type': 'PostalAddress', streetAddress: BUSINESS.streetAddress, addressLocality: lang === 'uz' ? BUSINESS.cityUz : BUSINESS.city, addressCountry: BUSINESS.country },
    geo: { '@type': 'GeoCoordinates', latitude: BUSINESS.lat, longitude: BUSINESS.lng },
    openingHoursSpecification: { '@type': 'OpeningHoursSpecification', dayOfWeek: BUSINESS.openingHours.days, opens: BUSINESS.openingHours.opens, closes: BUSINESS.openingHours.closes },
    areaServed: BUSINESS.areaServed, priceRange: '$$',
    hasOfferCatalog: {
      '@type': 'OfferCatalog', name: lang === 'uz' ? 'Bosma xizmatlari' : 'Услуги печати',
      itemListElement: SERVICES.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s } })),
    },
    sameAs: [BUSINESS.telegram],
  }
  const graph = [org, biz]
  if (page.key === 'studio') {
    graph.push({
      '@type': 'WebApplication', name: (lang === 'uz' ? page.uz.title : page.ru.title), url: canonical,
      applicationCategory: 'DesignApplication', operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'UZS' }, provider: { '@id': `${SITE_URL}/#org` },
    })
  }
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })
}

// Swap a meta tag's content= value in place (keeps Vite's asset tags untouched).
const setContent = (html, tagRe, content) =>
  html.replace(tagRe, (m) => m.replace(/content="[^"]*"/, `content="${esc(content)}"`))

// Static, crawlable page content injected INTO <div id="root"> — the old site was
// fully server-rendered, so the ranking must not depend on JS rendering (Yandex and
// the Ads landing-page crawler are unreliable JS renderers). Doubles as a branded
// splash until React mounts: createRoot() replaces the container content on render,
// so there is no hydration mismatch.
function rootContent(page, lang) {
  const s = lang === 'uz' ? page.uz : page.ru
  const t = (ru, uz) => (lang === 'uz' ? uz : ru)
  const products = t(
    'Футболки, поло, худи и толстовки, кепки, униформа и спецодежда, промо-одежда, сумки, корпоративные подарки и мерч',
    "Futbolkalar, polo, xudi va tolstovkalar, kepkalar, forma va maxsus kiyim, promo-kiyim, sumkalar, korporativ sovg'alar va merch"
  )
  const services = t(
    'Вышивка, шёлкография, DTF-печать, термотрансфер, шевроны — нанесение логотипа на одежду',
    'Kashta, shyolkografiya, DTF bosma, termotransfer, shevronlar — kiyimga logotip tushirish'
  )
  const geo = t(
    'Работаем в Ташкенте, доставка по всему Узбекистану — с 2014 года.',
    "Toshkentda ishlaymiz, butun O'zbekiston bo'ylab yetkazib beramiz — 2014-yildan."
  )
  const a = (href, label) => `<a href="${href}" style="color:inherit">${esc(label)}</a>`
  return [
    `<div class="fp-prerender" style="font-family:'Manrope',system-ui,sans-serif;background:#F5EFE5;color:#15120D;min-height:100vh;margin:0 auto;padding:48px 24px;box-sizing:border-box">`,
    `<div style="max-width:880px;margin:0 auto">`,
    `<h1 style="font-family:'Oswald',sans-serif;text-transform:uppercase;font-size:clamp(22px,4vw,34px);line-height:1.15;margin:0 0 14px">${esc(s.h1)}</h1>`,
    `<p style="margin:0 0 10px">${esc(s.description)}</p>`,
    `<p style="margin:0 0 10px">${esc(products)}.</p>`,
    `<p style="margin:0 0 10px">${esc(services)}.</p>`,
    `<p style="margin:0 0 18px">${esc(geo)}</p>`,
    `<p style="margin:0;font-size:14px;color:#5d5546">Folk Print · ${esc(BUSINESS.streetAddress)}, ${esc(lang === 'uz' ? BUSINESS.cityUz : BUSINESS.city)} · ` +
      `${a('tel:' + BUSINESS.phone, '+998 95 787 77 55')} · ${a('tel:' + BUSINESS.phone2, '+998 33 338 86 08')} · ${a(BUSINESS.telegram, 'Telegram')}</p>`,
    `</div></div>`,
  ].join('')
}

function buildShell(template, page, lang) {
  const s = lang === 'uz' ? page.uz : page.ru
  const base = page.canonHost || SITE_URL
  const canonical = lang === 'uz' ? uzUrl(page.path, base) : ruUrl(page.path, base)
  let html = template
  html = html.replace(/<html lang="[^"]*"/, `<html lang="${lang}"`)
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(s.title)}</title>`)
  html = setContent(html, /<meta name="description"[^>]*>/, s.description)
  html = setContent(html, /<meta property="og:title"[^>]*>/, s.title)
  html = setContent(html, /<meta property="og:description"[^>]*>/, s.description)
  html = setContent(html, /<meta property="og:image"[^>]*>/, OG_IMAGE)

  const head = [
    `<link rel="canonical" href="${canonical}" />`,
    `<link rel="alternate" hreflang="ru" href="${ruUrl(page.path, base)}" />`,
    `<link rel="alternate" hreflang="uz" href="${uzUrl(page.path, base)}" />`,
    `<link rel="alternate" hreflang="x-default" href="${ruUrl(page.path, base)}" />`,
    `<meta name="keywords" content="${esc(s.keywords.join(', '))}" />`,
    `<meta name="robots" content="index, follow" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:site_name" content="Folk Print" />`,
    `<meta property="og:locale" content="${lang === 'uz' ? 'uz_UZ' : 'ru_RU'}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(s.title)}" />`,
    `<meta name="twitter:description" content="${esc(s.description)}" />`,
    `<meta name="twitter:image" content="${OG_IMAGE}" />`,
    `<meta name="geo.region" content="${BUSINESS.region}" />`,
    `<meta name="geo.placename" content="${lang === 'uz' ? BUSINESS.cityUz : BUSINESS.city}" />`,
    `<meta name="geo.position" content="${BUSINESS.lat};${BUSINESS.lng}" />`,
    `<meta name="ICBM" content="${BUSINESS.lat}, ${BUSINESS.lng}" />`,
    `<script type="application/ld+json">${jsonLd(page, lang, canonical)}</script>`,
  ].map((l) => '    ' + l).join('\n')

  // Function replacer (not a string) so `$`/`$$` inside `head` — e.g. the JSON-LD
  // priceRange "$$" — are inserted verbatim, not treated as replace() specials.
  html = html.replace('</head>', () => head + '\n  </head>')
  html = html.replace('<div id="root"></div>', () => `<div id="root">${rootContent(page, lang)}</div>`)
  const file = outFile(page.path, lang)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, html)
  return canonical
}

function sitemap() {
  const alt = (path) => [
    `    <xhtml:link rel="alternate" hreflang="ru" href="${ruUrl(path)}"/>`,
    `    <xhtml:link rel="alternate" hreflang="uz" href="${uzUrl(path)}"/>`,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${ruUrl(path)}"/>`,
  ].join('\n')
  const urls = []
  for (const p of PAGES) {
    if (p.canonHost) continue // served off-domain (studio→cassist) — not in this host's sitemap
    for (const loc of [ruUrl(p.path), uzUrl(p.path)]) {
      urls.push(`  <url>\n    <loc>${loc}</loc>\n${alt(p.path)}\n  </url>`)
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`
}

// ---- run ----
const template = readFileSync(`${DIST}/index.html`, 'utf8')
let count = 0
for (const page of PAGES) {
  for (const lang of ['ru', 'uz']) { buildShell(template, page, lang); count++ }
}
writeFileSync(`${DIST}/robots.txt`, `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`)
writeFileSync(`${DIST}/sitemap.xml`, sitemap())

// noindex 404 shell. Vercel serves dist/404.html with a real HTTP 404 status for
// any path that has no static file and no rewrite/redirect match — so unknown URLs
// (e.g. stale links, crawler probes) stop soft-404ing (returning 200 with the home
// shell). robots=noindex keeps the 404 body itself out of the index.
{
  let nf = template
  nf = nf.replace(/<html lang="[^"]*"/, '<html lang="ru"')
  nf = nf.replace(/<title>[\s\S]*?<\/title>/, '<title>Страница не найдена · Folk Print</title>')
  nf = nf.replace('</head>', '    <meta name="robots" content="noindex, follow" />\n  </head>')
  nf = nf.replace('<div id="root"></div>', () =>
    `<div id="root"><div style="font-family:'Manrope',system-ui,sans-serif;background:#F5EFE5;color:#15120D;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:24px;box-sizing:border-box">` +
    `<h1 style="font-family:'Oswald',sans-serif;font-size:26px;margin:0">Страница не найдена</h1>` +
    `<p style="margin:0"><a href="/" style="color:inherit">На главную — Folk Print</a></p></div></div>`)
  writeFileSync(`${DIST}/404.html`, nf)
}

const sitemapUrls = PAGES.filter((p) => !p.canonHost).length * 2
console.log(`[seo-shells] wrote ${count} route shells + 404.html + robots.txt + sitemap.xml (${sitemapUrls} sitemap URLs)`)

// GA4 / Google Ads event layer. The gtag loader lives in index.html (so it is baked
// into every per-route SEO shell); this module only SENDS events and is a silent
// no-op when gtag is absent (dev server, web-component embeds, ad blockers).
//
// Event taxonomy carried over from the live folkprint.uz — Google Ads imports
// `generate_lead` as its conversion action, so that event NAME must never change:
//   generate_lead  { event_category:'form',    event_label:'contact_form'|'studio_order' }
//   click_phone    { event_category:'contact', event_label }
//   click_telegram { event_category:'contact', event_label }

export function track(name, params) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') window.gtag('event', name, params)
  } catch (_) {}
}

// generate_lead: observe the app's own POSTs to the lead/order endpoints instead of
// instrumenting each form (the B2B/B2C forms and the studio order modal all funnel
// through these two URLs). Observe-only — the request/response are never altered.
// Submissions with the `hp` honeypot filled are bots: no conversion fired.
function watchLeadPosts() {
  const orig = window.fetch
  if (typeof orig !== 'function' || orig.__fpWrapped) return
  const wrapped = function (input, init) {
    try {
      const url = typeof input === 'string' ? input : (input && input.url) || ''
      const method = String((init && init.method) || (input && input.method) || 'GET').toUpperCase()
      const isLead = url.endsWith('/api/lead')
      const isOrder = url.endsWith('/api/order')
      if (method === 'POST' && (isLead || isOrder)) {
        // Only peek at the body's head: /api/order carries a multi-MB snapshot dataURL.
        const head = String((init && init.body) || '').slice(0, 400)
        const spam = /"hp"\s*:\s*"[^"]/.test(head)
        if (!spam) {
          const source = (head.match(/"source"\s*:\s*"([^"]+)"/) || [])[1]
          track('generate_lead', {
            event_category: 'form',
            event_label: isOrder ? 'studio_order' : 'contact_form',
            lead_source: source,
          })
        }
      }
    } catch (_) {}
    return orig.apply(this, arguments)
  }
  wrapped.__fpWrapped = true
  window.fetch = wrapped
}

// click_phone / click_telegram: one delegated listener covers every contact link,
// present and future, without touching the page components. Label = the page the
// click happened on (override per-link with data-track).
function watchContactClicks() {
  document.addEventListener(
    'click',
    (e) => {
      try {
        const a = e.target && e.target.closest && e.target.closest('a[href]')
        if (!a) return
        const href = a.getAttribute('href') || ''
        const label = a.dataset.track || window.location.pathname
        if (href.startsWith('tel:')) {
          track('click_phone', { event_category: 'contact', event_label: label, phone_number: href.slice(4) })
        } else if (/^(https?:\/\/)?(www\.)?t\.me\//.test(href)) {
          track('click_telegram', { event_category: 'contact', event_label: label })
        }
      } catch (_) {}
    },
    { capture: true, passive: true }
  )
}

export function initAnalytics() {
  if (typeof window === 'undefined' || window.__fpAnalytics) return
  window.__fpAnalytics = true
  watchLeadPosts()
  watchContactClicks()
}

import { createRoot } from 'react-dom/client'
import Site from './Site.jsx'
import { initAnalytics } from './lib/analytics.js'
import './styles.css'

// SPA entry only — the web-component build (webcomponent.jsx) must not hook the
// host page's fetch/clicks.
initAnalytics()

// Not wrapped in <StrictMode>: strict mode double-invokes effects in dev, which
// would init/dispose the Fabric canvas twice on the /studio route.
createRoot(document.getElementById('root')).render(<Site />)

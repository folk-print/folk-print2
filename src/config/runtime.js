// Runtime overrides settable before the app mounts (used by the web component to
// accept attributes like the model URL without rebuilding).
export const runtime = {
  modelUrl: null, // overrides products.js model3d.src when set
  // Where the КП / "Рассчитать" button POSTs the design + 3D mockup. Same-origin
  // relative path — the studio's own nginx proxies /api/order to the leadbot, which
  // relays text + the mockup photo to the Telegram group (token stays server-side).
  // Relative so it works over http OR https with no CORS / mixed-content issues.
  orderEndpoint: '/api/order',
  // Interim split-hosting: the landings live on Vercel (folkprint.uz) while the 3D
  // studio is served from the VPS on this host (*.cassist.uz wildcard already points
  // at the VPS — NB: hyphen, not underscore: CAs refuse certs for "_" hostnames).
  // The apex bounces /studio here (Site.jsx StudioRoute + vercel.json redirects).
  // Set to null once the studio moves back onto the apex host.
  studioOrigin: 'https://folkprint-studio.cassist.uz',
}

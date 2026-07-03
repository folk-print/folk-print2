// Image slot. Renders a real <img> when `src` is given, otherwise a polished,
// branded placeholder (soft tone panel + faint FP watermark + small label) so
// unfilled photo areas look intentional rather than broken. Drop real photos in
// /public/photos and pass src="/photos/<file>".
//
// Serves WebP (≈half the bytes) via <picture> with the original JPEG/PNG as a
// universal fallback — just drop an <name>.webp next to <name>.jpg and it's used
// automatically. Pass `priority` for above-the-fold images (eager load → faster LCP).
import { useState } from 'react'

const toWebp = (s) => s.replace(/\.(jpe?g|png)(\?.*)?$/i, '.webp$2')
const niceAlt = (alt, label) =>
  alt || (label || '').replace(/^(фото|foto)\s*[·•]\s*/i, '').replace(/^(кейс|keys)\s*[:·]\s*/i, '').trim()

export default function Slot({ src, alt = '', label = 'Фото', radius = 12, priority = false, style, ...rest }) {
  const [loaded, setLoaded] = useState(false)
  if (src) {
    const webp = toWebp(src)
    const img = (
      <img
        src={src}
        alt={niceAlt(alt, label)}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        ref={(node) => { if (node && node.complete) setLoaded(true) }}
        onLoad={() => setLoaded(true)}
        style={{
          display: 'block', width: '100%', height: '100%', objectFit: 'cover', borderRadius: radius,
          opacity: loaded ? 1 : 0, transition: 'opacity var(--fp-dur) var(--fp-ease), transform .6s var(--fp-ease-out)', ...style,
        }}
        {...rest}
      />
    )
    if (webp === src) return img
    return (
      <picture style={{ display: 'contents' }}>
        <source srcSet={webp} type="image/webp" />
        {img}
      </picture>
    )
  }
  return (
    <div
      aria-label={alt || label}
      style={{
        position: 'relative', display: 'grid', placeItems: 'center', width: '100%', height: '100%',
        background: 'linear-gradient(135deg,#F1E8D7,#E6DBC4)', borderRadius: radius, overflow: 'hidden', ...style,
      }}
      {...rest}
    >
      <img src="/brand/logo-black.png" alt="" aria-hidden="true"
        style={{ position: 'absolute', width: '54%', maxWidth: 210, opacity: 0.06 }} />
      <span style={{
        position: 'relative', zIndex: 1, color: '#A99A80', fontFamily: "'Oswald',sans-serif",
        fontWeight: 600, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase',
        textAlign: 'center', padding: '0 14px', lineHeight: 1.4,
      }}>{label}</span>
    </div>
  )
}

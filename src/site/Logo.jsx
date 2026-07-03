// Real Folk Print logo (FP monogram + wordmark) — transparent PNG, two variants.
// variant="black" for light surfaces, variant="amber" for dark surfaces.
export default function Logo({ variant = 'black', height = 36, alt = 'Folk Print', style }) {
  const src = variant === 'amber' ? '/brand/logo-amber.png' : '/brand/logo-black.png'
  return <img src={src} alt={alt} style={{ height, width: 'auto', display: 'block', ...style }} />
}

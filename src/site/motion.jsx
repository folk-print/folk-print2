import { useRef, useEffect, useState, useCallback } from 'react'

// Shared, dependency-free motion primitives for the site screens.
// Pairs with the keyframes/classes in src/styles.css (.fp-reveal, .fp-stagger, …).
// Everything degrades to instant/visible under prefers-reduced-motion.

const REDUCE_QUERY = '(prefers-reduced-motion: reduce)'

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(REDUCE_QUERY).matches
    : false
}

// Live reduced-motion flag (reacts to the user toggling the OS setting mid-session).
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(prefersReducedMotion)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia(REDUCE_QUERY)
    const onChange = () => setReduced(mq.matches)
    onChange()
    mq.addEventListener ? mq.addEventListener('change', onChange) : mq.addListener(onChange)
    return () => { mq.removeEventListener ? mq.removeEventListener('change', onChange) : mq.removeListener(onChange) }
  }, [])
  return reduced
}

// Ref-callback that adds `is-in` to the node when it scrolls into view (once).
// Already-visible nodes (above the fold) reveal immediately. Cleans its observer up.
export function useReveal(opts = {}) {
  const { threshold = 0.15, rootMargin = '0px 0px -10% 0px' } = opts
  const ioRef = useRef(null)
  return useCallback((node) => {
    if (ioRef.current) { ioRef.current.disconnect(); ioRef.current = null } // ref(null) on unmount → cleanup
    if (!node) return
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') { node.classList.add('is-in'); return }
    const r = node.getBoundingClientRect()
    const vh = window.innerHeight || document.documentElement.clientHeight || 0
    if (r.top < vh && r.bottom > 0) { node.classList.add('is-in'); return } // already on screen at mount
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.disconnect(); ioRef.current = null }
    }, { threshold, rootMargin })
    io.observe(node)
    ioRef.current = io
  }, [threshold, rootMargin])
}

// Convenience wrapper: <Reveal> for a single block, <Reveal stagger> for sequenced children.
// Pass `style`/`className` through; give staggered children inline style={{'--d': i*70+'ms'}}.
export function Reveal({ as: Tag = 'div', stagger = false, className = '', children, ...rest }) {
  const ref = useReveal()
  const base = stagger ? 'fp-stagger' : 'fp-reveal'
  return <Tag ref={ref} className={className ? base + ' ' + className : base} {...rest}>{children}</Tag>
}

// rAF count-up that fires once when the returned ref enters view. Returns { value, ref }.
// Snaps to the target under reduced-motion. `target` is a plain number; format prefix/suffix in the consumer.
export function useCountUp(target, opts = {}) {
  const { duration = 1100 } = opts
  const [value, setValue] = useState(0)
  const started = useRef(false)
  const raf = useRef(0)
  useEffect(() => () => cancelAnimationFrame(raf.current), [])
  const ref = useCallback((node) => {
    if (!node || started.current) return
    const run = () => {
      started.current = true
      let t0 = 0
      const step = (now) => {
        if (!t0) t0 = now
        const p = Math.min(1, (now - t0) / duration)
        const eased = 1 - Math.pow(1 - p, 3)
        setValue(Math.round(target * eased))
        if (p < 1) raf.current = requestAnimationFrame(step)
      }
      raf.current = requestAnimationFrame(step)
    }
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') { started.current = true; setValue(target); return }
    const r = node.getBoundingClientRect()
    const vh = window.innerHeight || 0
    if (r.top < vh && r.bottom > 0) { run(); return }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { io.disconnect(); run() }
    }, { threshold: 0.4 })
    io.observe(node)
  }, [target, duration])
  return { value, ref }
}

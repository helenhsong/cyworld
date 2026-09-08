import { useLayoutEffect, useRef, useState } from 'react'
import tab1 from './assets/journal/tab-1.png'
import tab2 from './assets/journal/tab-2.png'
import tab3 from './assets/journal/tab-3.png'
import './Journal.css'

// Hand-drawn pixel art (Aseprite), exported as PNG and cropped to its
// content bbox — 684x450 native pixels, no upscaling/redrawing. Rendered
// through plain <img> (never a framework image optimizer, which would
// re-encode and blur it) with image-rendering: pixelated in Journal.css
// so the browser scales it with nearest-neighbor sampling, not smoothing.
// The three PNGs are pixel-identical except for which tab pill is drawn
// selected (white) vs. unfocused (purple).
const TABS = [
  { src: tab1, label: 'Tab 1' },
  { src: tab2, label: 'Tab 2' },
  { src: tab3, label: 'Tab 3' },
]

const NATIVE_WIDTH = 684
const NATIVE_HEIGHT = 450

export function Journal() {
  const [active, setActive] = useState(0)
  // .journal's CSS width is a fluid "budget" (see Journal.css); nearest-
  // neighbor scaling only lands every native pixel on the same size
  // block everywhere when the on-screen size is a whole-number multiple
  // of the source — any fractional scale (e.g. budget/684 = 1.3x) makes
  // some 1px lines round up to 2 screen px and others stay at 1. So we
  // measure the budget and snap down to the nearest whole multiple
  // ourselves, rather than letting width:100% stretch to a fractional
  // size.
  const budgetRef = useRef(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const budget = budgetRef.current
    if (!budget) return
    const updateScale = () => {
      const available = budget.getBoundingClientRect().width
      setScale(Math.max(1, Math.floor(available / NATIVE_WIDTH)))
    }
    updateScale()
    const observer = new ResizeObserver(updateScale)
    observer.observe(budget)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="journal" ref={budgetRef}>
      <div
        className="journal-frame"
        style={{ width: NATIVE_WIDTH * scale, height: NATIVE_HEIGHT * scale }}
      >
        <img src={TABS[active].src} alt="Hand-drawn journal" className="journal-page" draggable={false} />
        {TABS.map((tab, i) => (
          <button
            key={tab.label}
            type="button"
            className="journal-tab-hit"
            style={{ '--tab-index': i }}
            aria-pressed={active === i}
            aria-label={`Show ${tab.label}`}
            onClick={() => setActive(i)}
          />
        ))}
      </div>
    </div>
  )
}

import { useState } from 'react'
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
  { src: tab1, label: 'Home' },
  { src: tab2, label: 'Diary' },
  // Was "Photos" — the layout mockup relabeled this "Visitor" (a
  // Cyworld guestbook/visitor-board tab), so going with that instead.
  { src: tab3, label: 'Visitor' },
]

export function Journal() {
  const [active, setActive] = useState(0)

  return (
    <div className="journal">
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
        >
          {tab.label}
        </button>
      ))}

      {/* Left-page content, matching the layout mockup. "TODAY 1 |
          TOTAL 1" is fixed decorative text, not a real visit counter
          (this is a static site with no backend/storage). */}
      <div className="journal-counter">
        TODAY <strong>1</strong> | TOTAL <strong>1</strong>
      </div>
      <div className="journal-title">helen's cyworld</div>
      <div className="journal-site">helenhsong.com</div>

      {/* Placeholder for the profile photo — swap the background
          treatment out once an actual image is dropped in. */}
      <div className="journal-photo-frame" aria-hidden="true" />

      <div className="journal-divider journal-divider-1" aria-hidden="true" />
      <div className="journal-mood">TODAY IS.. 🌹행복</div>
      <div className="journal-status">
        on sabbatical til
        <br />
        end of year ☆彡
      </div>
      <div className="journal-divider journal-divider-2" aria-hidden="true" />
      <div className="journal-name">
        송혜린 <span className="journal-name-en">(HELEN)</span>
      </div>
      <div className="journal-email">helenhsong@gmail.com</div>

      {/* Right-page box, sized to hold a future interactive character —
          empty for now. */}
      <div className="journal-character-box" aria-hidden="true" />
    </div>
  )
}

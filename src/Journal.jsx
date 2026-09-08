import { useState } from 'react'
import tab1 from './assets/journal/tab-1.svg'
import tab2 from './assets/journal/tab-2.svg'
import tab3 from './assets/journal/tab-3.svg'
import './Journal.css'

// Each SVG is a vector trace of the matching hand-drawn Aseprite export
// (traced pixel-for-pixel from the PNG, not redrawn by eye), so it scales
// to any size without the blur/pixelation a raster export would show.
// They differ only in which side tab is drawn selected (white) vs.
// unfocused (purple), same as the original PNGs.
const TABS = [
  { src: tab1, label: 'Tab 1' },
  { src: tab2, label: 'Tab 2' },
  { src: tab3, label: 'Tab 3' },
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
        />
      ))}
    </div>
  )
}

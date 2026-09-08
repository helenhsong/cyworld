import { useState } from 'react'
import tab1 from './assets/journal/tab-1.png'
import tab2 from './assets/journal/tab-2.png'
import tab3 from './assets/journal/tab-3.png'
import './Journal.css'

// Each image is the same hand-drawn journal, differing only in which
// side tab is drawn selected (white) vs. unfocused (purple). The tab hit
// regions below are pixel-mapped to the art (900x633 source) so clicking
// a tab swaps which drawing is shown.
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

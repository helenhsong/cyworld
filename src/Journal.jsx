import { useState } from 'react'
import tab1 from './assets/journal/tab-1.png'
import tab2 from './assets/journal/tab-2.png'
import tab3 from './assets/journal/tab-3.png'
import dp from './assets/journal/dp.jpg'
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

// Placeholder entries — swap in the real reading/watching list (and
// real cover art) whenever it's ready. Each renders as one activity
// card: "Helen <action> <title>" + a relative timestamp, then a cover
// + title/creator card below it, matching the referenced layout.
const DIARY_ENTRIES = [
  { action: 'wants to read', title: 'Untitled Book', creator: 'Author Name', when: '3 days ago' },
  { action: 'is reading', title: 'Another Untitled Book', creator: 'Another Author', when: '1 week ago' },
  { action: 'watched', title: 'Untitled Movie', creator: 'Director Name', when: '2 weeks ago' },
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

      <img src={dp} alt="Helen" className="journal-photo-frame" draggable={false} />

      <div className="journal-divider journal-divider-1" aria-hidden="true" />
      <div className="journal-mood">TODAY IS.. 🌹행복</div>
      <div className="journal-status">
        on sabbatical til
        <br />
        end of year ☆彡
      </div>
      <div className="journal-divider journal-divider-2" aria-hidden="true" />
      <div className="journal-name">Helen Song</div>
      <div className="journal-email">helenhsong@gmail.com</div>

      {/* Right-page content. On the Diary tab this is a scrollable
          read/watched list instead of the character box — both share
          .journal-right-panel's position/size, so the right panel
          occupies the same footprint no matter which tab is active.
          The border (.journal-character-box) is specific to the
          empty Home/Visitor box — the list draws its own separators
          between entries instead. The left panel above never changes
          with the active tab. */}
      {active === 1 ? (
        <div className="journal-right-panel journal-diary-list">
          {DIARY_ENTRIES.map((entry) => (
            <div className="diary-entry" key={entry.title}>
              <div className="diary-action">
                <strong>Helen</strong> {entry.action} <em>{entry.title}</em>
              </div>
              <div className="diary-when">{entry.when}</div>
              <div className="diary-card">
                <div className="diary-cover" aria-hidden="true" />
                <div className="diary-card-info">
                  <div className="diary-card-title">{entry.title}</div>
                  <div className="diary-card-creator">{entry.creator}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Sized to hold a future interactive character — empty for now. */}
          <div className="journal-right-panel journal-character-box" aria-hidden="true" />
          <div className="journal-character-hint">↑ ↓ ← → move the character</div>
        </>
      )}
    </div>
  )
}

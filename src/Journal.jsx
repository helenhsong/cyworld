import { useState } from 'react'
import tab1 from './assets/journal/tab-1.png'
import tab2 from './assets/journal/tab-2.png'
import tab3 from './assets/journal/tab-3.png'
import dp from './assets/journal/dp.jpg'
import { RetroScrollbar } from './RetroScrollbar'
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

// Each entry stores a real Date — formatRelativeTime() below turns it
// into "N days/weeks/months ago" at render time, so it stays accurate
// as time passes instead of going stale like a hardcoded string
// would. Newest first, matching how an activity feed normally reads.
// Real cover art still needed (diagonal-hash placeholder for now).
const DIARY_ENTRIES = [
  { action: 'watched', title: 'Alien (1979)', creator: 'dir. Ridley Scott', date: new Date(2026, 8, 6) },
  { action: 'started reading', title: 'Project Hail Mary', creator: 'Andy Weir', date: new Date(2026, 7, 19) },
  {
    action: 'watched',
    title: 'Spider-Man Brand New Day (2026)',
    creator: 'dir. Destin Daniel Cretton',
    date: new Date(2026, 7, 10),
  },
  { action: 'watched', title: 'The Drama (2026)', creator: 'dir. Kristoffer Borgli', date: new Date(2026, 7, 2) },
  { action: 'watched', title: 'Backrooms (2026)', creator: 'dir. Kane Parsons', date: new Date(2026, 5, 15) },
]

// The "Helen <action> <title>" line reads better without the release
// year that's part of the title everywhere else (the card below keeps
// it in full).
const stripYear = (title) => title.replace(/\s*\(\d{4}\)\s*$/, '')

// Coarsens a day-count into the same "N days/weeks/months/years ago"
// buckets most activity feeds use (e.g. day 21 reads as "3 weeks
// ago", not "21 days ago").
function formatRelativeTime(date, now = new Date()) {
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const days = Math.round((startOfDay(now) - startOfDay(new Date(date))) / 86400000)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) {
    const weeks = Math.floor(days / 7)
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`
  }
  if (days < 365) {
    const months = Math.floor(days / 30)
    return months === 1 ? '1 month ago' : `${months} months ago`
  }
  const years = Math.floor(days / 365)
  return years === 1 ? '1 year ago' : `${years} years ago`
}

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
        <RetroScrollbar className="journal-right-panel">
          <div className="journal-diary-list">
            {DIARY_ENTRIES.map((entry) => (
              <div className="diary-entry" key={entry.title}>
                <div className="diary-action">
                  Helen {entry.action} <strong>{stripYear(entry.title)}</strong>
                </div>
                <div className="diary-when">{formatRelativeTime(entry.date)}</div>
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
        </RetroScrollbar>
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

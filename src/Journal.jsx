import { useEffect, useState } from 'react'
import tab1 from './assets/journal/tab-1.png'
import tab2 from './assets/journal/tab-2.png'
import tab3 from './assets/journal/tab-3.png'
import dp from './assets/journal/dp.png'
import room from './assets/journal/room.png'
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
  // Was "Visitor" (a Cyworld guestbook/visitor-board tab), then a
  // blog-style photo+text feed ("Notes"/"Blog"), then briefly "Media"
  // once gifs were added to the collage — back to "Photos" as the
  // simpler label; gifs still play fine in it either way.
  { src: tab3, label: 'Photos' },
]

// Each entry stores a real Date — formatRelativeTime() below turns it
// into "N days/weeks/months ago" at render time, so it stays accurate
// as time passes instead of going stale like a hardcoded string
// would. Newest first, matching how an activity feed normally reads.
//
// `slug` matches a filename dropped by hand into
// src/assets/journal/covers/ — add entries there and reference the
// slug here. Entries without a matching file fall back to the
// placeholder below.
//
// `creator` carries its own prefix (no separate book/movie `type`
// field) — "dir. " for movies, "by " for books.
const DIARY_ENTRIES = [
  {
    action: 'watched',
    title: 'Alien (1979)',
    creator: 'dir. Ridley Scott',
    date: new Date(2026, 8, 6),
    slug: 'alien-1979',
  },
  {
    action: 'started reading',
    title: 'Project Hail Mary',
    creator: 'by Andy Weir',
    date: new Date(2026, 7, 19),
    slug: 'project-hail-mary',
  },
  {
    action: 'watched',
    title: 'Spider-Man: Brand New Day (2026)',
    creator: 'dir. Destin Daniel Cretton',
    date: new Date(2026, 7, 10),
    slug: 'spider-man-brand-new-day',
  },
  {
    action: 'watched',
    title: 'The Drama (2026)',
    creator: 'dir. Kristoffer Borgli',
    date: new Date(2026, 7, 2),
    slug: 'the-drama-2026',
  },
  {
    action: 'watched',
    title: 'Backrooms (2026)',
    creator: 'dir. Kane Parsons',
    date: new Date(2026, 5, 15),
    slug: 'backrooms-2026',
  },
]

// Eagerly imports every fetched cover so Vite bundles/hashes them
// like any other local asset, keyed by slug (e.g. "project-hail-mary")
// regardless of its extension (TMDB gives .jpg, Open Library covers
// can vary).
const coverModules = import.meta.glob('./assets/journal/covers/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
})
const coversBySlug = Object.fromEntries(
  Object.entries(coverModules).map(([path, url]) => [path.match(/([^/]+)\.\w+$/)[1], url]),
)

// Photos tab: a plain Pinterest/Tumblr-style collage, no metadata
// needed per item (unlike Diary above) — every photo or gif dropped
// into src/assets/journal/media/ just shows up, sorted by filename
// (prefix with e.g. "01-", "02-" to control order, or a date). CSS
// multi-column layout (see .journal-photo-grid) does the actual
// masonry-style tiling from each item's own aspect ratio; a plain
// <img> autoplays a .gif/animated .webp same as any other browser
// would. Large source photos were downsized (sips -Z 1000) before
// dropping in here — full-res originals aren't worth shipping when
// the biggest a tile ever renders is one collage column's width.
const photoModules = import.meta.glob('./assets/journal/media/*.{jpg,jpeg,JPG,png,webp,gif}', {
  eager: true,
  import: 'default',
})
const photos = Object.entries(photoModules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, url]) => ({ key: path, url }))

// Stand-in tiles shown only when src/assets/journal/media/ is still
// empty, so the collage layout is visible before real media is
// dropped in — varied aspect ratios so the masonry effect actually
// reads, same purpose as the diary placeholder elsewhere.
const PLACEHOLDER_PHOTO_RATIOS = [3 / 4, 1, 4 / 3, 1, 4 / 5, 3 / 2, 1, 4 / 3]

// Real, live clock in Seoul (Asia/Seoul, KST/UTC+9) — unlike the visit
// counter this replaced, this needs no backend to be genuine, so it's
// the actual current time rather than fixed decorative text. 12-hour,
// no leading zero on the hour, lowercase am/pm with no space before
// it (e.g. "8:20pm") — formatToParts (rather than a plain formatted
// string) so the built-in " AM"/" PM" can be lowercased and rejoined
// without a space.
function getSeoulTime(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(now)
  const byType = Object.fromEntries(parts.map((p) => [p.type, p.value]))
  return `${byType.hour}:${byType.minute}${byType.dayPeriod.toLowerCase()}`
}

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
  const [seoulTime, setSeoulTime] = useState(() => getSeoulTime())

  // Ticks once a minute — the display only shows HH:MM, so anything
  // finer is wasted work.
  useEffect(() => {
    const id = setInterval(() => setSeoulTime(getSeoulTime()), 60_000)
    return () => clearInterval(id)
  }, [])

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

      {/* Left-page content, matching the layout mockup. A real live
          clock in Seoul, not a fixed visit counter — computable purely
          client-side, so no backend/storage needed to make it genuine. */}
      <div className="journal-counter">{seoulTime} in Seoul, KR</div>
      <div className="journal-title">helen's cyworld</div>
      <div className="journal-site">helenhsong.com</div>

      {/* Mood box sits above the photo now, per feedback (was below
          it, between divider-1 and .journal-status). */}
      <div className="journal-mood">On sabbatical 🌴</div>
      <img src={dp} alt="Helen" className="journal-photo-frame" draggable={false} />

      <div className="journal-divider journal-divider-1" aria-hidden="true" />
      <div className="journal-status">product designer usually based in NYC, currently in korea</div>
      <div className="journal-divider journal-divider-2" aria-hidden="true" />
      <div className="journal-name">Helen Song</div>
      <div className="journal-email">helenhsong@gmail.com</div>

      {/* Right-page content. On the Diary and Photos tabs this is a
          scrollable list/grid instead of the character box — all
          three share .journal-right-panel's position/size, so the
          right panel occupies the same footprint no matter which tab
          is active. The border (.journal-character-box) is specific
          to the empty Home box. The left panel above never changes
          with the active tab. */}
      {active === 1 && (
        <RetroScrollbar className="journal-right-panel">
          <div className="journal-diary-list">
            {DIARY_ENTRIES.map((entry) => (
              <div className="diary-entry" key={entry.title}>
                <div className="diary-entry-top">
                  <div className="diary-action">Helen {entry.action}</div>
                  <div className="diary-when">{formatRelativeTime(entry.date)}</div>
                </div>
                <div className="diary-card">
                  {coversBySlug[entry.slug] ? (
                    <img src={coversBySlug[entry.slug]} alt="" className="diary-cover" draggable={false} />
                  ) : (
                    <div className="diary-cover diary-cover-placeholder" aria-hidden="true" />
                  )}
                  <div className="diary-card-info">
                    <div className="diary-card-title">{entry.title}</div>
                    <div className="diary-card-creator">{entry.creator}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </RetroScrollbar>
      )}
      {active === 2 && (
        <RetroScrollbar className="journal-right-panel">
          <div className="journal-photo-grid">
            {photos.length > 0
              ? photos.map((photo) => (
                  <img key={photo.key} src={photo.url} alt="" className="photo-grid-item" draggable={false} />
                ))
              : PLACEHOLDER_PHOTO_RATIOS.map((ratio, i) => (
                  <div
                    key={i}
                    className="photo-grid-item photo-grid-placeholder"
                    style={{ aspectRatio: ratio }}
                    aria-hidden="true"
                  />
                ))}
          </div>
        </RetroScrollbar>
      )}
      {active === 0 && (
        <>
          {/* Label and hint are outside the box's border (not drawn as
              its own row inside it) but still stacked in normal flow
              with the box inside .journal-right-panel, so the label +
              box + hint together take up exactly the panel's own
              footprint — same as the Diary/Photos panels, which don't
              spill above or below it either. The box (sized to hold a
              future interactive character; filled with a placeholder
              room scene for now, src/assets/journal/room.png) shrinks
              to make room for both. */}
          <div className="journal-right-panel journal-home-panel">
            <div className="journal-room-label">Mini room</div>
            <div className="journal-character-box" style={{ backgroundImage: `url(${room})` }} aria-hidden="true" />
            <div className="journal-character-hint">↑ ↓ ← → move the character</div>
          </div>
        </>
      )}
    </div>
  )
}

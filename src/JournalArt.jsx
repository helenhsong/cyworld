// Hand-drawn as SVG (traced from the original Aseprite exports as visual
// reference) instead of using those PNGs directly, so the journal renders
// crisp at any size and the "which tab is selected" state is just a fill
// color swap instead of three separate raster images.
const COVER_FILL = '#faebf3'
const BORDER = '#cb9ebf'
const PAGE_FILL = '#fff'
const RING_FILL = '#ededed'
const TAB_FILL_ACTIVE = '#fff'
const TAB_FILL_INACTIVE = '#8d78bf'
const TAB_STROKE = '#685596'

const RING_CENTERS_Y = [207, 236, 432, 461]

const TABS = [
  { label: 'Tab 1', y: 160 },
  { label: 'Tab 2', y: 189 },
  { label: 'Tab 3', y: 218 },
]
const TAB_X = 706
const TAB_WIDTH = 18
const TAB_HEIGHT = 26
const TAB_RADIUS = 6

// Rounded rect with only the right corners rounded — the tabs sit flush
// against the cover's straight right edge.
function tabPath(x, y) {
  const r = TAB_RADIUS
  const w = TAB_WIDTH
  const h = TAB_HEIGHT
  return `M${x},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} L${x + w},${y + h - r} Q${x + w},${y + h} ${x + w - r},${y + h} L${x},${y + h} Z`
}

export function JournalArt({ active, onSelectTab }) {
  return (
    <svg viewBox="34 93 694 458" className="journal-art" role="group" aria-label="Journal">
      {/* Cover */}
      <rect x="38" y="97" width="669" height="449" rx="8" fill={COVER_FILL} stroke={BORDER} strokeWidth="2" />
      <line x1="52" y1="113" x2="693" y2="113" stroke="#fff" strokeWidth="3" strokeDasharray="10 10" strokeLinecap="round" />
      <line x1="52" y1="530" x2="693" y2="530" stroke="#fff" strokeWidth="3" strokeDasharray="10 10" strokeLinecap="round" />

      {/* Frame — the blank white mat behind both pages */}
      <rect x="60" y="117" width="625" height="409" rx="5" fill={PAGE_FILL} stroke={BORDER} strokeWidth="1.5" />

      {/* Pages */}
      <rect x="65" y="153" width="171" height="364" rx="4" fill={PAGE_FILL} stroke={BORDER} strokeWidth="1.5" />
      <rect x="241" y="153" width="435" height="364" rx="4" fill={PAGE_FILL} stroke={BORDER} strokeWidth="1.5" />

      {/* Spiral binding rings */}
      {RING_CENTERS_Y.map((cy) => (
        <ellipse key={cy} cx="238.5" cy={cy} rx="9" ry="4.5" fill={RING_FILL} stroke={BORDER} strokeWidth="1" />
      ))}

      {/* Tabs */}
      {TABS.map((tab, i) => (
        <path
          key={tab.label}
          d={tabPath(TAB_X, tab.y)}
          fill={active === i ? TAB_FILL_ACTIVE : TAB_FILL_INACTIVE}
          stroke={TAB_STROKE}
          strokeWidth="1.5"
          strokeLinejoin="round"
          role="button"
          tabIndex={0}
          aria-pressed={active === i}
          aria-label={`Show ${tab.label}`}
          className="journal-tab"
          onClick={() => onSelectTab(i)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onSelectTab(i)
            }
          }}
        />
      ))}
    </svg>
  )
}

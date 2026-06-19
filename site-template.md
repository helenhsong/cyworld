# Site template: Header + README page system

Recreate this site's navigation header and `/readme` content page in a new
React + Vite project, using the same component structure, layout system, and
interaction patterns described below. **Colors, fonts, the home page's own
content, and the background treatment are project-specific — swap those out
freely.** The Header component's behavior, the README page's layout/spacing
rules, and the transition system should stay the same across projects.

## Stack

- React + Vite (`npm create vite@latest -- --template react`)
- `react-router-dom` for routing (`BrowserRouter` with a `basename` matching
  your deploy subpath, e.g. `/<repo-name>` for a GitHub Pages project site)
- No CSS framework — plain CSS files per component, camelCase class names

## File structure

```
src/
  App.jsx
  App.css
  main.jsx
  index.css
  assets/
    components/
      Header.jsx
      Background.jsx        (project-specific — see below)
      Readme.jsx
      Readme.css
      Title.jsx
    utils/
      contrastColor.js
      useHeaderSpace.js
      parseReadme.js
      useDocumentTitle.js
README.md                    (drives the /readme page's title + copy)
```

## 1. Design tokens (`src/index.css`)

```css
:root {
  --font-family: '<your font>';
  --font-size: 12px;
  --font-weight: 350;
  --font-weight-bold: 450;
  --line-height: 1.6;
}

* {
  font-family: var(--font-family), Arial, Helvetica, sans-serif;
  font-size: var(--font-size);
  font-weight: var(--font-weight);
}
```

Swap the font family/size per project. Keep `--line-height` — it's reused by
the README page's paragraph spacing formula (section 5).

## 2. A single background color value, exported from one place

Whatever your background treatment is for this project (a flat color, a
gradient, an animated shader, an image — anything), expose its dominant/base
color as a single exported constant from one component, e.g.:

```jsx
// src/assets/components/Background.jsx
export const backgroundColor = '#RRGGBB' // your project's background color

function Background() {
  // render whatever background treatment this project uses
}

export default Background
```

This is the single source of truth every text-color computation below reads
from. Changing this one value should re-derive every text color in the app.

## 3. Dynamic contrast-color utility (`src/assets/utils/contrastColor.js`)

Don't hardcode text colors. Derive them from `backgroundColor` so the whole
palette can change by editing one value.

```js
function hexToHsl(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const l = (max + min) / 2
    const d = max - min

    let h = 0
    let s = 0
    if (d !== 0) {
        s = d / (1 - Math.abs(2 * l - 1))
        switch (max) {
            case r: h = ((g - b) / d) % 6; break
            case g: h = (b - r) / d + 2; break
            case b: h = (r - g) / d + 4; break
        }
        h *= 60
        if (h < 0) h += 360
    }

    return { h, s, l }
}

function hslToRgb(h, s, l) {
    const c = (1 - Math.abs(2 * l - 1)) * s
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
    const m = l - c / 2

    let r = 0, g = 0, b = 0
    if (h < 60) [r, g, b] = [c, x, 0]
    else if (h < 120) [r, g, b] = [x, c, 0]
    else if (h < 180) [r, g, b] = [0, c, x]
    else if (h < 240) [r, g, b] = [0, x, c]
    else if (h < 300) [r, g, b] = [x, 0, c]
    else [r, g, b] = [c, 0, x]

    return [r + m, g + m, b + m]
}

function relativeLuminance(r, g, b) {
    const channel = (v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4))
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

function contrastRatio(l1, l2) {
    const lighter = Math.max(l1, l2)
    const darker = Math.min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)
}

function hslToCss(h, s, l) {
    return `hsl(${h}, ${s * 100}%, ${l * 100}%)`
}

// Pick ratios that are actually reachable against YOUR background — compute
// the max achievable ratio first (contrast of pure black or white vs. your
// background) and stay under it, or the search below will clip to the
// lightness floor/ceiling and read as plain black/white regardless of hue.
export const TITLE_CONTRAST_RATIO = 10
export const DESCRIPTION_CONTRAST_RATIO = 7.5

// Lightness floor/ceiling so the result keeps visibly perceptible hue
// instead of reading as plain black/white when a target ratio is unreachable.
const MIN_LIGHTNESS = 0.18
const MAX_LIGHTNESS = 0.85

// Returns the smallest lightness shift (same hue/saturation as the
// background) needed to reach the target WCAG contrast ratio, so the
// result stays in the background's color scheme without going near-black/white.
export function getContrastColor(backgroundHex, targetRatio = 7) {
    const { h, s, l } = hexToHsl(backgroundHex)
    const bgLuminance = relativeLuminance(...hslToRgb(h, s, l))
    const goDarker = l > 0.5

    const step = goDarker ? -0.02 : 0.02
    let candidate = Math.min(MAX_LIGHTNESS, Math.max(MIN_LIGHTNESS, l))
    while (candidate >= MIN_LIGHTNESS && candidate <= MAX_LIGHTNESS) {
        const candidateLuminance = relativeLuminance(...hslToRgb(h, s, candidate))
        if (contrastRatio(bgLuminance, candidateLuminance) >= targetRatio) break
        candidate += step
    }
    candidate = Math.min(MAX_LIGHTNESS, Math.max(MIN_LIGHTNESS, candidate))

    return hslToCss(h, s, candidate)
}
```

**Per-project tuning step:** after wiring this up, compute the actual max
contrast ratio achievable against your `backgroundColor` (ratio of pure black
or white vs. your background). If `TITLE_CONTRAST_RATIO` exceeds it, lower it
to something reachable (e.g. ~60% of the max), otherwise the title will clip
to `MIN_LIGHTNESS`/`MAX_LIGHTNESS` and look like plain black/white instead of
a tinted, in-scheme dark/light color.

## 4. Header component

Structure: a flex row, `justify-content: space-between`, with a home link on
the left and a README toggle on the right.

```jsx
// src/assets/components/Header.jsx
import { forwardRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { backgroundColor } from './Background'
import { getContrastColor } from '../utils/contrastColor'

const Header = forwardRef(function Header({ onCloseReadme }, ref) {
    const isReadme = useLocation().pathname === '/readme'
    const textColor = getContrastColor(backgroundColor)

    const handleReadmeLinkClick = (event) => {
        if (!isReadme) return
        event.preventDefault()
        onCloseReadme()
    }

    return (
        <header ref={ref} className="projectHeader" style={{ color: textColor }}>
            <p className="homeLink"><a href="<your home url>">/* your home label */</a></p>
            <p className="readMeLink">
                <Link
                    to={isReadme ? '/' : '/readme'}
                    onClick={handleReadmeLinkClick}
                    style={isReadme ? { opacity: 1 } : undefined}
                >
                    {isReadme ? '[close]' : 'README'}
                </Link>
            </p>
        </header>
    )
})

export default Header
```

```css
/* App.css */
body {
  padding: 0px 14px 2px;
}

.projectHeader {
  display: flex;
  justify-content: space-between;
}

.homeLink > a, .readMeLink > a {
  text-decoration: none;
  color: inherit;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.homeLink > a:hover, .readMeLink > a:hover {
  opacity: 1;
}
```

Rules to keep:
- Header links are faint (`opacity: 0.7`) by default, full opacity on hover.
- The active/toggle state (`[close]`) always gets an inline `opacity: 1`
  override, ignoring the faint default regardless of hover.
- Header text color is always `getContrastColor(backgroundColor)` — never a
  literal hex.

## 5. README page

The page is driven by `README.md` itself (title = first heading/line,
paragraphs = blank-line-separated blocks) so content lives in one place and
the component stays generic.

```js
// src/assets/utils/parseReadme.js
export function parseReadme(raw) {
    const lines = raw.split('\n').map((line) => line.trim())
    const titleIndex = lines.findIndex((line) => line.length > 0)
    const title = (lines[titleIndex] ?? '').replace(/^#+\s*/, '')

    const paragraphs = lines
        .slice(titleIndex + 1)
        .join('\n')
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
        .filter(Boolean)

    return { title, paragraphs }
}
```

```js
// src/assets/utils/useDocumentTitle.js
import { useEffect } from 'react'

export function useDocumentTitle(title) {
    useEffect(() => {
        if (!title) return
        document.title = title
    }, [title])
}
```

```jsx
// src/assets/components/Title.jsx
function Title({ title, color }) {
    return <h1 style={{ color }}>{title}</h1>
}

export default Title
```

```jsx
// src/assets/components/Readme.jsx
import './Readme.css'
import readmeRaw from '../../../README.md?raw'
import { backgroundColor } from './Background'
import { getContrastColor, TITLE_CONTRAST_RATIO, DESCRIPTION_CONTRAST_RATIO } from '../utils/contrastColor'
import { parseReadme } from '../utils/parseReadme'
import { useDocumentTitle } from '../utils/useDocumentTitle'
import Title from './Title'

function Readme({ isClosing }) {
  const { title, paragraphs } = parseReadme(readmeRaw)
  useDocumentTitle(title)

  const titleColor = getContrastColor(backgroundColor, TITLE_CONTRAST_RATIO)
  const descriptionColor = getContrastColor(backgroundColor, DESCRIPTION_CONTRAST_RATIO)

  return (
    <main className={`readme${isClosing ? ' closing' : ''}`} style={{ color: descriptionColor }}>
      <div className="readmeContent">
        <Title title={title} color={titleColor} />
        <div className="readmeParagraphs">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    </main>
  )
}

export default Readme
```

### Layout shell + spacing rules (`Readme.css`)

```css
.readme {
    --vertical-padding: clamp(24px, calc((100vw - 540px) / 2), 72px);
    --readme-font-size: 14px; /* can differ from the global --font-size */

    max-width: 540px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 72px;
    padding: max(0px, calc(var(--vertical-padding) - var(--header-space, 0px))) 0 var(--vertical-padding);
    animation: readme-enter 0.4s ease both;
}

.readme, .readme * {
    font-size: var(--readme-font-size);
    line-height: var(--line-height);
}

/* Title gets its own margin, separate from paragraph gap, so the title
   doesn't inherit the same rhythm as paragraph-to-paragraph spacing. */
.readme h1 {
    margin: 0 0 20px;
    font-weight: var(--font-weight);
}

.readmeContent {
    display: flex;
    flex-direction: column;
}

/* Paragraphs get their own gap-bearing wrapper, separate from the title,
   so this gap never adds space before the first paragraph. */
.readmeParagraphs {
    display: flex;
    flex-direction: column;
    gap: calc(var(--readme-font-size) * var(--line-height));
}

.readme p {
    margin: 0;
    opacity: 0.8;
}

.readme a {
    text-decoration: none;
    padding-bottom: 1px;
    border-bottom: 1px solid color-mix(in srgb, currentColor 35%, transparent);
}

.readme a:hover {
    border-bottom-color: currentColor;
}

.readme a:focus {
    background-color: color-mix(in srgb, currentColor 15%, transparent);
    outline: none;
}

@keyframes readme-enter {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes readme-exit {
    to { opacity: 0; }
}

.readme.closing {
    animation: readme-exit 0.3s ease both;
}
```

Spacing rules to keep:
- Spacing is gap-driven, not margin-driven — `margin: 0` on paragraphs, the
  gap formula `calc(var(--readme-font-size) * var(--line-height))` is the
  single source of paragraph-to-paragraph spacing.
- That gap lives on a **separate** flex wrapper around just the paragraphs,
  not the outer content container — otherwise it would also apply between
  the title and the first paragraph.
- Paragraph text gets `opacity: 0.8` on top of its computed color, for a
  slightly muted body-text feel relative to the title.
- The outer `.readme` top padding subtracts `var(--header-space)` (see
  below) so total top spacing equals the clamp value regardless of how big
  the header actually renders.

### Accounting for the header's height (`useHeaderSpace.js`)

If there's a header above this page, don't let the page's own top padding
stack on top of it — measure the header's real rendered size and subtract it.

```js
// src/assets/utils/useHeaderSpace.js
import { useEffect } from 'react'

export function useHeaderSpace(headerRef) {
    useEffect(() => {
        const headerEl = headerRef.current
        if (!headerEl) return

        const updateHeaderSpace = () => {
            const headerSpace = headerEl.getBoundingClientRect().bottom
            document.documentElement.style.setProperty('--header-space', `${headerSpace}px`)
        }

        updateHeaderSpace()

        const resizeObserver = new ResizeObserver(updateHeaderSpace)
        resizeObserver.observe(headerEl)
        window.addEventListener('resize', updateHeaderSpace)

        return () => {
            resizeObserver.disconnect()
            window.removeEventListener('resize', updateHeaderSpace)
        }
    }, [headerRef])
}
```

## 6. Wiring it together (`App.jsx`)

```jsx
import { useRef, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import './App.css'
import Header from './assets/components/Header'
import Readme from './assets/components/Readme'
import Background from './assets/components/Background'
import { useHeaderSpace } from './assets/utils/useHeaderSpace'

// Matches the fade-out duration in Readme.css, so the route only
// changes once the closing animation has actually finished.
const README_CLOSE_DURATION_MS = 300

function App() {
  const headerRef = useRef(null)
  useHeaderSpace(headerRef)
  const navigate = useNavigate()
  const [isClosingReadme, setIsClosingReadme] = useState(false)

  const closeReadme = () => {
    setIsClosingReadme(true)
    setTimeout(() => {
      navigate('/')
      setIsClosingReadme(false)
    }, README_CLOSE_DURATION_MS)
  }

  return (
    <>
      <Background />
      <Header ref={headerRef} onCloseReadme={closeReadme} />
      <Routes>
        <Route path="/" element={/* your project's home page content */} />
        <Route path="/readme" element={<Readme isClosing={isClosingReadme} />} />
      </Routes>
    </>
  )
}

export default App
```

```jsx
// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename="/<your-deploy-subpath>">
      <App />
    </BrowserRouter>
  </StrictMode>,
)
```

## What to change per project

- `backgroundColor` in `Background.jsx`, and whatever visual treatment
  produces it (flat color, gradient, shader, etc.)
- `--font-family` / `--font-size` in `index.css`, and the README page's
  `--readme-font-size` if it should differ from the rest of the site
- `TITLE_CONTRAST_RATIO` / `DESCRIPTION_CONTRAST_RATIO`, tuned to what's
  actually reachable against the new `backgroundColor`
- The home link's URL/label in `Header.jsx`
- The home route's content in `App.jsx`
- `README.md`'s content (title + paragraphs) — drives the `/readme` page
- The `basename` in `main.jsx` (must match the deploy subpath)

## What to keep exactly

- The Header's structure, faint/hover-opacity link treatment, and the
  always-full-opacity active state
- The dynamic contrast-color derivation (never hardcode text colors)
- The README page's layout shell, gap-driven spacing rules, link underline
  treatment, and open/close animation timing and easing

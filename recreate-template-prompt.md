Recreate this site's visual style and component structure in this repo, using React + Vite.

## Design tokens (in src/index.css under :root)
```css
--font-family: 'Geist Sans';   /* variable font, woff2, font-display: swap, weight range 100–900 */
--font-size: 14px;
--font-weight: 350;
--font-weight-bold: 450;
--line-height: 1.7;
--background: #FFFFFF;
--gray1: #111111;   /* primary text (headings, active labels) */
--gray2: #555555;   /* body/secondary text, default link/icon color */
--gray3: #999999;   /* tertiary text, e.g. dates */
--disabled: #c9c9c9;    /* disabled icon fill */
--not-active: #999999;  /* dimmed text when a sibling is hovered */
--line: #dbdbdb;    /* default underline / border color */
--focus-state: #dae8e4; /* link focus background */
```
A global `*` selector applies font-family/size/weight/background/color (gray2) by default, so only deviations need their own rules.

## Layout shell
- Single root wrapper, e.g. `.profile`: `max-width: 540px`, centered (`margin: 0 auto`), `display: flex; flex-direction: column; gap: 72px`, vertical padding `clamp(24px, calc((100vw - 540px) / 2), 72px)`.
- `body`: `margin: 0; padding: 0 24px` (horizontal gutter on small screens).
- Sections within the shell are stacked with consistent flex-column + gap patterns rather than margins (e.g. a 4px-gap header block, a list with 32px gap between items, items internally with ~6px gap).

## Header (new for this repo — not present in the source site)
The source site only has a minimal intro block (name + role as `<header className="profileHeader">`). This repo additionally needs a real navigation header. Build it as its own component/section above `.profile` (or as the first child inside it, your call), following the same token system:
- Use `--gray1` for primary nav text/logo, `--gray2` for secondary/inactive nav items.
- Reuse the same underline-on-hover link treatment described below for nav links, OR keep nav links unstyled/no-underline if it should look more like a nav bar than inline prose links — decide based on how many nav items there are.
- Match spacing rhythm: pick a gap consistent with the rest of the page (e.g. 24–32px between nav items), and add this header into the parent's gap-based stacking rather than custom margins.

## Link styling (applies to all `<a>` tags)
```css
a {
    text-decoration: none;
    padding-bottom: 1px;
    border-bottom: 1px solid var(--line);
}
a:hover {
    border-bottom: 1px solid var(--gray2);
}
a:focus {
    background-color: var(--focus-state);
    outline: none;
}
```
Links are never colored differently from body text — they're distinguished only by the underline, which darkens on hover.

## Small inline icon pattern
SVG icons are extracted into their own `.jsx` components (not imported as static files) so their fill can be controlled via a prop, e.g.:
```jsx
const Arrow = ({ fill = "var(--gray2)" }) => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="..." fill={fill}/>
  </svg>
)
export default Arrow
```
Icons placed inline next to text (e.g. an arrow after an external link, a lock next to a disabled item) get a small left margin (~2px) and `white-space: nowrap` on their wrapping span so they don't wrap onto a new line away from the text.

## List-of-items pattern (e.g. project list)
- Data lives in a plain JS module exporting an array of objects (e.g. `projectData.js`), each with at least `name`, `date`/meta, `url`, `description`.
- A presentational component (e.g. `Project.jsx`) receives one item via props and renders it; the parent maps over the data array to produce the list.
- Items with no real destination (`url` is falsy or `"#"`) render as a disabled `<span>` instead of an `<a>`, with a small lock/icon next to the label to signal disabled state, e.g.:
```jsx
const isDisabled = !url || url === "#"
{isDisabled
    ? <span className="disabled">{name}<Lock fill="var(--disabled)" /></span>
    : <a href={url}>{name}</a>}
```
- `.disabled` keeps the same underline treatment as a real link (`border-bottom: 1px solid var(--line)`) but adds `cursor: not-allowed` and never gets a hover state (since it's not an `<a>`).
- Hovering an *active* item's link dims all sibling items' text (label, description, meta) to `var(--not-active)`, using a pure-CSS `:has()` selector so no JS state is needed:
```css
.list:has(.itemName a:hover) .item:not(:has(.itemName a:hover)),
.list:has(.itemName a:hover) .item:not(:has(.itemName a:hover)) * {
    color: var(--not-active);
}
```
Pair this with `transition: color 0.25s ease-in-out` on the item and its descendants for a smooth fade instead of an instant color snap.

## General conventions to carry over
- No CSS framework — plain CSS files per component/page, class names are camelCase, scoped by being component-specific (no CSS modules, just naming discipline).
- Spacing is done via flexbox `gap`, not margins, wherever elements are siblings in a flex container. Margins are reset to 0 on block elements (`h1`, `p`) inside flex containers so `gap` is the single source of spacing truth.
- Keep the overall tone minimal/editorial: generous line-height (1.7), muted grays, no shadows/borders/rounded corners beyond the thin underline treatment.

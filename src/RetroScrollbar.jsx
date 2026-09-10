import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import './Journal.css'

// Real (Windows 9x/2000-style) scrollbar, hand-built rather than
// styled via ::-webkit-scrollbar-* — modern browsers switched their
// native scrollbars to an OS-drawn "overlay" style (a thin, rounded,
// auto-hiding bar) that only reads the plain scrollbar-color/-width
// properties and ignores the old bevel/arrow-button pseudo-elements
// entirely; confirmed by testing against real Chrome, not just this
// dev environment. A pixel-accurate retro scrollbar isn't reachable
// through CSS on today's browsers, so this replaces the native one:
// hides it (still scrollable by wheel/touch/keyboard on the inner
// content div) and draws its own track/thumb/arrow-buttons instead.
const ARROW_STEP = 40 // px scrolled per arrow click
const REPEAT_DELAY = 400 // ms held before auto-repeat kicks in
const REPEAT_INTERVAL = 60 // ms between repeats while held

export function RetroScrollbar({ children, className = '' }) {
  const contentRef = useRef(null)
  const trackRef = useRef(null)
  const observerRef = useRef(null)
  const repeatTimer = useRef(null)
  const [metrics, setMetrics] = useState({ visible: false, thumbSize: 0, thumbOffset: 0 })

  const recompute = useCallback(() => {
    const content = contentRef.current
    if (!content) return
    const { scrollTop, scrollHeight, clientHeight } = content
    const overflowing = scrollHeight > clientHeight + 1
    const track = trackRef.current
    // The track only exists in the DOM once metrics.visible is true —
    // so on the very first overflow detection there's no track yet to
    // measure. Flip visible on regardless (thumbSize 0 for now); the
    // callback ref below re-runs this the moment the track mounts,
    // which then measures it for real.
    if (!overflowing || !track) {
      setMetrics({ visible: overflowing, thumbSize: 0, thumbOffset: 0 })
      return
    }
    const trackHeight = track.clientHeight
    const thumbSize = Math.max(20, (clientHeight / scrollHeight) * trackHeight)
    const maxScroll = scrollHeight - clientHeight
    const maxThumbOffset = trackHeight - thumbSize
    const thumbOffset = maxScroll > 0 ? (scrollTop / maxScroll) * maxThumbOffset : 0
    setMetrics({ visible: true, thumbSize, thumbOffset })
  }, [])

  // Runs the moment the track div actually mounts (right after
  // metrics.visible flips true and it first renders), and keeps its
  // own ResizeObserver registration in sync as it mounts/unmounts.
  const setTrackRef = useCallback(
    (node) => {
      trackRef.current = node
      if (node && observerRef.current) observerRef.current.observe(node)
      recompute()
    },
    [recompute],
  )

  // Measure before the browser paints. Using a normal effect here let
  // the tab render for one frame without its scrollbar, then add it on
  // the next frame, which made the rail visibly flash on tab changes.
  useLayoutEffect(() => {
    const content = contentRef.current
    if (!content) return
    const observer = new ResizeObserver(recompute)
    observerRef.current = observer
    observer.observe(content)
    if (trackRef.current) observer.observe(trackRef.current)
    content.addEventListener('scroll', recompute)
    window.addEventListener('resize', recompute)
    // Images (e.g. the photo grid) report zero height until they
    // finish loading, so the very first recompute() below can run
    // before scrollHeight reflects the real content — and nothing
    // else would re-trigger it, since a child growing to its loaded
    // size doesn't resize `content` itself (its own box is fixed by
    // the flex layout), so the ResizeObserver above stays quiet. A
    // capturing listener catches each <img>'s non-bubbling 'load'
    // event on the way down instead.
    content.addEventListener('load', recompute, true)
    recompute()
    return () => {
      content.removeEventListener('scroll', recompute)
      window.removeEventListener('resize', recompute)
      content.removeEventListener('load', recompute, true)
      observer.disconnect()
      observerRef.current = null
    }
    // Re-measure whenever the wrapped content changes (e.g. more
    // entries added) in case that alone doesn't fire a resize.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recompute, children])

  // Lets any scroll gesture anywhere on the page move this content,
  // not just one aimed directly at it — there's nothing else
  // scrollable on the page, so a wheel/trackpad scroll can only ever
  // mean "scroll the diary list" regardless of where the cursor
  // happens to be. Skipped if the cursor actually is over the content
  // (or its own scrollbar) so its native wheel handling — already
  // correct — isn't double-applied on top of this.
  useEffect(() => {
    const content = contentRef.current
    if (!content) return
    const onWheel = (e) => {
      // ProjectHeader's README becomes the page's active scroll surface
      // while open; do not redirect those gestures to the hidden tab.
      if (document.documentElement.hasAttribute('data-ph-open')) return
      if (content.scrollHeight <= content.clientHeight + 1) return
      if (content.contains(e.target)) return
      e.preventDefault()
      content.scrollBy({ top: e.deltaY })
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [])

  const scrollBy = (delta) => {
    contentRef.current?.scrollBy({ top: delta })
  }

  const startRepeating = (delta) => {
    scrollBy(delta)
    clearTimeout(repeatTimer.current)
    repeatTimer.current = setTimeout(function repeat() {
      scrollBy(delta)
      repeatTimer.current = setTimeout(repeat, REPEAT_INTERVAL)
    }, REPEAT_DELAY)
  }
  const stopRepeating = () => clearTimeout(repeatTimer.current)

  // Clicking the bare track (not the thumb) pages up/down, like a
  // real scrollbar — only fires when the click target is the track
  // itself, since the thumb sits on top of it and has its own handler.
  const onTrackMouseDown = (e) => {
    if (e.target !== trackRef.current) return
    const content = contentRef.current
    const trackRect = trackRef.current.getBoundingClientRect()
    const clickY = e.clientY - trackRect.top
    scrollBy(clickY < metrics.thumbOffset ? -content.clientHeight * 0.9 : content.clientHeight * 0.9)
  }

  const onThumbMouseDown = (e) => {
    e.preventDefault()
    const content = contentRef.current
    const track = trackRef.current
    const startY = e.clientY
    const startScrollTop = content.scrollTop
    const maxScroll = content.scrollHeight - content.clientHeight
    const maxThumbOffset = track.clientHeight - metrics.thumbSize
    const onMove = (moveEvent) => {
      const deltaThumb = moveEvent.clientY - startY
      const deltaScroll = maxThumbOffset > 0 ? (deltaThumb / maxThumbOffset) * maxScroll : 0
      content.scrollTop = Math.max(0, Math.min(maxScroll, startScrollTop + deltaScroll))
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div className={`retro-scroll-wrap ${className}`}>
      <div className="retro-scroll-content" ref={contentRef}>
        {children}
      </div>
      {metrics.visible && (
        <div className="retro-scrollbar">
          <button
            type="button"
            className="retro-scrollbar-btn retro-scrollbar-btn-up"
            aria-label="Scroll up"
            onMouseDown={() => startRepeating(-ARROW_STEP)}
            onMouseUp={stopRepeating}
            onMouseLeave={stopRepeating}
          />
          <div className="retro-scrollbar-track" ref={setTrackRef} onMouseDown={onTrackMouseDown}>
            <div
              className="retro-scrollbar-thumb"
              style={{ height: metrics.thumbSize, transform: `translateY(${metrics.thumbOffset}px)` }}
              onMouseDown={onThumbMouseDown}
            />
          </div>
          <button
            type="button"
            className="retro-scrollbar-btn retro-scrollbar-btn-down"
            aria-label="Scroll down"
            onMouseDown={() => startRepeating(ARROW_STEP)}
            onMouseUp={stopRepeating}
            onMouseLeave={stopRepeating}
          />
        </div>
      )}
    </div>
  )
}

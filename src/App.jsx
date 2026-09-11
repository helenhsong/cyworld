import { useEffect, useRef, useState } from 'react'
import { ProjectHeader } from '@helenhsong/ui'
import { Dithering } from '@paper-design/shaders-react'
import readme from '../README.md?raw'
import { Journal } from './Journal'

function App() {
  const [readmeOpen, setReadmeOpen] = useState(false)
  const [readmeClosing, setReadmeClosing] = useState(false)
  const readmeCloseTimer = useRef(null)

  const handleReadmeOpenChange = (nextOpen) => {
    window.clearTimeout(readmeCloseTimer.current)

    if (nextOpen) {
      document.documentElement.removeAttribute('data-ph-closing')
      setReadmeClosing(false)
      setReadmeOpen(true)
      return
    }

    // Keep ProjectHeader's panel mounted while both it and the veil
    // lift/fade away, then reveal the already-present journal below.
    document.documentElement.setAttribute('data-ph-closing', '')
    setReadmeClosing(true)
    readmeCloseTimer.current = window.setTimeout(() => {
      setReadmeOpen(false)
      setReadmeClosing(false)
      window.requestAnimationFrame(() => document.documentElement.removeAttribute('data-ph-closing'))
    }, 160)
  }

  useEffect(
    () => () => {
      window.clearTimeout(readmeCloseTimer.current)
      document.documentElement.removeAttribute('data-ph-closing')
    },
    [],
  )

  return (
    <>
      {/* Full-viewport animated backdrop — --project-bg (set in
          index.css) tells ProjectHeader's transparent header and README
          panel what they're sitting on, so their text darkens to a
          matching purple instead of the site's usual gray. The README's
          controlled transition and covering veil are defined below. */}
      <Dithering
        className="backdrop"
        style={{ position: 'fixed', inset: 0, zIndex: -1, background: '#E8E0F2' }}
        speed={0.07}
        shape="warp"
        type="4x4"
        size={2.5}
        scale={1.38}
        colorBack="#00000000"
        colorFront="#D2CAE8"
      />
      <ProjectHeader
        readme={readme}
        open={readmeOpen}
        onOpenChange={handleReadmeOpenChange}
        className="bg-transparent"
      />
      {readmeOpen && (
        <div
          className={`readme-transition-veil${readmeClosing ? ' is-closing' : ''}`}
          aria-hidden="true"
        />
      )}
      <main className="page">
        <Journal />
      </main>
    </>
  )
}

export default App

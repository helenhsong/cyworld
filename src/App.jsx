import { useEffect, useState } from 'react'
import { ProjectHeader } from '@helenhsong/ui'
import { Dithering } from '@paper-design/shaders-react'
import readme from '../README.md?raw'
import { Journal } from './Journal'

function App() {
  const [readmeOpen, setReadmeOpen] = useState(false)
  const [readmeScrolled, setReadmeScrolled] = useState(false)

  useEffect(() => {
    if (!readmeOpen) {
      setReadmeScrolled(false)
      return undefined
    }

    const panel = document.querySelector('.ph-readme')
    if (!panel) return undefined

    const updateFade = () => setReadmeScrolled(panel.scrollTop > 1)
    updateFade()
    panel.addEventListener('scroll', updateFade, { passive: true })
    return () => panel.removeEventListener('scroll', updateFade)
  }, [readmeOpen])

  return (
    <>
      {/* Full-viewport animated backdrop — --project-bg (set in
          index.css) tells ProjectHeader's transparent header and README
          panel what they're sitting on, so their text darkens to a
          matching purple instead of the site's usual gray. Blurs
          heavily (see index.css) while the README is open, keyed off
          the data-ph-open attribute ProjectHeader sets on <html>. */}
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
        onOpenChange={setReadmeOpen}
        className="bg-transparent"
      />
      {readmeOpen && (
        <div
          className={`readme-scroll-fade${readmeScrolled ? ' is-visible' : ''}`}
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

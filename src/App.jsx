import { ProjectHeader } from '@helenhsong/ui'
import { Dithering } from '@paper-design/shaders-react'
import readme from '../README.md?raw'

function App() {
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
      <ProjectHeader readme={readme} className="bg-transparent" />
    </>
  )
}

export default App

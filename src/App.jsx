import { ProjectHeader } from '@helenhsong/ui'
import { Dithering } from '@paper-design/shaders-react'
import readme from '../README.md?raw'

function App() {
  return (
    <>
      {/* Full-viewport animated backdrop — --project-header-bg (set in
          index.css) tells ProjectHeader's transparent header what it's
          sitting on, so its label text darkens to a matching purple
          instead of the site's usual gray. */}
      <Dithering
        style={{ position: 'fixed', inset: 0, background: '#E8E0F2' }}
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

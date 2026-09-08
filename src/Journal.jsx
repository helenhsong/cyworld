import { useState } from 'react'
import { JournalArt } from './JournalArt'
import './Journal.css'

export function Journal() {
  const [active, setActive] = useState(0)

  return (
    <div className="journal">
      <JournalArt active={active} onSelectTab={setActive} />
    </div>
  )
}

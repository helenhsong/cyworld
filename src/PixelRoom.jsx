import roomDay from './assets/journal/room-day.png'
import girl from './assets/journal/girl-sprite.png'
import girlBlink from './assets/journal/girl-sprite-blink.png'
import steam1 from './assets/journal/steam-1.png'
import steam2 from './assets/journal/steam-2.png'
import steam3 from './assets/journal/steam-3.png'
import { CherryBlossomPetals } from './CherryBlossomPetals'
import './PixelRoom.css'

const STEAM_FRAMES = [steam1, steam2, steam3]

export function PixelRoom() {
  return (
    <div
      className="pixel-room-embed"
      role="img"
      aria-label="Dreamy daytime pixel-art bedroom with a girl, floating cherry blossom petals, and a low table with steaming tea"
    >
      <img src={roomDay} alt="" className="pixel-room-art" draggable={false} />

      <CherryBlossomPetals />

      <div className="pixel-tea-steam" aria-hidden="true">
        {STEAM_FRAMES.map((frame, index) => (
          <img
            key={frame}
            src={frame}
            alt=""
            className={`pixel-steam-frame pixel-steam-frame-${index + 1}`}
            draggable={false}
          />
        ))}
      </div>

      <div className="pixel-avatar" aria-hidden="true">
        <div className="pixel-avatar-stack">
          <img src={girl} alt="" className="pixel-avatar-image" draggable={false} />
          <img src={girlBlink} alt="" className="pixel-avatar-image pixel-avatar-blink" draggable={false} />
        </div>
      </div>
    </div>
  )
}

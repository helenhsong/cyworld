import { girl, girlBlink, roomDay, STEAM_FRAMES } from './PixelRoomAssets'
import { CherryBlossomPetals } from './CherryBlossomPetals'
import './PixelRoom.css'

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

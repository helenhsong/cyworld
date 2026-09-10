import roomDay from './assets/journal/room-day.png'
import roomNight from './assets/journal/room-night.png'
import girl from './assets/journal/girl-sprite.png'
import girlBlink from './assets/journal/girl-sprite-blink.png'
import './PixelRoom.css'

function nightAmount(hour) {
  if (hour >= 8 && hour <= 17) return 0
  if (hour > 17 && hour < 21) return (hour - 17) / 4
  if (hour > 5 && hour < 8) return (8 - hour) / 3
  return 1
}

export function PixelRoom({ hour }) {
  const night = nightAmount(hour)
  return (
    <div
      className="pixel-room-embed"
      role="img"
      aria-label="Pixel-art bedroom matching the displayed Seoul time"
      style={{
        '--room-night': night,
        '--avatar-brightness': 1 - night * 0.1,
        '--avatar-saturation': 1 - night * 0.02,
        '--avatar-warm': night * 0.52,
      }}
    >
      <img src={roomDay} alt="" className="pixel-room-art" draggable={false} />
      <img src={roomNight} alt="" className="pixel-room-art pixel-room-night" draggable={false} />

      <div className="pixel-avatar" aria-hidden="true">
        <div className="pixel-avatar-stack">
          <img src={girl} alt="" className="pixel-avatar-image" draggable={false} />
          <img src={girlBlink} alt="" className="pixel-avatar-image pixel-avatar-blink" draggable={false} />
          <div className="pixel-avatar-light pixel-avatar-cool" />
          <div className="pixel-avatar-light pixel-avatar-warm" />
        </div>
      </div>
    </div>
  )
}

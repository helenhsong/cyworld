import petalSprite from './assets/journal/cherry-petal-room.png'

// left/top are % of .journal-character-box, re-derived from each
// petal's intended spawn point in room-day.png's window (pixel-
// measured against the source art, then mapped through the box's
// current object-fit: cover crop) rather than eyeballed — the box's
// aspect ratio shifts slightly whenever the surrounding Home tab
// layout changes (it did when the Links section was added below
// Mini Room), which silently drifts plain eyeballed percentages off
// the window and onto the curtain/wall. Re-measure the same way (see
// PixelRoom.css's .pixel-tea-steam comment) if this drifts again.
// Motion itself is back to the original driftX/driftY/wobble/turn
// diagonal-dash model, per feedback — a couple of "floatier"/slower
// passes were tried in between and preferred less than this original.
const PETALS = [
  { left: 71.0, top: 11.9, size: 8, angle: -18, turn: 48, delay: 0, driftX: -94, driftY: 92, wobble: 8 },
  { left: 75.5, top: 10.4, size: 7, angle: 14, turn: -52, delay: -2.5, driftX: -126, driftY: 116, wobble: -7 },
  { left: 80.1, top: 12.9, size: 6, angle: -32, turn: 62, delay: -5, driftX: -108, driftY: 102, wobble: 6 },
  { left: 82.7, top: 16.4, size: 7, angle: 22, turn: -66, delay: -7.4, driftX: -142, driftY: 128, wobble: -9 },
  { left: 78.1, top: 19.4, size: 6, angle: -10, turn: 44, delay: -9.9, driftX: -116, driftY: 88, wobble: 7 },
  { left: 73.6, top: 17.9, size: 7, angle: -24, turn: 54, delay: -1.25, driftX: -102, driftY: 96, wobble: -6 },
  { left: 81.4, top: 21.9, size: 6, angle: 18, turn: -58, delay: -6.2, driftX: -132, driftY: 110, wobble: 8 },
]

function petalPath({ driftX, driftY, wobble, angle, turn }) {
  return {
    '--petal-x-1': `${Math.round(driftX * 0.18 + wobble)}px`,
    '--petal-y-1': `${Math.round(driftY * 0.2)}px`,
    '--petal-x-2': `${Math.round(driftX * 0.43 - wobble)}px`,
    '--petal-y-2': `${Math.round(driftY * 0.46)}px`,
    '--petal-x-3': `${Math.round(driftX * 0.72 + wobble)}px`,
    '--petal-y-3': `${Math.round(driftY * 0.73)}px`,
    '--petal-x-4': `${driftX}px`,
    '--petal-y-4': `${driftY}px`,
    '--petal-r-0': `${angle}deg`,
    '--petal-r-1': `${Math.round(angle + turn * 0.28)}deg`,
    '--petal-r-2': `${Math.round(angle + turn * 0.55)}deg`,
    '--petal-r-3': `${Math.round(angle + turn * 0.78)}deg`,
    '--petal-r-4': `${angle + turn}deg`,
  }
}

export function CherryBlossomPetals() {
  return (
    <div className="pixel-petal-layer" aria-hidden="true">
      {PETALS.map((petal) => (
        <img
          key={`${petal.left}-${petal.top}`}
          src={petalSprite}
          alt=""
          className="pixel-petal"
          draggable={false}
          style={{
            '--petal-left': `${petal.left}%`,
            '--petal-top': `${petal.top}%`,
            '--petal-size': `${petal.size}px`,
            '--petal-duration': '12.4s',
            '--petal-delay': `${petal.delay}s`,
            ...petalPath(petal),
          }}
        />
      ))}
    </div>
  )
}

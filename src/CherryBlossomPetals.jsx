import petalSprite from './assets/journal/cherry-petal-room.png'

const PETALS = [
  { left: 73, top: 12, size: 8, angle: -18, turn: 48, delay: 0, driftX: -94, driftY: 92, wobble: 8 },
  { left: 81, top: 17, size: 7, angle: 14, turn: -52, delay: -2.5, driftX: -126, driftY: 116, wobble: -7 },
  { left: 77, top: 25, size: 6, angle: -32, turn: 62, delay: -5, driftX: -108, driftY: 102, wobble: 6 },
  { left: 87, top: 10, size: 7, angle: 22, turn: -66, delay: -7.4, driftX: -142, driftY: 128, wobble: -9 },
  { left: 83, top: 30, size: 6, angle: -10, turn: 44, delay: -9.9, driftX: -116, driftY: 88, wobble: 7 },
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

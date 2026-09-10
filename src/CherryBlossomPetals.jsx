const PETALS = [
  { left: 73, top: 12, duration: 7.4, delay: -1.2, driftX: -94, driftY: 92, wobble: 8 },
  { left: 81, top: 17, duration: 8.6, delay: -5.5, driftX: -126, driftY: 116, wobble: -7 },
  { left: 77, top: 25, duration: 7.9, delay: -3.4, driftX: -108, driftY: 102, wobble: 6 },
  { left: 87, top: 10, duration: 9.2, delay: -7.1, driftX: -142, driftY: 128, wobble: -9 },
  { left: 83, top: 30, duration: 8.2, delay: -6.2, driftX: -116, driftY: 88, wobble: 7 },
  { left: 89, top: 22, duration: 7.6, delay: -2.6, driftX: -132, driftY: 110, wobble: -6 },
]

function petalPath({ driftX, driftY, wobble }) {
  return {
    '--petal-x-1': `${Math.round(driftX * 0.18 + wobble)}px`,
    '--petal-y-1': `${Math.round(driftY * 0.2)}px`,
    '--petal-x-2': `${Math.round(driftX * 0.43 - wobble)}px`,
    '--petal-y-2': `${Math.round(driftY * 0.46)}px`,
    '--petal-x-3': `${Math.round(driftX * 0.72 + wobble)}px`,
    '--petal-y-3': `${Math.round(driftY * 0.73)}px`,
    '--petal-x-4': `${driftX}px`,
    '--petal-y-4': `${driftY}px`,
  }
}

export function CherryBlossomPetals() {
  return (
    <div className="pixel-petal-layer" aria-hidden="true">
      {PETALS.map((petal, index) => (
        <span
          key={`${petal.left}-${petal.top}`}
          className={`pixel-petal pixel-petal-${(index % 3) + 1}`}
          style={{
            '--petal-left': `${petal.left}%`,
            '--petal-top': `${petal.top}%`,
            '--petal-duration': `${petal.duration}s`,
            '--petal-delay': `${petal.delay}s`,
            ...petalPath(petal),
          }}
        />
      ))}
    </div>
  )
}

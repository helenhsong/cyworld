import { useEffect, useRef, useState } from 'react'
import petalSprite from './assets/journal/cherry-petal-room.png'

function randomBetween(min, max) {
  return min + Math.random() * (max - min)
}

function randomSign() {
  return Math.random() < 0.5 ? -1 : 1
}

function randomPetalAngle() {
  // The sprite is already drawn with its long axis at about 45 degrees.
  // Keep it near that natural half-upright angle instead of rotating it vertical.
  return randomBetween(-8, 8)
}

// A gust supplies the common direction for petals that arrive together.
// Each petal only varies slightly around it, like nearby petals caught by
// the same current rather than independent particles crossing paths.
function createPetal(id, gust, index, count) {
  const driftX = gust.driftX + randomBetween(-6, 6)
  const driftY = gust.driftY + randomBetween(-10, 12)
  const sway = gust.sway * randomBetween(0.78, 1.16)
  const angle = randomPetalAngle()
  const rock = randomBetween(4, 10) * randomSign()
  const lift = gust.lift + randomBetween(-1, 1)
  const spreadPosition = index - (count - 1) / 2
  const verticalSpread = count === 2 ? gust.spreadY : gust.spreadY * 0.65

  return {
    id,
    left: gust.left + spreadPosition * gust.spreadX + randomBetween(-0.7, 0.7),
    top: gust.top + spreadPosition * verticalSpread + randomBetween(-0.6, 0.6),
    size: randomBetween(5.5, 8),
    duration: gust.duration + randomBetween(-550, 650),
    delay: index * gust.stagger + (index === 0 ? 0 : randomBetween(-60, 80)),
    path: {
      '--petal-x-1': `${Math.round(driftX * 0.16)}px`,
      '--petal-y-1': `${Math.round(lift)}px`,
      '--petal-x-2': `${Math.round(driftX * 0.34 + sway * 0.25)}px`,
      '--petal-y-2': `${Math.round(driftY * 0.12 + lift)}px`,
      '--petal-x-3': `${Math.round(driftX * 0.55 - sway * 0.2)}px`,
      '--petal-y-3': `${Math.round(driftY * 0.34)}px`,
      '--petal-x-4': `${Math.round(driftX * 0.78 + sway * 0.12)}px`,
      '--petal-y-4': `${Math.round(driftY * 0.64)}px`,
      '--petal-x-5': `${Math.round(driftX)}px`,
      '--petal-y-5': `${Math.round(driftY)}px`,
      '--petal-r-0': `${angle.toFixed(1)}deg`,
      '--petal-r-1': `${(angle + rock * 0.4).toFixed(1)}deg`,
      '--petal-r-2': `${(angle - rock * 0.35).toFixed(1)}deg`,
      '--petal-r-3': `${(angle + rock * 0.25).toFixed(1)}deg`,
      '--petal-r-4': `${(angle - rock * 0.15).toFixed(1)}deg`,
      '--petal-r-5': `${angle.toFixed(1)}deg`,
    },
  }
}

function createGust() {
  const reachesCharacter = Math.random() < 0.2

  return {
    // Spawn inside the lower half of the visible window, then let
    // gravity carry the path farther down than the breeze carries it in.
    left: randomBetween(75.5, 82),
    top: randomBetween(21, 28),
    driftX: reachesCharacter ? randomBetween(-138, -112) : randomBetween(-76, -48),
    driftY: randomBetween(112, 164),
    sway: randomBetween(5, 12) * randomSign(),
    lift: randomBetween(-2, 3),
    duration: reachesCharacter ? randomBetween(8400, 10400) : randomBetween(7600, 9800),
    spreadX: randomBetween(7.5, 9.5),
    spreadY: randomBetween(10, 14.5),
    stagger: randomBetween(580, 880),
  }
}

export function CherryBlossomPetals() {
  const [petals, setPetals] = useState([])
  const nextId = useRef(0)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let timer

    const scheduleGust = (delay) => {
      timer = window.setTimeout(() => {
        if (!reducedMotion.matches) {
          const gust = createGust()
          const roll = Math.random()
          const count = roll < 0.72 ? 1 : roll < 0.97 ? 2 : 3
          const incoming = Array.from({ length: count }, (_, index) =>
            createPetal(nextId.current++, gust, index, count),
          )

          // The slice is only a safety net for a suspended tab where an
          // animationend event might be delayed for a long time.
          setPetals((current) => [...current, ...incoming].slice(-8))
        }

        scheduleGust(randomBetween(4800, 7800))
      }, delay)
    }

    const handleMotionPreference = () => {
      window.clearTimeout(timer)
      setPetals([])
      if (!reducedMotion.matches) scheduleGust(randomBetween(450, 1100))
    }

    reducedMotion.addEventListener('change', handleMotionPreference)
    if (!reducedMotion.matches) scheduleGust(randomBetween(500, 1300))

    return () => {
      window.clearTimeout(timer)
      reducedMotion.removeEventListener('change', handleMotionPreference)
    }
  }, [])

  const removePetal = (id) => {
    setPetals((current) => current.filter((petal) => petal.id !== id))
  }

  return (
    <div className="pixel-petal-layer" aria-hidden="true">
      {petals.map((petal) => (
        <img
          key={petal.id}
          src={petalSprite}
          alt=""
          className="pixel-petal"
          draggable={false}
          onAnimationEnd={() => removePetal(petal.id)}
          style={{
            '--petal-left': `${petal.left}%`,
            '--petal-top': `${petal.top}%`,
            '--petal-size': `${petal.size}px`,
            '--petal-duration': `${petal.duration}ms`,
            '--petal-delay': `${petal.delay}ms`,
            ...petal.path,
          }}
        />
      ))}
    </div>
  )
}

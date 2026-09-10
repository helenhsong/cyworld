import roomDay from './assets/journal/room-day.png'
import girl from './assets/journal/girl-sprite-soft.png'
import girlBlink from './assets/journal/girl-sprite-blink-soft.png'
import steam1 from './assets/journal/steam-1.png'
import steam2 from './assets/journal/steam-2.png'
import steam3 from './assets/journal/steam-3.png'
import petalSprite from './assets/journal/cherry-petal-room.png'

export { roomDay, girl, girlBlink }
export const STEAM_FRAMES = [steam1, steam2, steam3]

// Journal.jsx preloads these before revealing the Home tab. Keeping
// the list beside the room's asset imports means a new visual layer
// cannot accidentally be left out of the coordinated first paint.
export const PIXEL_ROOM_ASSETS = [roomDay, girl, girlBlink, ...STEAM_FRAMES, petalSprite]

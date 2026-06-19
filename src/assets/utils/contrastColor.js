function hexToHsl(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const l = (max + min) / 2
    const d = max - min

    let h = 0
    let s = 0
    if (d !== 0) {
        s = d / (1 - Math.abs(2 * l - 1))
        switch (max) {
            case r: h = ((g - b) / d) % 6; break
            case g: h = (b - r) / d + 2; break
            case b: h = (r - g) / d + 4; break
        }
        h *= 60
        if (h < 0) h += 360
    }

    return { h, s, l }
}

function hslToRgb(h, s, l) {
    const c = (1 - Math.abs(2 * l - 1)) * s
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
    const m = l - c / 2

    let r = 0, g = 0, b = 0
    if (h < 60) [r, g, b] = [c, x, 0]
    else if (h < 120) [r, g, b] = [x, c, 0]
    else if (h < 180) [r, g, b] = [0, c, x]
    else if (h < 240) [r, g, b] = [0, x, c]
    else if (h < 300) [r, g, b] = [x, 0, c]
    else [r, g, b] = [c, 0, x]

    return [r + m, g + m, b + m]
}

function relativeLuminance(r, g, b) {
    const channel = (v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4))
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

function contrastRatio(l1, l2) {
    const lighter = Math.max(l1, l2)
    const darker = Math.min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)
}

function hslToCss(h, s, l) {
    return `hsl(${h}, ${s * 100}%, ${l * 100}%)`
}

// --gray1/--gray2's ratios against a white page (~18.9:1, ~7.5:1) aren't
// reachable against a lighter background like this one — even pure black
// only reaches ~16.5:1 here, and chasing an unreachable ratio just clips to
// the lightness floor, which reads as plain black regardless of hue. These
// values keep the same *tier* (title noticeably darker than body text)
// while staying within what's actually achievable against this background.
export const TITLE_CONTRAST_RATIO = 10
export const DESCRIPTION_CONTRAST_RATIO = 7.5

// Lightness floor/ceiling so the result keeps visibly perceptible hue
// instead of reading as plain black/white when a target ratio is unreachable.
const MIN_LIGHTNESS = 0.18
const MAX_LIGHTNESS = 0.85

// Returns the smallest lightness shift (same hue/saturation as the
// background) needed to reach the target WCAG contrast ratio, so the
// result stays in the background's color scheme without going near-black/white.
export function getContrastColor(backgroundHex, targetRatio = 7) {
    const { h, s, l } = hexToHsl(backgroundHex)
    const bgLuminance = relativeLuminance(...hslToRgb(h, s, l))
    const goDarker = l > 0.5

    const step = goDarker ? -0.02 : 0.02
    let candidate = Math.min(MAX_LIGHTNESS, Math.max(MIN_LIGHTNESS, l))
    while (candidate >= MIN_LIGHTNESS && candidate <= MAX_LIGHTNESS) {
        const candidateLuminance = relativeLuminance(...hslToRgb(h, s, candidate))
        if (contrastRatio(bgLuminance, candidateLuminance) >= targetRatio) break
        candidate += step
    }
    candidate = Math.min(MAX_LIGHTNESS, Math.max(MIN_LIGHTNESS, candidate))

    return hslToCss(h, s, candidate)
}

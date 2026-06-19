import { useEffect } from 'react'

// Measures the space the header already occupies from the top of the
// viewport (its own box plus any padding above it) and publishes it as
// a CSS variable, so sibling pages can subtract it instead of stacking
// their own top padding on top of the header's.
export function useHeaderSpace(headerRef) {
    useEffect(() => {
        const headerEl = headerRef.current
        if (!headerEl) return

        const updateHeaderSpace = () => {
            const headerSpace = headerEl.getBoundingClientRect().bottom
            document.documentElement.style.setProperty('--header-space', `${headerSpace}px`)
        }

        updateHeaderSpace()

        const resizeObserver = new ResizeObserver(updateHeaderSpace)
        resizeObserver.observe(headerEl)
        window.addEventListener('resize', updateHeaderSpace)

        return () => {
            resizeObserver.disconnect()
            window.removeEventListener('resize', updateHeaderSpace)
        }
    }, [headerRef])
}

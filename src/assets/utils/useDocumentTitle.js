import { useEffect } from 'react'

// Sets document.title from a prop instead of hardcoding it, so any project
// using this template can drive the browser tab title from its own README.
export function useDocumentTitle(title) {
    useEffect(() => {
        if (!title) return
        document.title = title
    }, [title])
}

// Splits raw README text into a page title (first non-empty line) and the
// remaining content as paragraphs (split on blank lines). Lets any project
// using this template drive its title/copy from README.md instead of
// hardcoding it into a component.
export function parseReadme(raw) {
    const lines = raw.split('\n').map((line) => line.trim())
    const titleIndex = lines.findIndex((line) => line.length > 0)
    const title = (lines[titleIndex] ?? '').replace(/^#+\s*/, '')

    const paragraphs = lines
        .slice(titleIndex + 1)
        .join('\n')
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
        .filter(Boolean)

    return { title, paragraphs }
}

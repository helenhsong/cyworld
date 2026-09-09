// Build-time cover-art fetcher for the Diary tab entries.
//
// Run manually (not part of `npm run build`/CI) whenever DIARY_ENTRIES
// in src/Journal.jsx changes: fetches poster/cover images and writes
// them into src/assets/journal/covers/, where Journal.jsx picks them
// up like any other local asset. The deployed site never calls these
// APIs itself and never sees an API key — this script's *output*
// (plain image files) is what gets committed.
//
//   TMDB_API_KEY=your_key_here node scripts/fetch-covers.mjs
//
// TMDB_API_KEY needs a free account + API key from
// https://www.themoviedb.org/settings/api — required for movie
// entries. Book entries use Open Library's cover API, which needs no
// key at all, so those fetch regardless.
//
// Keep this list's slugs in sync with the `slug` field on each entry
// in DIARY_ENTRIES (src/Journal.jsx) — that's how Journal.jsx matches
// a downloaded file back to the entry it belongs to.
const ENTRIES = [
  { type: 'movie', slug: 'alien-1979', query: 'Alien', year: 1979 },
  { type: 'book', slug: 'project-hail-mary', query: 'Project Hail Mary', author: 'Andy Weir' },
  { type: 'movie', slug: 'spider-man-brand-new-day', query: 'Spider-Man: Brand New Day', year: 2026 },
  { type: 'movie', slug: 'the-drama-2026', query: 'The Drama', year: 2026 },
  { type: 'movie', slug: 'backrooms-2026', query: 'Backrooms', year: 2026 },
]

const OUT_DIR = new URL('../src/assets/journal/covers/', import.meta.url)
const TMDB_API_KEY = process.env.TMDB_API_KEY

async function fetchMoviePosterUrl({ query, year }) {
  if (!TMDB_API_KEY) {
    console.warn(`  skipped (no TMDB_API_KEY set)`)
    return null
  }
  const url = new URL('https://api.themoviedb.org/3/search/movie')
  url.searchParams.set('api_key', TMDB_API_KEY)
  url.searchParams.set('query', query)
  if (year) url.searchParams.set('year', String(year))
  const res = await fetch(url)
  if (!res.ok) throw new Error(`TMDB search failed (${res.status}): ${await res.text()}`)
  const data = await res.json()
  const posterPath = data.results?.[0]?.poster_path
  if (!posterPath) {
    console.warn(`  no TMDB match for "${query}"${year ? ` (${year})` : ''}`)
    return null
  }
  return `https://image.tmdb.org/t/p/w500${posterPath}`
}

async function fetchBookCoverUrl({ query, author }) {
  const url = new URL('https://openlibrary.org/search.json')
  url.searchParams.set('title', query)
  if (author) url.searchParams.set('author', author)
  url.searchParams.set('limit', '1')
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Open Library search failed (${res.status}): ${await res.text()}`)
  const data = await res.json()
  const coverId = data.docs?.[0]?.cover_i
  if (!coverId) {
    console.warn(`  no Open Library match for "${query}"${author ? ` by ${author}` : ''}`)
    return null
  }
  return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
}

async function downloadTo(imageUrl, destUrl) {
  const res = await fetch(imageUrl)
  if (!res.ok) throw new Error(`Failed to download ${imageUrl} (${res.status})`)
  const buffer = Buffer.from(await res.arrayBuffer())
  const fs = await import('node:fs/promises')
  await fs.writeFile(destUrl, buffer)
}

async function main() {
  const fs = await import('node:fs/promises')
  await fs.mkdir(OUT_DIR, { recursive: true })

  for (const entry of ENTRIES) {
    console.log(`${entry.slug}:`)
    const imageUrl =
      entry.type === 'movie' ? await fetchMoviePosterUrl(entry) : await fetchBookCoverUrl(entry)
    if (!imageUrl) continue

    const ext = new URL(imageUrl).pathname.match(/\.\w+$/)?.[0] || '.jpg'
    const dest = new URL(`${entry.slug}${ext}`, OUT_DIR)
    await downloadTo(imageUrl, dest)
    console.log(`  saved ${entry.slug}${ext}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

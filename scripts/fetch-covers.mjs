// Build-time cover-art fetcher for the Diary tab entries.
//
// Run manually (not part of `npm run build`/CI) whenever DIARY_ENTRIES
// in src/Journal.jsx changes: fetches poster/cover images and writes
// them into src/assets/journal/covers/, where Journal.jsx picks them
// up like any other local asset. The deployed site never calls these
// APIs itself and never sees an API key — this script's *output*
// (plain image files) is what gets committed.
//
//   npm run fetch-covers
//
// Reads OMDB_API_KEY from a gitignored .env.local file in the repo
// root (KEY=value per line — see .env.local.example) if present,
// otherwise from the environment:
//
//   OMDB_API_KEY=your_key_here npm run fetch-covers
//
// OMDB_API_KEY needs a free account + API key from
// https://www.omdbapi.com/apikey.aspx — required for movie entries
// (OMDb wraps real IMDB data, including its poster images). Book
// entries use Open Library's cover API, which needs no key at all, so
// those fetch regardless.
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

const REPO_ROOT = new URL('../', import.meta.url)
const OUT_DIR = new URL('src/assets/journal/covers/', REPO_ROOT)

async function loadEnvLocal() {
  const fs = await import('node:fs/promises')
  try {
    const text = await fs.readFile(new URL('.env.local', REPO_ROOT), 'utf8')
    for (const line of text.split('\n')) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/)
      if (match && !(match[1] in process.env)) process.env[match[1]] = match[2]
    }
  } catch {
    // No .env.local — fine, fall through to whatever's already in
    // process.env (e.g. OMDB_API_KEY=... npm run fetch-covers).
  }
}

async function fetchMoviePosterUrl({ query, year }) {
  const apiKey = process.env.OMDB_API_KEY
  if (!apiKey) {
    console.warn(`  skipped (no OMDB_API_KEY set — see this script's header comment)`)
    return null
  }
  const url = new URL('https://www.omdbapi.com/')
  url.searchParams.set('apikey', apiKey)
  url.searchParams.set('t', query)
  if (year) url.searchParams.set('y', String(year))
  const res = await fetch(url)
  if (!res.ok) throw new Error(`OMDb request failed (${res.status}): ${await res.text()}`)
  const data = await res.json()
  if (data.Response === 'False') {
    console.warn(`  OMDb: ${data.Error} ("${query}"${year ? `, ${year}` : ''})`)
    return null
  }
  if (!data.Poster || data.Poster === 'N/A') {
    console.warn(`  OMDb has no poster for "${query}"${year ? ` (${year})` : ''}`)
    return null
  }
  return data.Poster
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
  await loadEnvLocal()
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

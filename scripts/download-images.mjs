import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DISHES_PATH = join(ROOT, 'data', 'dishes.json')
const IMAGES_DIR = join(ROOT, 'public', 'images', 'dishes')
const UA = 'RDish/1.0 (https://rdish.reload.co.jp; yamamoto@reload.co.jp)'

const dishes = JSON.parse(readFileSync(DISHES_PATH, 'utf-8'))

const sleep = ms => new Promise(r => setTimeout(r, ms))

function isSkippableExt(url) {
  return /\.(svg|gif|tif|tiff|ogg|ogv|webm|pdf)(\?|$)/i.test(url)
}

function getExt(url) {
  const m = url.match(/\.(jpe?g|png|webp)(\?|$)/i)
  return m ? (m[1].toLowerCase() === 'jpeg' ? 'jpg' : m[1].toLowerCase()) : 'jpg'
}

async function apiFetch(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA } })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

// Wikipedia REST API → main article image
async function getWikipediaImage(title) {
  const data = await apiFetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
  )
  if (!data) return null
  const url = data.originalimage?.source || data.thumbnail?.source
  return url && !isSkippableExt(url) ? url : null
}

// Commons search → file titles
async function searchCommons(query, limit = 10) {
  const data = await apiFetch(
    `https://commons.wikimedia.org/w/api.php?action=query&list=search` +
    `&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=${limit}&format=json&origin=*`
  )
  return data?.query?.search?.map(r => r.title) ?? []
}

// File title → thumb URL
async function commonsThumbUrl(fileTitle) {
  const data = await apiFetch(
    `https://commons.wikimedia.org/w/api.php?action=query` +
    `&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=url&iiurlwidth=1200&format=json&origin=*`
  )
  const page = Object.values(data?.query?.pages ?? {})[0]
  const url = page?.imageinfo?.[0]?.thumburl ?? page?.imageinfo?.[0]?.url
  return url && !isSkippableExt(url) ? url : null
}

async function downloadFile(url, dest) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA } })
    if (!res.ok) return false
    const buf = await res.arrayBuffer()
    writeFileSync(dest, Buffer.from(buf))
    return true
  } catch {
    return false
  }
}

async function processDish(dish) {
  const dir = join(IMAGES_DIR, dish.id)
  mkdirSync(dir, { recursive: true })

  const collected = []

  // --- 1. Wikipedia main image (English name first, then Japanese) ---
  for (const term of [dish.englishName, dish.name].filter(Boolean)) {
    const url = await getWikipediaImage(term)
    await sleep(500)
    if (!url) continue
    const ext = getExt(url)
    const dest = join(dir, `1.${ext}`)
    if (await downloadFile(url, dest)) {
      collected.push(`/images/dishes/${dish.id}/1.${ext}`)
      break
    }
  }

  // --- 2. Commons search ---
  const searchQuery = `${dish.englishName ?? dish.name} food`
  const fileTitles = await searchCommons(searchQuery, 12)
  await sleep(500)

  for (const title of fileTitles) {
    if (collected.length >= 3) break
    if (isSkippableExt(title)) continue

    const url = await commonsThumbUrl(title)
    await sleep(400)
    if (!url) continue

    const idx = collected.length + 1
    const ext = getExt(url)
    const dest = join(dir, `${idx}.${ext}`)
    if (await downloadFile(url, dest)) {
      collected.push(`/images/dishes/${dish.id}/${idx}.${ext}`)
    }
    await sleep(300)
  }

  return collected
}

// Main
const updated = []
const imageMap = {}

for (let i = 0; i < dishes.length; i++) {
  const dish = dishes[i]
  process.stdout.write(`[${i + 1}/${dishes.length}] ${dish.id} ... `)

  // Skip if already downloaded
  const dir = join(IMAGES_DIR, dish.id)
  if (existsSync(dir)) {
    const { readdirSync } = await import('fs')
    const files = readdirSync(dir).filter(f => /\.(jpe?g|png|webp)$/i.test(f))
    if (files.length > 0) {
      const paths = files.sort().map(f => `/images/dishes/${dish.id}/${f}`)
      imageMap[dish.id] = paths
      updated.push({ ...dish, images: paths })
      console.log(`skip (${files.length} files exist)`)
      continue
    }
  }

  const images = await processDish(dish)
  imageMap[dish.id] = images
  updated.push({ ...dish, images })
  console.log(`${images.length} images`)

  await sleep(800)
}

writeFileSync(DISHES_PATH, JSON.stringify(updated, null, 2))
console.log('\nDone. dishes.json updated.')

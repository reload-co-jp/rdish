import { readFileSync, writeFileSync, unlinkSync, statSync } from 'fs'
import { join, dirname, extname } from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DISHES_PATH = join(ROOT, 'data', 'dishes.json')
const PUBLIC_DIR = join(ROOT, 'public')

const MAX_WIDTH = 800
const QUALITY = 80

const dishes = JSON.parse(readFileSync(DISHES_PATH, 'utf-8'))

async function optimize(absSrcPath) {
  const ext = extname(absSrcPath).toLowerCase()
  if (ext === '.webp') return { newPath: absSrcPath, before: 0, after: 0 }

  const absDestPath = absSrcPath.slice(0, -ext.length) + '.webp'
  const before = statSync(absSrcPath).size

  await sharp(absSrcPath)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(absDestPath)

  unlinkSync(absSrcPath)
  const after = statSync(absDestPath).size
  return { newPath: absDestPath, before, after }
}

let totalBefore = 0
let totalAfter = 0
let count = 0

for (const dish of dishes) {
  if (!dish.images || dish.images.length === 0) continue

  const newImages = []
  for (const webPath of dish.images) {
    const ext = extname(webPath).toLowerCase()
    if (ext === '.webp') {
      newImages.push(webPath)
      continue
    }
    const absSrcPath = join(PUBLIC_DIR, webPath)
    try {
      const { newPath, before, after } = await optimize(absSrcPath)
      totalBefore += before
      totalAfter += after
      count++
      const newWebPath = webPath.slice(0, -ext.length) + '.webp'
      newImages.push(newWebPath)
    } catch (e) {
      console.error(`FAILED: ${webPath} — ${e.message}`)
      newImages.push(webPath)
    }
  }
  dish.images = newImages
}

writeFileSync(DISHES_PATH, JSON.stringify(dishes, null, 2) + '\n')

const mb = (n) => (n / 1024 / 1024).toFixed(1)
console.log(`\nConverted ${count} images.`)
console.log(`Before: ${mb(totalBefore)}MB -> After: ${mb(totalAfter)}MB (${(100 - (totalAfter / totalBefore) * 100).toFixed(1)}% reduction)`)
console.log('dishes.json updated.')

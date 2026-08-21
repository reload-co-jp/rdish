// dishes.json の images 配列から画像を削除し、対応する実ファイルも削除する。
//
// 使い方:
//   node scripts/remove-image.mjs <dish-id>           画像一覧を表示
//   node scripts/remove-image.mjs <dish-id> <n>       n番目(1始まり)の画像を削除
//   node scripts/remove-image.mjs <dish-id> all       画像を全部削除
import { readFileSync, writeFileSync, existsSync, unlinkSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const DISHES_PATH = join(ROOT, "data", "dishes.json")
const PUBLIC_DIR = join(ROOT, "public")

const [dishId, arg] = process.argv.slice(2)

if (!dishId) {
  console.error("Usage: node scripts/remove-image.mjs <dish-id> [n|all]")
  process.exit(1)
}

const dishes = JSON.parse(readFileSync(DISHES_PATH, "utf-8"))
const dish = dishes.find((d) => d.id === dishId)

if (!dish) {
  console.error(`Dish id not found: ${dishId}`)
  process.exit(1)
}

const images = dish.images ?? []

if (images.length === 0) {
  console.log(`${dish.id}: no images`)
  process.exit(0)
}

if (!arg) {
  images.forEach((src, i) => console.log(`${i + 1}. ${src}`))
  process.exit(0)
}

function deleteFile(src) {
  const filePath = join(PUBLIC_DIR, src)
  if (existsSync(filePath)) {
    unlinkSync(filePath)
    return true
  }
  return false
}

let toRemove
if (arg === "all") {
  toRemove = images
} else {
  const n = Number(arg)
  if (!Number.isInteger(n) || n < 1 || n > images.length) {
    console.error(`Invalid index: ${arg} (dish has ${images.length} image(s))`)
    process.exit(1)
  }
  toRemove = [images[n - 1]]
}

for (const src of toRemove) {
  const deleted = deleteFile(src)
  console.log(`${deleted ? "removed" : "not found (skip)"}: ${src}`)
}

dish.images = images.filter((src) => !toRemove.includes(src))

writeFileSync(DISHES_PATH, JSON.stringify(dishes, null, 2) + "\n")
console.log(
  `\ndishes.json updated. ${dish.id} now has ${dish.images.length} image(s).`
)
console.log("Commit後、node scripts/generate-dish-dates.mjs を忘れずに実行。")

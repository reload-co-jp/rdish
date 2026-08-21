// data/dishes.json の git 履歴から料理ごとの最終更新日を抽出し
// data/dish-dates.json に書き出す。sitemap の lastModified に使用。
import { execFileSync } from "node:child_process"
import { createHash } from "node:crypto"
import { writeFileSync } from "node:fs"

const git = (...args) =>
  execFileSync("git", args, { encoding: "utf8", maxBuffer: 1024 * 1024 * 256 })

const commits = git(
  "log",
  "--reverse",
  "--format=%H %cI",
  "--",
  "data/dishes.json"
)
  .trim()
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const [sha, date] = line.split(" ")
    return { sha, date: date.slice(0, 10) }
  })

const lastModified = {}
const prevHashes = new Map()

for (const { sha, date } of commits) {
  let dishes
  try {
    dishes = JSON.parse(git("show", `${sha}:data/dishes.json`))
  } catch {
    continue
  }
  for (const dish of dishes) {
    const hash = createHash("sha1").update(JSON.stringify(dish)).digest("hex")
    if (prevHashes.get(dish.id) !== hash) {
      lastModified[dish.id] = date
      prevHashes.set(dish.id, hash)
    }
  }
}

const sorted = Object.fromEntries(
  Object.entries(lastModified).sort(([a], [b]) => a.localeCompare(b))
)
writeFileSync("data/dish-dates.json", JSON.stringify(sorted, null, 2) + "\n")
console.log(`dish-dates.json: ${Object.keys(sorted).length} entries`)

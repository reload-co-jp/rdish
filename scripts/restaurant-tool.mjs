#!/usr/bin/env node
// 飲食店データ追加の補助ツール。手順は .claude/commands/add-restaurant.md 参照
//
//   node scripts/restaurant-tool.mjs coverage              料理圏別の料理数/店紐づき済み数
//   node scripts/restaurant-tool.mjs coverage <料理圏>      その料理圏で店が未登録の料理一覧
//   node scripts/restaurant-tool.mjs match <menu.txt>      メニュー名(1行1品)→料理id候補
//   node scripts/restaurant-tool.mjs check                 restaurants.json 全件の厳格チェック
//   node scripts/restaurant-tool.mjs add <new.json>        新規店(配列)をチェックして restaurants.json に追記
import { execFileSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..")
const RESTAURANTS = path.join(root, "data/restaurants.json")
const dishes = JSON.parse(fs.readFileSync(path.join(root, "data/dishes.json"), "utf8"))
const dishById = new Map(dishes.map((d) => [d.id, d]))
const loadRestaurants = () => JSON.parse(fs.readFileSync(RESTAURANTS, "utf8"))

// 次元1の許可リストは CLAUDE.md を単一ソースとして読む
const allowedCuisines = (() => {
  const md = fs.readFileSync(path.join(root, "CLAUDE.md"), "utf8")
  const block = md.split("### 次元1")[1].split("```")[1]
  return new Set(block.split(/[\s/]+/).filter(Boolean))
})()

const PREFECTURES = new Set(
  "北海道 青森県 岩手県 宮城県 秋田県 山形県 福島県 茨城県 栃木県 群馬県 埼玉県 千葉県 東京都 神奈川県 新潟県 富山県 石川県 福井県 山梨県 長野県 岐阜県 静岡県 愛知県 三重県 滋賀県 京都府 大阪府 兵庫県 奈良県 和歌山県 鳥取県 島根県 岡山県 広島県 山口県 徳島県 香川県 愛媛県 高知県 福岡県 佐賀県 長崎県 熊本県 大分県 宮崎県 鹿児島県 沖縄県".split(" ")
)

const isUrl = (s) => typeof s === "string" && /^https?:\/\/\S+$/.test(s)

const validate = (r, existingIds = new Set()) => {
  const e = []
  const str = (k) => typeof r[k] === "string" && r[k].trim() !== ""
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(r.id ?? "")) e.push(`id "${r.id}" は英小文字・数字・ハイフンのみ`)
  if (existingIds.has(r.id)) e.push(`id "${r.id}" は既に存在`)
  for (const k of ["name", "prefecture", "area", "address", "description", "checkedAt"])
    if (!str(k)) e.push(`${k} が空`)
  if (r.kana && !/^[ぁ-ゖー\s]+$/.test(r.kana)) e.push(`kana "${r.kana}" はひらがなのみ`)
  if (r.prefecture && !PREFECTURES.has(r.prefecture)) e.push(`prefecture "${r.prefecture}" は都道府県名(例: 東京都)`)
  if (r.address && r.prefecture && !r.address.startsWith(r.prefecture)) e.push(`address は prefecture から始める`)
  if (!Array.isArray(r.cuisines) || r.cuisines.length === 0) e.push(`cuisines が空`)
  for (const c of r.cuisines ?? []) if (!allowedCuisines.has(c)) e.push(`cuisines "${c}" は次元1の許可リスト外`)
  if (r.checkedAt && !/^\d{4}-\d{2}-\d{2}$/.test(r.checkedAt)) e.push(`checkedAt は YYYY-MM-DD`)
  if (r.url !== undefined && !isUrl(r.url)) e.push(`url "${r.url}" が不正`)
  for (const s of r.sources ?? []) if (!isUrl(s)) e.push(`sources "${s}" が不正`)
  for (const l of r.links ?? []) if (!l.label || !isUrl(l.url)) e.push(`links の label/url が不正`)
  if (!r.url && (r.sources ?? []).length < 2) e.push(`公式 url がない場合は sources を2件以上`)
  if (r.description && r.description.length < 30) e.push(`description が短すぎる(30字以上)`)
  if (!Array.isArray(r.dishes) || r.dishes.length === 0) e.push(`dishes が空`)
  const seen = new Set()
  for (const d of r.dishes ?? []) {
    if (!dishById.has(d.id)) e.push(`dishes "${d.id}" は dishes.json に存在しない`)
    if (seen.has(d.id)) e.push(`dishes "${d.id}" が重複`)
    seen.add(d.id)
  }
  return e
}

const linkedIds = (rs) => new Set(rs.filter((r) => !r.closed).flatMap((r) => r.dishes.map((d) => d.id)))
const cuisineOf = (d) => (d.tags ?? []).filter((t) => allowedCuisines.has(t))

const coverage = (cuisine) => {
  const linked = linkedIds(loadRestaurants())
  const target = dishes.filter((d) => d.category === "料理")
  if (cuisine) {
    if (!allowedCuisines.has(cuisine)) throw new Error(`"${cuisine}" は次元1の許可リスト外`)
    for (const d of target)
      if (cuisineOf(d).includes(cuisine) && !linked.has(d.id))
        console.log(`${d.id}\t${d.name}\t${[d.originalName, ...(d.aliases ?? [])].filter(Boolean).join(" / ")}`)
    return
  }
  const count = new Map()
  for (const d of target)
    for (const c of cuisineOf(d)) {
      const v = count.get(c) ?? [0, 0]
      v[0]++
      if (linked.has(d.id)) v[1]++
      count.set(c, v)
    }
  console.log("料理圏\t料理数\t店あり\t未登録")
  for (const [c, [n, l]] of [...count].sort((a, b) => b[1][0] - a[1][0])) console.log(`${c}\t${n}\t${l}\t${n - l}`)
}

const norm = (s) =>
  (s ?? "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s・･\-‐－()（）「」『』【】"'’.,、。]/g, "")

const match = (file) => {
  const names = dishes.map((d) => ({
    d,
    keys: [d.name, d.kana, d.englishName, d.originalName, ...(d.aliases ?? [])].map(norm).filter((k) => k.length >= 2),
  }))
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const menu = norm(line)
    if (!menu) continue
    const hits = []
    for (const { d, keys } of names) {
      let score = 0
      for (const k of keys) {
        if (k === menu) score = Math.max(score, 100)
        else if (menu.includes(k)) score = Math.max(score, 50 + k.length)
        else if (k.includes(menu) && menu.length >= 3) score = Math.max(score, 30)
      }
      if (score) hits.push([score, d])
    }
    hits.sort((a, b) => b[0] - a[0])
    console.log(`■ ${line.trim()}`)
    if (!hits.length) console.log("  (候補なし → 紐づけない)")
    for (const [s, d] of hits.slice(0, 5)) console.log(`  ${s >= 100 ? "完全一致" : s >= 50 ? "部分一致" : "要確認  "}  ${d.id}\t${d.name}\t[${d.category}] ${d.summary ?? ""}`.slice(0, 160))
  }
}

const report = (errors) => {
  for (const [id, e] of errors) for (const m of e) console.error(`✗ ${id}: ${m}`)
  return errors.length === 0
}

const check = () => {
  const rs = loadRestaurants()
  const ids = new Set()
  const errors = []
  for (const r of rs) {
    const e = validate(r, ids)
    if (e.length) errors.push([r.id, e])
    ids.add(r.id)
  }
  if (!report(errors)) process.exit(1)
  console.log(`✓ ${rs.length}件 OK`)
}

const add = (file) => {
  const incoming = JSON.parse(fs.readFileSync(file, "utf8"))
  if (!Array.isArray(incoming)) throw new Error("追加ファイルは店オブジェクトの配列にする")
  const rs = loadRestaurants()
  const ids = new Set(rs.map((r) => r.id))
  const names = new Set(rs.map((r) => r.name))
  const errors = []
  for (const r of incoming) {
    const e = validate(r, ids)
    if (names.has(r.name)) e.push(`同名の店 "${r.name}" が既に存在（支店なら name に店舗名を含める）`)
    if (e.length) errors.push([r.id, e])
    ids.add(r.id)
    names.add(r.name)
  }
  if (!report(errors)) {
    console.error("追記を中止。上記を直して再実行")
    process.exit(1)
  }
  fs.writeFileSync(RESTAURANTS, JSON.stringify([...rs, ...incoming], null, 2) + "\n")
  execFileSync("npx", ["prettier", "--write", RESTAURANTS], { cwd: root, stdio: "ignore" })
  console.log(`✓ ${incoming.length}件追記（計${rs.length + incoming.length}件）`)
}

const [cmd, arg] = process.argv.slice(2)
const commands = { coverage, match, check, add }
if (!commands[cmd] || ((cmd === "match" || cmd === "add") && !arg)) {
  console.error("usage: restaurant-tool.mjs coverage [料理圏] | match <menu.txt> | check | add <new.json>")
  process.exit(1)
}
commands[cmd](arg)

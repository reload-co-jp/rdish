// similarItems の関係から料理相関図（/network/）用の静的データを生成する。
// レイアウトはビルド時に一度だけ計算し、public/data/dish-network.json に書き出す。
// 実行: node scripts/generate-dish-network.mjs
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")

const dishes = JSON.parse(
  fs.readFileSync(path.join(root, "data/dishes.json"), "utf8"),
)

// カテゴリを表示用の8グループに畳む（件数上位7カテゴリ + その他）
const CAT_ORDER = ["料理", "ソース", "野菜", "調理法", "食材", "デザート", "チーズ"]
function groupCat(c) {
  return CAT_ORDER.includes(c) ? c : "その他"
}

const nodes = dishes.map((d, i) => {
  const country = (d.regions && d.regions[0] && d.regions[0].country) || ""
  return {
    id: d.id,
    idx: i,
    name: d.name,
    en: d.englishName || "",
    cat: d.category,
    grp: groupCat(d.category),
    country,
    summary: (d.summary || "").slice(0, 100),
  }
})
const idxOf = new Map(nodes.map((n) => [n.id, n.idx]))

const edgeMap = new Map()
for (const d of dishes) {
  const ai = idxOf.get(d.id)
  for (const s of d.similarItems || []) {
    if (!s.id || !idxOf.has(s.id) || s.id === d.id) continue
    const bi = idxOf.get(s.id)
    const key = ai < bi ? `${ai}_${bi}` : `${bi}_${ai}`
    if (!edgeMap.has(key)) {
      edgeMap.set(key, { a: Math.min(ai, bi), b: Math.max(ai, bi), diffs: [] })
    }
    edgeMap.get(key).diffs.push(s.difference || "")
  }
}
const edges = [...edgeMap.values()]

const deg = new Array(nodes.length).fill(0)
for (const e of edges) {
  deg[e.a]++
  deg[e.b]++
}
nodes.forEach((n, i) => (n.deg = deg[i]))

// ---- force-directed layout（オフライン計算。実行時は静的座標を描画するだけ） ----
const N = nodes.length
const pos = nodes.map(() => ({
  x: (Math.random() - 0.5) * 2000,
  y: (Math.random() - 0.5) * 2000,
}))
const vel = nodes.map(() => ({ x: 0, y: 0 }))
const grpList = [...new Set(nodes.map((n) => n.grp))]

const REPULSION = 26000
const SPRING_K = 0.02
const SPRING_LEN = 60
const CENTER_K = 0.0025
const GROUP_K = 0.012
const DAMPING = 0.86
let temp = 1.0

function buildGrid(cellSize) {
  const grid = new Map()
  for (let i = 0; i < N; i++) {
    const cx = Math.floor(pos[i].x / cellSize)
    const cy = Math.floor(pos[i].y / cellSize)
    const key = cx + "," + cy
    if (!grid.has(key)) grid.set(key, [])
    grid.get(key).push(i)
  }
  return grid
}

const ITER = 500
for (let iter = 0; iter < ITER; iter++) {
  const cellSize = 140
  const grid = buildGrid(cellSize)
  const fx = new Float64Array(N)
  const fy = new Float64Array(N)

  for (const [key, cellNodes] of grid) {
    const [cx, cy] = key.split(",").map(Number)
    const neighborIdx = []
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++) {
        const nk = cx + dx + "," + (cy + dy)
        if (grid.has(nk)) neighborIdx.push(...grid.get(nk))
      }
    for (const i of cellNodes) {
      for (const j of neighborIdx) {
        if (i === j) continue
        let dx2 = pos[i].x - pos[j].x
        let dy2 = pos[i].y - pos[j].y
        let d2 = dx2 * dx2 + dy2 * dy2
        if (d2 < 1) d2 = 1
        const d = Math.sqrt(d2)
        const force = REPULSION / d2
        fx[i] += (dx2 / d) * force
        fy[i] += (dy2 / d) * force
      }
    }
  }

  for (const e of edges) {
    let dx2 = pos[e.b].x - pos[e.a].x
    let dy2 = pos[e.b].y - pos[e.a].y
    const d = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 1
    const force = SPRING_K * (d - SPRING_LEN)
    const ux = dx2 / d
    const uy = dy2 / d
    fx[e.a] += ux * force
    fy[e.a] += uy * force
    fx[e.b] -= ux * force
    fy[e.b] -= uy * force
  }

  for (let i = 0; i < N; i++) {
    fx[i] -= pos[i].x * CENTER_K
    fy[i] -= pos[i].y * CENTER_K
  }

  const centroids = new Map()
  for (const g of grpList) centroids.set(g, { x: 0, y: 0, n: 0 })
  for (let i = 0; i < N; i++) {
    const c = centroids.get(nodes[i].grp)
    c.x += pos[i].x
    c.y += pos[i].y
    c.n++
  }
  for (const c of centroids.values()) {
    c.x /= c.n
    c.y /= c.n
  }
  for (let i = 0; i < N; i++) {
    const c = centroids.get(nodes[i].grp)
    fx[i] += (c.x - pos[i].x) * GROUP_K
    fy[i] += (c.y - pos[i].y) * GROUP_K
  }

  for (let i = 0; i < N; i++) {
    vel[i].x = (vel[i].x + fx[i]) * DAMPING
    vel[i].y = (vel[i].y + fy[i]) * DAMPING
    pos[i].x += vel[i].x * temp
    pos[i].y += vel[i].y * temp
  }
  temp *= 0.995
}

let minX = Infinity,
  maxX = -Infinity,
  minY = Infinity,
  maxY = -Infinity
for (const p of pos) {
  minX = Math.min(minX, p.x)
  maxX = Math.max(maxX, p.x)
  minY = Math.min(minY, p.y)
  maxY = Math.max(maxY, p.y)
}
const scale = Math.min(2000 / (maxX - minX), 2000 / (maxY - minY))
nodes.forEach((n, i) => {
  n.x = Math.round(((pos[i].x - minX) * scale - 1000) * 10) / 10
  n.y = Math.round(((pos[i].y - minY) * scale - 1000) * 10) / 10
})

const groupCounts = {}
for (const n of nodes) groupCounts[n.grp] = (groupCounts[n.grp] || 0) + 1
const groups = CAT_ORDER.concat(["その他"]).map((g) => ({
  key: g,
  count: groupCounts[g] || 0,
}))

const out = {
  groups,
  nodes: nodes.map((n) => ({
    id: n.id,
    name: n.name,
    en: n.en,
    cat: n.cat,
    grp: n.grp,
    country: n.country,
    summary: n.summary,
    deg: n.deg,
    x: n.x,
    y: n.y,
  })),
  edges: edges.map((e) => ({ a: e.a, b: e.b, d: e.diffs[0] || "" })),
}

const outPath = path.join(root, "public/data/dish-network.json")
fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(out))
console.log(
  `wrote ${outPath} (${out.nodes.length} nodes, ${out.edges.length} edges)`,
)

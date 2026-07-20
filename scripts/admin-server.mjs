// ローカル限定の画像管理ツール。
// dishes.json の images を検索・削除できる簡易Web UIを localhost に立てる。
// 起動: node scripts/admin-server.mjs  (または: pnpm admin)
import { createServer } from 'node:http'
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'node:fs'
import { join, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DISHES_PATH = join(ROOT, 'data', 'dishes.json')
const DISH_DATES_PATH = join(ROOT, 'data', 'dish-dates.json')
const PUBLIC_DIR = join(ROOT, 'public')
const PORT = Number(process.env.PORT) || 4321
const HOST = '127.0.0.1'

const MIME = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
}

function loadDishes() {
  return JSON.parse(readFileSync(DISHES_PATH, 'utf-8'))
}

function loadDishDates() {
  return existsSync(DISH_DATES_PATH)
    ? JSON.parse(readFileSync(DISH_DATES_PATH, 'utf-8'))
    : {}
}

function saveDishes(dishes) {
  writeFileSync(DISHES_PATH, JSON.stringify(dishes, null, 2) + '\n')
}

function sendJson(res, status, data) {
  const body = JSON.stringify(data)
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(body)
}

function sendHtml(res, html) {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
  res.end(html)
}

const PAGE = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>RDish 画像管理（ローカル限定）</title>
<style>
  :root { color-scheme: light; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Hiragino Sans", sans-serif; background: #faf6f0; color: #2d1f0e; margin: 0; padding: 1.5rem; }
  h1 { font-size: 1.25rem; margin: 0 0 0.25rem; }
  .hint { color: #a89080; font-size: 0.8125rem; margin-bottom: 1.25rem; }
  input[type=text] { width: 100%; max-width: 24rem; padding: 0.5rem 0.75rem; font-size: 1rem; border: 1px solid #e8ddd0; border-radius: 0.375rem; box-sizing: border-box; }
  #results { margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
  .dish { background: #fff; border: 1px solid #e8ddd0; border-radius: 0.5rem; padding: 1rem; }
  .dish h2 { font-size: 1rem; margin: 0 0 0.125rem; }
  .dish .id { color: #a89080; font-size: 0.75rem; margin-bottom: 0.75rem; }
  .dish .id .updated { margin-left: 0.5rem; }
  .dish .summary { font-size: 0.8125rem; color: #5a4a3a; line-height: 1.6; margin: 0 0 0.75rem; }
  .section-title { font-size: 0.8125rem; color: #a89080; margin: 1.5rem 0 0.5rem; }
  .images { display: flex; flex-wrap: wrap; gap: 0.75rem; }
  .imgbox { width: 9rem; }
  .imgbox img { width: 9rem; height: 6.75rem; object-fit: cover; border-radius: 0.375rem; border: 1px solid #e8ddd0; display: block; background: #f0e6d6; }
  .imgbox .path { font-size: 0.6875rem; color: #a89080; word-break: break-all; margin: 0.25rem 0; }
  button.del { width: 100%; background: #dc2626; color: #fff; border: none; border-radius: 0.25rem; padding: 0.3rem 0; font-size: 0.75rem; cursor: pointer; }
  button.del:hover { background: #b91c1c; }
  .empty { color: #a89080; font-size: 0.875rem; }
  button.more { display: block; margin: 1.25rem auto 0; background: #f0e6d6; color: #7a4f2a; border: 1px solid #e8ddd0; border-radius: 0.375rem; padding: 0.5rem 1.5rem; font-size: 0.875rem; cursor: pointer; }
  button.more:hover { background: #e8ddd0; }
  button.more:disabled { opacity: 0.5; cursor: default; }
  .status { font-size: 0.75rem; margin-top: 0.5rem; }
</style>
</head>
<body>
  <h1>RDish 画像管理</h1>
  <p class="hint">localhost限定ツール。dishes.json と public/images を直接書き換える。削除後は git diff で確認しコミットすること。</p>
  <input id="q" type="text" placeholder="料理IDまたは料理名で検索（例: consomme / コンソメ）" autofocus>
  <p id="sectionTitle" class="section-title">更新が新しい順</p>
  <div id="results"></div>
  <button id="moreBtn" class="more" style="display:none">もっと見る</button>

<script>
const q = document.getElementById('q')
const results = document.getElementById('results')
const sectionTitle = document.getElementById('sectionTitle')
const moreBtn = document.getElementById('moreBtn')
const RECENT_LIMIT = 50
let recentOffset = 0
let recentHasMore = false
let timer = null

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]))
}

function dishCard(dish) {
  const imgs = dish.images.map((src, i) => \`
    <div class="imgbox" data-src="\${esc(src)}">
      <img src="\${esc(src)}" loading="lazy" alt="">
      <div class="path">\${i + 1}. \${esc(src.split('/').pop())}</div>
      <button class="del" data-id="\${esc(dish.id)}" data-index="\${i + 1}">削除</button>
    </div>
  \`).join('')
  const updated = dish.updatedAt ? \`<span class="updated">\${esc(dish.updatedAt)}</span>\` : ''
  const summary = dish.summary ? \`<p class="summary">\${esc(dish.summary)}</p>\` : ''
  return \`
    <div class="dish" data-id="\${esc(dish.id)}">
      <h2>\${esc(dish.name)}</h2>
      <div class="id">\${esc(dish.id)}\${updated}</div>
      \${summary}
      <div class="images">\${imgs || '<span class="empty">画像なし</span>'}</div>
    </div>
  \`
}

function render(dishes, emptyText) {
  results.innerHTML = dishes.length
    ? dishes.map(dishCard).join('')
    : \`<p class="empty">\${emptyText}</p>\`
}

function appendResults(dishes) {
  results.insertAdjacentHTML('beforeend', dishes.map(dishCard).join(''))
}

function updateMoreButton() {
  moreBtn.style.display = recentHasMore ? 'block' : 'none'
  moreBtn.disabled = false
  moreBtn.textContent = 'もっと見る'
}

async function loadRecent() {
  sectionTitle.textContent = '更新が新しい順'
  recentOffset = 0
  const res = await fetch('/api/recent?limit=' + RECENT_LIMIT + '&offset=0')
  const data = await res.json()
  render(data.dishes, '料理がありません')
  recentOffset = data.dishes.length
  recentHasMore = data.hasMore
  updateMoreButton()
}

async function loadMoreRecent() {
  moreBtn.disabled = true
  moreBtn.textContent = '読み込み中...'
  const res = await fetch('/api/recent?limit=' + RECENT_LIMIT + '&offset=' + recentOffset)
  const data = await res.json()
  appendResults(data.dishes)
  recentOffset += data.dishes.length
  recentHasMore = data.hasMore
  updateMoreButton()
}

async function search() {
  const query = q.value.trim()
  if (!query) { loadRecent(); return }
  sectionTitle.textContent = '検索結果'
  moreBtn.style.display = 'none'
  const res = await fetch('/api/search?q=' + encodeURIComponent(query))
  render(await res.json(), '該当なし')
}

moreBtn.addEventListener('click', loadMoreRecent)

q.addEventListener('input', () => {
  clearTimeout(timer)
  timer = setTimeout(search, 200)
})

loadRecent()

results.addEventListener('click', async (e) => {
  const btn = e.target.closest('button.del')
  if (!btn) return
  const id = btn.dataset.id
  const index = Number(btn.dataset.index)
  const box = btn.closest('.imgbox')
  const src = box.dataset.src
  if (!confirm('削除する:\\n' + src)) return
  btn.disabled = true
  btn.textContent = '削除中...'
  const res = await fetch('/api/dishes/' + encodeURIComponent(id) + '/images/' + index, { method: 'DELETE' })
  if (res.ok) {
    box.remove()
  } else {
    btn.disabled = false
    btn.textContent = '削除'
    alert('削除失敗')
  }
})
</script>
</body>
</html>`

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`)

    if (req.method === 'GET' && url.pathname === '/') {
      sendHtml(res, PAGE)
      return
    }

    if (req.method === 'GET' && url.pathname === '/api/recent') {
      const limit = Number(url.searchParams.get('limit')) || 50
      const offset = Number(url.searchParams.get('offset')) || 0
      const dishes = loadDishes()
      const dates = loadDishDates()
      const sorted = [...dishes].sort((a, b) => {
        const da = dates[a.id] || ''
        const db = dates[b.id] || ''
        return db.localeCompare(da)
      })
      const page = sorted.slice(offset, offset + limit).map((d) => ({
        id: d.id,
        name: d.name,
        summary: d.summary ?? '',
        images: d.images ?? [],
        updatedAt: dates[d.id] ?? null,
      }))
      return sendJson(res, 200, {
        dishes: page,
        total: sorted.length,
        hasMore: offset + limit < sorted.length,
      })
    }

    if (req.method === 'GET' && url.pathname === '/api/search') {
      const q = (url.searchParams.get('q') || '').trim().toLowerCase()
      if (!q) return sendJson(res, 200, [])
      const dishes = loadDishes()
      const matched = dishes
        .filter((d) => d.id.toLowerCase().includes(q) || d.name.toLowerCase().includes(q))
        .slice(0, 30)
        .map((d) => ({ id: d.id, name: d.name, summary: d.summary ?? '', images: d.images ?? [] }))
      return sendJson(res, 200, matched)
    }

    if (req.method === 'DELETE' && url.pathname.startsWith('/api/dishes/')) {
      const parts = url.pathname.split('/').filter(Boolean) // api, dishes, :id, images, :n
      const dishId = decodeURIComponent(parts[2] ?? '')
      const index = Number(parts[4])
      const dishes = loadDishes()
      const dish = dishes.find((d) => d.id === dishId)
      if (!dish || !dish.images || !Number.isInteger(index) || index < 1 || index > dish.images.length) {
        return sendJson(res, 404, { error: 'not found' })
      }
      const [removed] = dish.images.splice(index - 1, 1)
      const filePath = join(PUBLIC_DIR, removed)
      if (existsSync(filePath)) unlinkSync(filePath)
      saveDishes(dishes)
      return sendJson(res, 200, { removed })
    }

    // 静的画像配信 (public/images/dishes/...)
    if (req.method === 'GET' && url.pathname.startsWith('/images/')) {
      const filePath = join(PUBLIC_DIR, url.pathname)
      if (!filePath.startsWith(join(PUBLIC_DIR, 'images')) || !existsSync(filePath)) {
        res.writeHead(404)
        res.end('not found')
        return
      }
      const ext = extname(filePath).toLowerCase()
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
      res.end(readFileSync(filePath))
      return
    }

    res.writeHead(404)
    res.end('not found')
  } catch (err) {
    console.error(err)
    sendJson(res, 500, { error: String(err) })
  }
})

server.listen(PORT, HOST, () => {
  console.log(`RDish admin tool: http://${HOST}:${PORT}`)
  console.log('localhost限定。Ctrl+Cで終了。')
})

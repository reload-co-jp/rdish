"use client"

import Link from "next/link"
import { CSSProperties, FC, useEffect, useMemo, useRef, useState } from "react"

type NetNode = {
  id: string
  name: string
  en: string
  cat: string
  grp: string
  country: string
  summary: string
  deg: number
  x: number
  y: number
}
type NetEdge = { a: number; b: number; d: string }
type NetGroup = { key: string; count: number }
type NetData = { groups: NetGroup[]; nodes: NetNode[]; edges: NetEdge[] }
type Adjacency = { j: number; diff: string }[][]

const GROUP_COLOR: Record<string, string> = {
  料理: "#2a78d6",
  ソース: "#eb6834",
  野菜: "#1baf7a",
  調理法: "#c98500",
  食材: "#e0568f",
  デザート: "#008300",
  チーズ: "#4a3aa7",
  その他: "#d1483f",
}
const INK = "#2d1f0e"
const INK_SOFT = "#7a6655"
const MUTED = "#a89080"
const HAIRLINE = "#e8ddd0"
const SURFACE = "#fffdf8"
const ACCENT = "#b45309"
const ACCENT_SOFT = "rgba(180, 83, 9, 0.12)"

function groupColor(g: string): string {
  return GROUP_COLOR[g] || GROUP_COLOR["その他"]
}

function nodeRadius(n: NetNode): number {
  return 2.2 + Math.sqrt(n.deg) * 1.15
}

function buildAdjacency(data: NetData | null): Adjacency {
  if (!data) return []
  const adj: Adjacency = Array.from({ length: data.nodes.length }, () => [])
  for (const e of data.edges) {
    adj[e.a].push({ j: e.b, diff: e.d })
    adj[e.b].push({ j: e.a, diff: e.d })
  }
  return adj
}

type View = { scale: number; x: number; y: number }

export const DishNetworkGraph: FC = () => {
  const [data, setData] = useState<NetData | null>(null)
  const [error, setError] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(-1)
  const [query, setQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeGroups, setActiveGroups] = useState<Set<string>>(new Set())

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const viewRef = useRef<View>({ scale: 1, x: 0, y: 0 })
  const hoveredRef = useRef(-1)
  const selectedRef = useRef(-1)
  const activeGroupsRef = useRef<Set<string>>(new Set())
  const searchHighlightRef = useRef<Set<number>>(new Set())
  const dirtyRef = useRef(true)
  const sizeRef = useRef({ w: 0, h: 0 })
  const animRef = useRef<number | null>(null)
  const dragRef = useRef({ dragging: false, moved: false, lastX: 0, lastY: 0 })
  const flyToRef = useRef<(i: number) => void>(() => {})

  const adj = useMemo(() => buildAdjacency(data), [data])

  // ---- load data ----
  useEffect(() => {
    let cancelled = false
    fetch("/data/dish-network.json")
      .then((r) => {
        if (!r.ok) throw new Error("failed")
        return r.json()
      })
      .then((json: NetData) => {
        if (cancelled) return
        setData(json)
        const groups = new Set(json.groups.map((g) => g.key))
        setActiveGroups(groups)
        activeGroupsRef.current = groups
      })
      .catch(() => !cancelled && setError(true))
    return () => {
      cancelled = true
    }
  }, [])

  // ---- canvas setup + render loop ----
  useEffect(() => {
    if (!data) return
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const nodes = data.nodes
    const edges = data.edges
    const N = nodes.length

    function resize() {
      const rect = wrap!.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      sizeRef.current = { w: rect.width, h: rect.height }
      canvas!.width = Math.round(rect.width * dpr)
      canvas!.height = Math.round(rect.height * dpr)
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      dirtyRef.current = true
    }
    function fitView() {
      const { w, h } = sizeRef.current
      viewRef.current = { scale: (Math.min(w, h) * 0.42) / 1000, x: w / 2, y: h / 2 }
    }

    function worldToScreen(px: number, py: number) {
      const v = viewRef.current
      return { x: px * v.scale + v.x, y: py * v.scale + v.y }
    }
    function screenToWorld(sx: number, sy: number) {
      const v = viewRef.current
      return { x: (sx - v.x) / v.scale, y: (sy - v.y) / v.scale }
    }
    function neighborsOf(i: number) {
      return adj[i].map((e) => e.j)
    }

    function draw() {
      dirtyRef.current = false
      const { w, h } = sizeRef.current
      ctx!.clearRect(0, 0, w, h)
      ctx!.fillStyle = SURFACE
      ctx!.fillRect(0, 0, w, h)

      const focus = selectedRef.current >= 0 ? selectedRef.current : hoveredRef.current
      const focusSet = focus >= 0 ? new Set([focus, ...neighborsOf(focus)]) : null
      const activeGroupsNow = activeGroupsRef.current
      const searchHighlight = searchHighlightRef.current

      ctx!.lineWidth = 1
      for (const e of edges) {
        const na = nodes[e.a],
          nb = nodes[e.b]
        if (!activeGroupsNow.has(na.grp) || !activeGroupsNow.has(nb.grp)) continue
        const isFocusEdge =
          !!focusSet && focusSet.has(e.a) && focusSet.has(e.b) && (e.a === focus || e.b === focus)
        if (focusSet && !isFocusEdge) continue
        const a = worldToScreen(na.x, na.y),
          b = worldToScreen(nb.x, nb.y)
        if (
          Math.max(a.x, b.x) < 0 ||
          Math.min(a.x, b.x) > w ||
          Math.max(a.y, b.y) < 0 ||
          Math.min(a.y, b.y) > h
        )
          continue
        ctx!.strokeStyle = isFocusEdge ? ACCENT : HAIRLINE
        ctx!.globalAlpha = isFocusEdge ? 0.9 : 0.7
        ctx!.beginPath()
        ctx!.moveTo(a.x, a.y)
        ctx!.lineTo(b.x, b.y)
        ctx!.stroke()
      }
      ctx!.globalAlpha = 1

      const showLabels = viewRef.current.scale > 2.2
      ctx!.textBaseline = "middle"
      ctx!.font = '600 11px "M PLUS Rounded 1c", sans-serif'
      const labelCandidates: {
        i: number
        p: { x: number; y: number }
        rr: number
        dimmed: boolean
        mustShow: boolean
        priority: number
      }[] = []

      for (let i = 0; i < N; i++) {
        const n = nodes[i]
        if (!activeGroupsNow.has(n.grp)) continue
        const dimmed = !!focusSet && !focusSet.has(i)
        const p = worldToScreen(n.x, n.y)
        if (p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20) continue
        const rr = Math.max(1.6, Math.min(nodeRadius(n) * viewRef.current.scale, 24))
        const isSearch = searchHighlight.has(i)
        ctx!.globalAlpha = dimmed ? 0.15 : 1
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, rr, 0, Math.PI * 2)
        ctx!.fillStyle = groupColor(n.grp)
        ctx!.fill()
        ctx!.lineWidth = isSearch ? 2.5 : 1
        ctx!.strokeStyle = isSearch ? ACCENT : "rgba(45,31,14,0.16)"
        ctx!.stroke()

        const isForced = i === focus || (!!focusSet && focusSet.has(i))
        if ((showLabels && rr > 3.2 && !dimmed) || isForced) {
          const isFocusNode = i === focus
          labelCandidates.push({
            i,
            p,
            rr,
            dimmed,
            mustShow: isFocusNode,
            priority: isFocusNode ? Infinity : rr,
          })
        }
      }
      ctx!.globalAlpha = 1

      labelCandidates.sort((a, b) => b.priority - a.priority)
      const cell = 13
      const occupied = new Set<string>()
      for (const c of labelCandidates) {
        const text = nodes[c.i].name
        const width = ctx!.measureText(text).width
        const x0 = c.p.x + c.rr + 4,
          y0 = c.p.y - 7
        const gx0 = Math.floor(x0 / cell),
          gx1 = Math.floor((x0 + width) / cell)
        const gy = Math.floor(y0 / cell)
        let blocked = false
        for (let gx = gx0; gx <= gx1 && !blocked; gx++) {
          if (occupied.has(gx + "," + gy)) blocked = true
        }
        if (blocked && !c.mustShow) continue
        for (let gx = gx0; gx <= gx1; gx++) occupied.add(gx + "," + gy)
        ctx!.globalAlpha = c.dimmed ? 0.5 : 1
        ctx!.fillStyle = INK
        ctx!.fillText(text, c.p.x + c.rr + 4, c.p.y)
      }
      ctx!.globalAlpha = 1
    }

    function loop() {
      if (dirtyRef.current) draw()
      animRef.current = requestAnimationFrame(loop)
    }

    function hitTest(mx: number, my: number): number {
      const w = screenToWorld(mx, my)
      let best = -1,
        bestD = Infinity
      for (let i = 0; i < N; i++) {
        const n = nodes[i]
        if (!activeGroupsRef.current.has(n.grp)) continue
        const dx = n.x - w.x,
          dy = n.y - w.y
        const d = dx * dx + dy * dy
        const rWorld = (nodeRadius(n) + 4) / viewRef.current.scale
        if (d < rWorld * rWorld && d < bestD) {
          bestD = d
          best = i
        }
      }
      return best
    }

    const tooltip = document.createElement("div")
    tooltip.style.cssText =
      "position:absolute;pointer-events:none;background:#2d1f0e;color:#fffdf8;padding:5px 9px;border-radius:6px;font-size:12px;font-weight:600;transform:translate(-50%,-130%);white-space:nowrap;display:none;z-index:15;"
    wrap.appendChild(tooltip)

    function showTooltip(n: NetNode, x: number, y: number) {
      tooltip.textContent = n.name
      tooltip.style.left = x + "px"
      tooltip.style.top = y + "px"
      tooltip.style.display = "block"
    }
    function hideTooltip() {
      tooltip.style.display = "none"
    }

    function onPointerDown(e: PointerEvent) {
      dragRef.current = { dragging: true, moved: false, lastX: e.clientX, lastY: e.clientY }
      canvas!.setPointerCapture(e.pointerId)
      canvas!.style.cursor = "grabbing"
    }
    function onPointerMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect()
      const mx = e.clientX - rect.left,
        my = e.clientY - rect.top
      const d = dragRef.current
      if (d.dragging) {
        const dx = e.clientX - d.lastX,
          dy = e.clientY - d.lastY
        if (Math.abs(dx) + Math.abs(dy) > 2) d.moved = true
        viewRef.current = { ...viewRef.current, x: viewRef.current.x + dx, y: viewRef.current.y + dy }
        d.lastX = e.clientX
        d.lastY = e.clientY
        dirtyRef.current = true
        hideTooltip()
        return
      }
      const best = hitTest(mx, my)
      if (best !== hoveredRef.current) {
        hoveredRef.current = best
        dirtyRef.current = true
      }
      if (best >= 0) showTooltip(nodes[best], mx, my)
      else hideTooltip()
    }
    function onPointerUp() {
      dragRef.current.dragging = false
      canvas!.style.cursor = "grab"
    }
    function onClick(e: MouseEvent) {
      if (dragRef.current.moved) return
      const rect = canvas!.getBoundingClientRect()
      const best = hitTest(e.clientX - rect.left, e.clientY - rect.top)
      if (best >= 0) selectNode(best)
      else setSelectedIdx(-1)
    }
    function onWheel(e: WheelEvent) {
      e.preventDefault()
      const rect = canvas!.getBoundingClientRect()
      const mx = e.clientX - rect.left,
        my = e.clientY - rect.top
      const before = screenToWorld(mx, my)
      const factor = Math.exp(-e.deltaY * 0.0015)
      const v = viewRef.current
      const newScale = Math.min(Math.max(v.scale * factor, 0.05), 12)
      const after = worldToScreen(before.x, before.y)
      viewRef.current = {
        scale: newScale,
        x: v.x + (mx - after.x),
        y: v.y + (my - after.y),
      }
      dirtyRef.current = true
      hideTooltip()
    }

    function flyTo(i: number) {
      const n = nodes[i]
      const { w, h } = sizeRef.current
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      const targetScale = Math.max(viewRef.current.scale, 1.6)
      const targetX = w / 2 - n.x * targetScale
      const targetY = h / 2 - n.y * targetScale
      if (reduceMotion) {
        viewRef.current = { scale: targetScale, x: targetX, y: targetY }
        dirtyRef.current = true
        return
      }
      const start = { ...viewRef.current }
      const t0 = performance.now()
      const dur = 500
      const step = (t: number) => {
        const p = Math.min((t - t0) / dur, 1)
        const ease = 1 - Math.pow(1 - p, 3)
        viewRef.current = {
          scale: start.scale + (targetScale - start.scale) * ease,
          x: start.x + (targetX - start.x) * ease,
          y: start.y + (targetY - start.y) * ease,
        }
        dirtyRef.current = true
        if (p < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }
    flyToRef.current = flyTo

    function selectNode(i: number) {
      setSelectedIdx(i)
      flyTo(i)
    }

    resize()
    fitView()
    canvas.addEventListener("pointerdown", onPointerDown)
    canvas.addEventListener("pointermove", onPointerMove)
    window.addEventListener("pointerup", onPointerUp)
    canvas.addEventListener("click", onClick)
    canvas.addEventListener("wheel", onWheel, { passive: false })
    window.addEventListener("resize", resize)
    animRef.current = requestAnimationFrame(loop)

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown)
      canvas.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", onPointerUp)
      canvas.removeEventListener("click", onClick)
      canvas.removeEventListener("wheel", onWheel)
      window.removeEventListener("resize", resize)
      if (animRef.current) cancelAnimationFrame(animRef.current)
      tooltip.remove()
    }
  }, [data, adj])

  // keep selectedRef in sync + trigger redraw
  useEffect(() => {
    selectedRef.current = selectedIdx
    dirtyRef.current = true
  }, [selectedIdx])

  useEffect(() => {
    activeGroupsRef.current = activeGroups
    dirtyRef.current = true
  }, [activeGroups])

  const flyToIdx = (i: number) => {
    flyToRef.current(i)
    setSelectedIdx(i)
  }

  // ---- search ----
  const matches = useMemo(() => {
    if (!data || !query.trim()) return []
    const ql = query.trim().toLowerCase()
    const out: number[] = []
    for (let i = 0; i < data.nodes.length; i++) {
      const n = data.nodes[i]
      if (
        n.name.toLowerCase().includes(ql) ||
        (n.en && n.en.toLowerCase().includes(ql)) ||
        n.id.includes(ql)
      ) {
        out.push(i)
        if (out.length >= 40) break
      }
    }
    return out
  }, [data, query])

  useEffect(() => {
    searchHighlightRef.current = new Set(matches)
    dirtyRef.current = true
  }, [matches])

  const toggleGroup = (key: string) => {
    setActiveGroups((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const selectedNode = data && selectedIdx >= 0 ? data.nodes[selectedIdx] : null
  const selectedNeighbors = useMemo(() => {
    if (!data || selectedIdx < 0) return []
    return adj[selectedIdx]
      .map((e) => ({ node: data.nodes[e.j], idx: e.j, diff: e.diff }))
      .sort((a, b) => a.node.name.localeCompare(b.node.name, "ja"))
  }, [data, adj, selectedIdx])

  if (error) {
    return (
      <p style={{ color: INK_SOFT, fontSize: "0.875rem" }}>
        データの読み込みに失敗した。再読み込みを試すこと。
      </p>
    )
  }

  return (
    <div
      style={{
        width: "100vw",
        marginLeft: "calc(50% - 50vw)",
        marginRight: "calc(50% - 50vw)",
      }}
    >
      <div style={styles.toolbar}>
        <div style={styles.searchWrap}>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSearchOpen(true)
            }}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
            placeholder="料理・食材・調理法を検索"
            aria-label="ネットワーク図内を検索"
            style={styles.searchInput}
          />
          {searchOpen && matches.length > 0 && (
            <div style={styles.searchResults}>
              {matches.slice(0, 8).map((i) => {
                const n = data!.nodes[i]
                return (
                  <button
                    key={n.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      flyToIdx(i)
                      setSearchOpen(false)
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = ACCENT_SOFT)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                    style={styles.searchResultButton}
                  >
                    <span style={{ ...styles.dot, background: groupColor(n.grp) }} />
                    <span>{n.name}</span>
                    <span style={styles.searchResultSub}>{n.en || n.cat}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
        <div style={styles.legend}>
          {data?.groups.map((g) => {
            const active = activeGroups.has(g.key)
            return (
              <button
                key={g.key}
                type="button"
                aria-pressed={active}
                onClick={() => toggleGroup(g.key)}
                style={{ ...styles.chip, opacity: active ? 1 : 0.4 }}
              >
                <span style={{ ...styles.dot, background: groupColor(g.key) }} />
                <span>{g.key}</span>
                <span style={{ color: MUTED }}>{g.count}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div style={styles.stage} ref={wrapRef}>
        {!data && <div style={styles.loading}>読み込み中…</div>}
        <canvas ref={canvasRef} style={styles.canvas} />

        {selectedNode && (
          <aside style={styles.panel}>
            <button
              type="button"
              aria-label="閉じる"
              onClick={() => setSelectedIdx(-1)}
              style={styles.panelClose}
            >
              ✕
            </button>
            <div style={styles.panelHead}>
              <span style={styles.panelCat}>
                <span style={{ ...styles.dot, background: groupColor(selectedNode.grp) }} />
                {selectedNode.cat}
              </span>
              <h2 style={styles.panelName}>{selectedNode.name}</h2>
              {selectedNode.en && <p style={styles.panelEn}>{selectedNode.en}</p>}
              {selectedNode.country && <p style={styles.panelCountry}>{selectedNode.country}</p>}
            </div>
            <div style={styles.panelBody}>
              <p style={styles.panelSummary}>
                {selectedNode.summary}
                {selectedNode.summary.length >= 100 ? "…" : ""}
              </p>
              <Link href={`/dishes/${selectedNode.id}/`} style={styles.panelLink}>
                辞典で詳しく見る →
              </Link>
              <h3 style={styles.panelH3}>似ている項目</h3>
              {selectedNeighbors.length === 0 ? (
                <p style={{ fontSize: "0.75rem", color: MUTED }}>登録された類似項目なし</p>
              ) : (
                <ul style={styles.simList}>
                  {selectedNeighbors.map(({ node, idx, diff }) => (
                    <li key={node.id}>
                      <button type="button" onClick={() => flyToIdx(idx)} style={styles.simButton}>
                        <span style={styles.simRow}>
                          <span style={{ ...styles.dot, background: groupColor(node.grp) }} />
                          <span style={styles.simName}>{node.name}</span>
                        </span>
                        {diff && <span style={styles.simDiff}>{diff}</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        )}
      </div>
      <p style={styles.hint}>ドラッグでパン・スクロールでズーム・クリックで詳細</p>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  toolbar: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "0.625rem",
    padding: "0.75rem 1rem",
    background: SURFACE,
    borderTop: `1px solid ${HAIRLINE}`,
    borderBottom: `1px solid ${HAIRLINE}`,
  },
  searchWrap: { position: "relative", flex: "0 1 260px", minWidth: "160px" },
  searchInput: {
    width: "100%",
    padding: "0.5rem 0.75rem",
    borderRadius: "0.375rem",
    border: `1px solid ${HAIRLINE}`,
    background: "#fff",
    color: INK,
    fontSize: "0.8125rem",
    fontFamily: "inherit",
  },
  searchResults: {
    position: "absolute",
    top: "calc(100% + 6px)",
    left: 0,
    right: 0,
    background: "#fff",
    border: `1px solid ${HAIRLINE}`,
    borderRadius: "0.625rem",
    boxShadow: "0 12px 28px rgba(45, 31, 14, 0.12)",
    maxHeight: "300px",
    overflowY: "auto",
    zIndex: 30,
  },
  searchResultButton: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    width: "100%",
    padding: "0.5rem 0.75rem",
    border: "none",
    background: "none",
    font: "inherit",
    fontSize: "0.8125rem",
    color: INK,
    textAlign: "left",
    cursor: "pointer",
  },
  searchResultSub: { marginLeft: "auto", color: MUTED, fontSize: "0.6875rem" },
  legend: { display: "flex", flexWrap: "wrap", gap: "0.375rem", flex: "1 1 auto" },
  chip: {
    display: "flex",
    alignItems: "center",
    gap: "0.375rem",
    padding: "0.3125rem 0.625rem",
    borderRadius: "999px",
    border: `1px solid ${HAIRLINE}`,
    background: "#fff",
    color: INK_SOFT,
    fontSize: "0.75rem",
    fontFamily: "inherit",
    cursor: "pointer",
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    flex: "0 0 auto",
    boxShadow: "0 0 0 1px rgba(45, 31, 14, 0.12) inset",
  },
  stage: { position: "relative", height: "min(72vh, 640px)", minHeight: "360px" },
  canvas: { display: "block", width: "100%", height: "100%", cursor: "grab" },
  loading: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: MUTED,
    fontSize: "0.875rem",
  },
  hint: { textAlign: "center", fontSize: "0.6875rem", color: MUTED, padding: "0.5rem 1rem 0" },
  panel: {
    position: "absolute",
    top: "12px",
    right: "12px",
    bottom: "12px",
    width: "320px",
    maxWidth: "calc(100% - 24px)",
    background: "#fff",
    border: `1px solid ${HAIRLINE}`,
    borderRadius: "0.875rem",
    boxShadow: "0 16px 36px rgba(45, 31, 14, 0.16)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  panelClose: {
    position: "absolute",
    top: "12px",
    right: "12px",
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    border: `1px solid ${HAIRLINE}`,
    background: SURFACE,
    color: INK_SOFT,
    fontSize: "13px",
    cursor: "pointer",
  },
  panelHead: { padding: "1rem 1.125rem 0.75rem", borderBottom: `1px solid ${HAIRLINE}` },
  panelCat: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.375rem",
    fontSize: "0.6875rem",
    color: INK_SOFT,
    padding: "0.1875rem 0.5625rem",
    borderRadius: "999px",
    background: SURFACE,
    border: `1px solid ${HAIRLINE}`,
    marginBottom: "0.5rem",
  },
  panelName: { fontSize: "1.1875rem", margin: "0 0 0.125rem", paddingRight: "1.75rem" },
  panelEn: { fontSize: "0.75rem", color: MUTED, margin: "0 0 0.125rem" },
  panelCountry: { fontSize: "0.6875rem", color: MUTED },
  panelBody: { padding: "0.875rem 1.125rem 1.125rem", overflowY: "auto", flex: "1 1 auto" },
  panelSummary: { fontSize: "0.8125rem", lineHeight: 1.75, color: INK_SOFT, margin: "0 0 0.75rem" },
  panelLink: {
    display: "inline-block",
    fontSize: "0.8125rem",
    color: ACCENT,
    textDecoration: "underline",
    marginBottom: "1rem",
  },
  panelH3: {
    fontSize: "0.6875rem",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: MUTED,
    margin: "0 0 0.625rem",
  },
  simList: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.125rem" },
  simButton: {
    display: "block",
    width: "100%",
    textAlign: "left",
    border: "none",
    background: "none",
    padding: "0.5625rem 0.5rem",
    borderRadius: "0.5rem",
    cursor: "pointer",
    font: "inherit",
    color: "inherit",
  },
  simRow: { display: "flex", alignItems: "center", gap: "0.4375rem" },
  simName: { fontSize: "0.8125rem", fontWeight: 700, color: INK },
  simDiff: { display: "block", fontSize: "0.75rem", color: MUTED, margin: "0.1875rem 0 0 0.875rem", lineHeight: 1.5 },
}

"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { Breadcrumb } from "../../components/elements/Breadcrumb"
import { DishCard } from "../../components/features/DishCard"
import { allDishes } from "../../lib/dishes"
import {
  reverseSearch,
  detectKeywordsInQuery,
  KeywordMatch,
} from "../../lib/reverseSearch"
import type { DishItem } from "../../types/dish"

const EXAMPLES = [
  "白くて中がとろっとしたチーズ",
  "緑色でブロッコリーみたいな渦巻きの野菜",
  "魚を揚げて酸っぱい液につけた料理",
  "スパイスで炊いた米料理",
  "にんにくオリーブオイルで煮た料理",
]

export default function ReversePage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<DishItem[]>([])
  const [keywords, setKeywords] = useState<KeywordMatch[]>([])
  const [searched, setSearched] = useState(false)

  const runSearch = (q: string) => {
    if (!q.trim()) return

    const kwMatches = detectKeywordsInQuery(allDishes, q)
    const kwDishes = kwMatches.map((m) => m.dish)
    const revResults = reverseSearch(allDishes, q)

    // merge: keyword matches + reverse results, deduped
    const seen = new Set<string>()
    const merged: DishItem[] = []
    for (const d of [...kwDishes, ...revResults]) {
      if (!seen.has(d.id)) {
        seen.add(d.id)
        merged.push(d)
      }
    }

    setKeywords(kwMatches)
    setResults(merged)
    setSearched(true)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    runSearch(query)
  }

  const handleExampleClick = (ex: string) => {
    setQuery(ex)
    runSearch(ex)
  }

  return (
    <div>
      <Breadcrumb items={[{ label: "逆引き検索", href: "/reverse/" }]} />
      <h1
        style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}
      >
        逆引き検索
      </h1>
      <p
        style={{
          color: "var(--c-text-sub)",
          fontSize: "0.875rem",
          marginBottom: "0.75rem",
        }}
      >
        料理名がわからないとき、見た目・味・特徴から探す。
      </p>
      <p style={{ marginBottom: "1.5rem" }}>
        <Link
          href="/reverse/k/"
          style={{
            color: "var(--c-accent)",
            fontSize: "0.875rem",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          苦手なもの・アレルギーから探す →
        </Link>
        <Link
          href="/reverse/kw/"
          style={{
            color: "var(--c-accent)",
            display: "block",
            fontSize: "0.875rem",
            fontWeight: 600,
            marginTop: "0.375rem",
            textDecoration: "none",
          }}
        >
          特徴で比べる料理グループ →
        </Link>
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="白くてとろっとしたチーズ..."
          aria-label="特徴を入力して料理を検索"
          style={{
            flex: 1,
            background: "var(--c-bg)",
            border: "1px solid var(--c-border)",
            borderRadius: "var(--radius)",
            color: "var(--c-text)",
            fontSize: "1rem",
            padding: "0.625rem 0.75rem",
            outline: "none",
          }}
        />
        <button
          type="submit"
          style={{
            background: "var(--c-accent)",
            border: "none",
            borderRadius: "var(--radius)",
            color: "#fff",
            cursor: "pointer",
            fontSize: "1rem",
            padding: "0.625rem 1rem",
            whiteSpace: "nowrap",
          }}
        >
          検索
        </button>
      </form>

      {searched && keywords.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.375rem",
            marginBottom: "1.25rem",
            padding: "0.625rem 0.75rem",
            background: "var(--c-tint)",
            border: "1px solid var(--c-border)",
            borderRadius: "var(--radius)",
          }}
        >
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--c-text-sub)",
              alignSelf: "center",
              marginRight: "0.25rem",
            }}
          >
            検出キーワード:
          </span>
          {keywords.map(({ dish, term }) => (
            <Link
              key={dish.id}
              href={`/dishes/${dish.id}/`}
              style={{
                fontSize: "0.75rem",
                background: "var(--c-tint)",
                color: "var(--c-accent)",
                border: "1px solid var(--c-border)",
                borderRadius: "9999px",
                padding: "0.125rem 0.625rem",
                textDecoration: "none",
              }}
            >
              {term}
            </Link>
          ))}
        </div>
      )}

      <div style={{ marginBottom: "1.5rem" }}>
        <p
          style={{
            color: "var(--c-text-sub)",
            fontSize: "0.75rem",
            marginBottom: "0.5rem",
          }}
        >
          例:
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => handleExampleClick(ex)}
              style={{
                background: "var(--c-tint)",
                border: "1px solid var(--c-border)",
                borderRadius: "9999px",
                color: "var(--c-text-2)",
                cursor: "pointer",
                fontSize: "0.75rem",
                padding: "0.25rem 0.75rem",
              }}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {searched && (
        <div>
          <p
            style={{
              color: "var(--c-text-sub)",
              fontSize: "0.875rem",
              marginBottom: "1rem",
            }}
          >
            {results.length > 0
              ? `${results.length}件見つかりました`
              : "見つかりませんでした。別の言葉で試してみてください。"}
          </p>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {results.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

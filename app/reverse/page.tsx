"use client"

import { FormEvent, useState } from "react"
import { DishCard } from "../../components/features/DishCard"
import dishes from "../../data/dishes.json"
import { reverseSearch } from "../../lib/reverseSearch"
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
  const [searched, setSearched] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setResults(reverseSearch(dishes as DishItem[], query))
    setSearched(true)
  }

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>
        逆引き検索
      </h1>
      <p style={{ color: "#aaa", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
        料理名がわからないとき、見た目・味・特徴から探す。
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="白くてとろっとしたチーズ..."
          aria-label="特徴を入力して料理を検索"
          style={{
            flex: 1,
            background: "#fffdf8",
            border: "1px solid #e8ddd0",
            borderRadius: "0.375rem",
            color: "#2d1f0e",
            fontSize: "1rem",
            padding: "0.625rem 0.75rem",
            outline: "none",
          }}
        />
        <button
          type="submit"
          style={{
            background: "#b45309",
            border: "none",
            borderRadius: "0.375rem",
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

      <div style={{ marginBottom: "1.5rem" }}>
        <p style={{ color: "#666", fontSize: "0.75rem", marginBottom: "0.5rem" }}>
          例:
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => setQuery(ex)}
              style={{
                background: "#f0e6d6",
                border: "1px solid #e8ddd0",
                borderRadius: "9999px",
                color: "#7a6655",
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
          <p style={{ color: "#aaa", fontSize: "0.875rem", marginBottom: "1rem" }}>
            {results.length > 0
              ? `${results.length}件見つかりました`
              : "見つかりませんでした。別の言葉で試してみてください。"}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {results.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

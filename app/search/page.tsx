"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { DishCard } from "../../components/features/DishCard"
import { SearchBox } from "../../components/features/SearchBox"
import { TagList } from "../../components/features/TagList"
import dishes from "../../data/dishes.json"
import { searchDishes } from "../../lib/search"
import type { DishItem } from "../../types/dish"

const allDishes = dishes as DishItem[]
const allTags = [...new Set(allDishes.flatMap((d) => d.tags))].sort()

function SearchResults() {
  const searchParams = useSearchParams()
  const q = searchParams.get("q") ?? ""
  const tag = searchParams.get("tag") ?? ""

  let results: DishItem[] = []
  if (q) {
    results = searchDishes(allDishes, q)
  } else if (tag) {
    results = allDishes.filter((d) => d.tags.includes(tag))
  }

  return (
    <>
      <div style={{ marginBottom: "1.5rem" }}>
        <SearchBox initialQuery={q} />
      </div>

      {(q || tag) && (
        <p style={{ color: "#aaa", fontSize: "0.875rem", marginBottom: "1rem" }}>
          {q ? `「${q}」` : `タグ: ${tag}`} — {results.length}件
        </p>
      )}

      {results.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
          {results.map((dish) => (
            <DishCard key={dish.id} dish={dish} />
          ))}
        </div>
      ) : (q || tag) ? (
        <p style={{ color: "#666", marginBottom: "2rem" }}>見つかりませんでした。</p>
      ) : null}

      <section>
        <h2 style={{ fontSize: "0.75rem", color: "#888", marginBottom: "0.75rem", fontWeight: 600 }}>
          タグで絞り込む
        </h2>
        <TagList tags={allTags} />
      </section>
    </>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<p style={{ color: "#aaa" }}>読み込み中...</p>}>
      <SearchResults />
    </Suspense>
  )
}

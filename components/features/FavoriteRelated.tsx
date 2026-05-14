"use client"

import { FC, useSyncExternalStore } from "react"
import { getFavorites, subscribeFavorites } from "../../lib/storage"
import type { DishItem } from "../../types/dish"
import { DishCard } from "./DishCard"

type Props = {
  allDishes: DishItem[]
}

const EMPTY_FAVORITES: string[] = []

export const FavoriteRelated: FC<Props> = ({ allDishes }) => {
  const favoriteIds = useSyncExternalStore(
    subscribeFavorites,
    getFavorites,
    () => EMPTY_FAVORITES,
  )

  if (favoriteIds.length === 0) return null

  const favSet = new Set(favoriteIds)
  const relatedIds: string[] = []
  const seen = new Set<string>()

  for (const id of favoriteIds) {
    const dish = allDishes.find((d) => d.id === id)
    if (!dish) continue
    for (const relId of dish.relatedIds) {
      if (!favSet.has(relId) && !seen.has(relId)) {
        seen.add(relId)
        relatedIds.push(relId)
      }
    }
  }

  const related = relatedIds
    .map((id) => allDishes.find((d) => d.id === id))
    .filter(Boolean)
    .slice(0, 6) as DishItem[]

  if (related.length === 0) return null

  return (
    <section style={{ marginBottom: "2rem" }}>
      <h2 style={{ fontSize: "0.875rem", color: "#aaa", marginBottom: "1rem", fontWeight: 600 }}>
        お気に入りから関連する料理
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {related.map((dish) => (
          <DishCard key={dish.id} dish={dish} />
        ))}
      </div>
    </section>
  )
}

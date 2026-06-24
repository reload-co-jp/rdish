"use client"

import { useMemo, useSyncExternalStore } from "react"
import { Breadcrumb } from "../../components/elements/Breadcrumb"
import { DishCard } from "../../components/features/DishCard"
import { allDishes } from "../../lib/dishes"
import { getFavorites, subscribeFavorites } from "../../lib/storage"
import type { DishItem } from "../../types/dish"

const getFavoritesSnapshot = () => JSON.stringify(getFavorites())

export default function FavoritesPage() {
  const favIds = useSyncExternalStore(subscribeFavorites, getFavoritesSnapshot, () => "[]")
  const favDishes = useMemo(() => {
    const ids = JSON.parse(favIds) as string[]
    return ids.map((id) => allDishes.find((d) => d.id === id)).filter(Boolean) as DishItem[]
  }, [favIds])

  return (
    <div>
      <Breadcrumb items={[{ label: "お気に入り", href: "/favorites/" }]} />
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "1.5rem" }}>
        お気に入り
      </h1>
      {favDishes.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {favDishes.map((dish) => (
            <DishCard key={dish.id} dish={dish} />
          ))}
        </div>
      ) : (
        <p style={{ color: "#666" }}>
          お気に入りに登録した料理がここに表示されます。<br />
          料理の詳細ページで「お気に入り」ボタンを押して登録できます。
        </p>
      )}
    </div>
  )
}

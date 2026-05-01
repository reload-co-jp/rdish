"use client"

import { useEffect, useState } from "react"
import { Breadcrumb } from "../../components/elements/Breadcrumb"
import { DishCard } from "../../components/features/DishCard"
import dishes from "../../data/dishes.json"
import { getFavorites } from "../../lib/storage"
import type { DishItem } from "../../types/dish"

export default function FavoritesPage() {
  const [favDishes, setFavDishes] = useState<DishItem[]>([])

  useEffect(() => {
    const ids = getFavorites()
    const all = dishes as DishItem[]
    setFavDishes(ids.map((id) => all.find((d) => d.id === id)).filter(Boolean) as DishItem[])
  }, [])

  return (
    <div>
      <Breadcrumb items={[{ label: "お気に入り" }]} />
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
          料理の詳細ページで「♡ お気に入り」ボタンを押して登録できます。
        </p>
      )}
    </div>
  )
}

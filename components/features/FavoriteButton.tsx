"use client"

import { FC, useSyncExternalStore } from "react"
import { isFavorite, subscribeFavorites, toggleFavorite } from "../../lib/storage"

type Props = {
  id: string
}

export const FavoriteButton: FC<Props> = ({ id }) => {
  const fav = useSyncExternalStore(
    subscribeFavorites,
    () => isFavorite(id),
    () => false,
  )

  const handleClick = () => {
    toggleFavorite(id)
  }

  return (
    <button
      onClick={handleClick}
      aria-label={fav ? "お気に入り解除" : "お気に入り登録"}
      style={{
        background: fav ? "#dc2626" : "#f0e6d6",
        color: fav ? "#fff" : "#7a4f2a",
        border: "none",
        borderRadius: "0.375rem",
        cursor: "pointer",
        fontSize: "0.875rem",
        padding: "0.5rem 1rem",
        transition: "background 0.15s",
      }}
    >
      {fav ? "お気に入り済み" : "お気に入り"}
    </button>
  )
}

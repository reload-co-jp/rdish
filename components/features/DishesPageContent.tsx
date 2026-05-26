import Link from "next/link"
import { FC } from "react"
import { DishCard } from "./DishCard"
import type { DishItem } from "../../types/dish"

export const PAGE_SIZE = 30

export function paginateDishes(allDishes: DishItem[], page: number) {
  const start = (page - 1) * PAGE_SIZE
  return allDishes.slice(start, start + PAGE_SIZE)
}

export function totalPages(count: number) {
  return Math.ceil(count / PAGE_SIZE)
}

export function pageUrl(page: number) {
  return page === 1 ? "/dishes/" : `/dishes/p/${page}/`
}

const Pagination: FC<{ current: number; total: number }> = ({ current, total }) => (
  <nav
    aria-label="ページネーション"
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "0.5rem",
      marginTop: "2rem",
      flexWrap: "wrap",
    }}
  >
    {current > 1 && (
      <Link
        href={pageUrl(current - 1)}
        style={{
          padding: "0.375rem 0.75rem",
          border: "1px solid #e8ddd0",
          borderRadius: "0.25rem",
          color: "#7a6655",
          textDecoration: "none",
          fontSize: "0.875rem",
        }}
      >
        ← 前へ
      </Link>
    )}
    <span style={{ fontSize: "0.875rem", color: "#a89080" }}>
      {current} / {total}
    </span>
    {current < total && (
      <Link
        href={pageUrl(current + 1)}
        style={{
          padding: "0.375rem 0.75rem",
          border: "1px solid #e8ddd0",
          borderRadius: "0.25rem",
          color: "#7a6655",
          textDecoration: "none",
          fontSize: "0.875rem",
        }}
      >
        次へ →
      </Link>
    )}
  </nav>
)

type Props = {
  dishes: DishItem[]
  page: number
  totalCount: number
  offset: number
}

export const DishesPageContent: FC<Props> = ({ dishes, page, totalCount, offset }) => {
  const total = totalPages(totalCount)
  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {dishes.map((dish, index) => (
          <div key={dish.id} style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                top: "0.75rem",
                right: "0.75rem",
                zIndex: 1,
                color: "#a89080",
                fontSize: "0.7rem",
                fontWeight: 700,
                background: "#fffdf8",
                border: "1px solid #e8ddd0",
                borderRadius: "0.25rem",
                padding: "0.125rem 0.375rem",
              }}
            >
              #{offset + index + 1}
            </div>
            <DishCard dish={dish} />
          </div>
        ))}
      </div>
      <Pagination current={page} total={total} />
    </div>
  )
}

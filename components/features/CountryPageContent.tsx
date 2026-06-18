import Link from "next/link"
import { FC } from "react"
import { DishCard } from "./DishCard"
import type { DishItem } from "../../types/dish"

export const COUNTRY_PAGE_SIZE = 30

export function paginateCountryDishes(results: DishItem[], page: number) {
  const start = (page - 1) * COUNTRY_PAGE_SIZE
  return results.slice(start, start + COUNTRY_PAGE_SIZE)
}

export function countryTotalPages(count: number) {
  return Math.max(Math.ceil(count / COUNTRY_PAGE_SIZE), 1)
}

export function countryPageUrl(countryId: string, page: number) {
  return page === 1 ? `/countries/${countryId}/` : `/countries/${countryId}/p/${page}/`
}

const Pagination: FC<{ countryId: string; current: number; total: number }> = ({
  countryId,
  current,
  total,
}) => {
  if (total <= 1) return null
  return (
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
          href={countryPageUrl(countryId, current - 1)}
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
          href={countryPageUrl(countryId, current + 1)}
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
}

type Props = {
  countryId: string
  dishes: DishItem[]
  page: number
  totalCount: number
  offset: number
}

export const CountryPageContent: FC<Props> = ({ countryId, dishes, page, totalCount, offset }) => {
  const total = countryTotalPages(totalCount)
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
      <Pagination countryId={countryId} current={page} total={total} />
    </div>
  )
}

import Link from "next/link"
import { FC, Fragment } from "react"
import { DishCard } from "./DishCard"
import { AD_INTERVAL } from "./DishesPageContent"
import { InArticleAd } from "../elements/AdSense"
import { paginate, totalPages } from "../../lib/pagination"
import type { DishItem } from "../../types/dish"

export const COUNTRY_PAGE_SIZE = 30

export function paginateCountryDishes(results: DishItem[], page: number) {
  return paginate(results, page, COUNTRY_PAGE_SIZE)
}

export function countryTotalPages(count: number) {
  return totalPages(count, COUNTRY_PAGE_SIZE, 1)
}

export function countryPageUrl(countryId: string, page: number) {
  return page === 1
    ? `/countries/${countryId}/`
    : `/countries/${countryId}/p/${page}/`
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
            border: "1px solid var(--c-border)",
            borderRadius: "var(--radius)",
            color: "var(--c-text-2)",
            textDecoration: "none",
            fontSize: "0.875rem",
          }}
        >
          ← 前へ
        </Link>
      )}
      <span style={{ fontSize: "0.875rem", color: "var(--c-text-sub)" }}>
        {current} / {total}
      </span>
      {current < total && (
        <Link
          href={countryPageUrl(countryId, current + 1)}
          style={{
            padding: "0.375rem 0.75rem",
            border: "1px solid var(--c-border)",
            borderRadius: "var(--radius)",
            color: "var(--c-text-2)",
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

export const CountryPageContent: FC<Props> = ({
  countryId,
  dishes,
  page,
  totalCount,
  offset,
}) => {
  const total = countryTotalPages(totalCount)
  return (
    <div>
      <div className="dish-list">
        {dishes.map((dish, index) => (
          <Fragment key={dish.id}>
            {index > 0 && index % AD_INTERVAL === 0 && <InArticleAd />}
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  bottom: "var(--sp-6)",
                  right: 0,
                  color: "var(--c-text-sub)",
                  fontFamily: "var(--font-serif)",
                  fontSize: "var(--fs-sm)",
                }}
              >
                #{offset + index + 1}
              </div>
              <DishCard dish={dish} />
            </div>
          </Fragment>
        ))}
      </div>
      <Pagination countryId={countryId} current={page} total={total} />
    </div>
  )
}

import Link from "next/link"
import { FC } from "react"
import {
  COMPARE_PAGE_SIZE,
  Comparison,
  comparePageUrl,
  comparisonPath,
} from "../../lib/comparisons"
import { paginate, totalPages as totalPagesOf } from "../../lib/pagination"

export function paginateComparisons(comparisons: Comparison[], page: number) {
  return paginate(comparisons, page, COMPARE_PAGE_SIZE)
}

export function totalPages(count: number) {
  return totalPagesOf(count, COMPARE_PAGE_SIZE)
}

const Pagination: FC<{ current: number; total: number }> = ({
  current,
  total,
}) => (
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
        href={comparePageUrl(current - 1)}
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
        href={comparePageUrl(current + 1)}
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
  comparisons: Comparison[]
  page: number
  totalCount: number
}

export const ComparisonsPageContent: FC<Props> = ({
  comparisons,
  page,
  totalCount,
}) => (
  <div>
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {comparisons.map((comparison) => (
        <Link
          key={comparison.slug}
          href={comparisonPath(comparison.slug)}
          style={{
            background: "#fffdf8",
            border: "1px solid #e8ddd0",
            borderRadius: "0.5rem",
            color: "inherit",
            display: "block",
            padding: "0.75rem 0.875rem",
            textDecoration: "none",
          }}
        >
          <span
            style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#2d1f0e" }}
          >
            {comparison.a.name} と {comparison.b.name} の違い
          </span>
          <span
            style={{
              display: "block",
              color: "#a89080",
              fontSize: "0.75rem",
              marginTop: "0.125rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {comparison.aDifference}
          </span>
        </Link>
      ))}
    </div>
    <Pagination current={page} total={totalPages(totalCount)} />
  </div>
)

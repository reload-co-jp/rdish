import Link from "next/link"
import type { ReactNode } from "react"
import { extractSearchTerms } from "./dishTerms"
import type { DishItem } from "../types/dish"

type TermIndex = { map: Map<string, string[]>; regex: RegExp | null } // term → dish ids

// 正規表現（1万語超）のコンパイルは高コスト → dishes 配列ごとに1回だけ構築
const termIndexCache = new WeakMap<DishItem[], TermIndex>()

function getTermIndex(dishes: DishItem[]): TermIndex {
  const cached = termIndexCache.get(dishes)
  if (cached) return cached
  const map = new Map<string, string[]>()
  for (const dish of dishes) {
    for (const term of extractSearchTerms(dish)) {
      const ids = map.get(term)
      if (ids) ids.push(dish.id)
      else map.set(term, [dish.id])
    }
  }
  const terms = [...map.keys()].sort((a, b) => b.length - a.length)
  const regex = terms.length
    ? new RegExp(`(${terms.map(escapeRe).join("|")})`, "g")
    : null
  const index = { map, regex }
  termIndexCache.set(dishes, index)
  return index
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export function linkifyText(
  text: string,
  dishes: DishItem[],
  currentId: string,
  linkStyle?: React.CSSProperties
): ReactNode[] {
  const { map, regex } = getTermIndex(dishes)
  if (!regex) return [text]

  const parts = text.split(regex)

  return parts.map((part, i) => {
    const dishId = map.get(part)?.find((id) => id !== currentId)
    if (!dishId) return part
    return (
      <Link
        key={i}
        href={`/dishes/${dishId}/`}
        style={{
          color: "var(--c-accent)",
          textDecoration: "none",
          borderBottom:
            "1px solid color-mix(in srgb, var(--c-accent) 35%, transparent)",
          ...linkStyle,
        }}
      >
        {part}
      </Link>
    )
  })
}

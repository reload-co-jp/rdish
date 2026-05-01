import Link from "next/link"
import type { ReactNode } from "react"
import type { DishItem } from "../types/dish"

type TermMap = Map<string, string> // term → dish id

function buildTermMap(dishes: DishItem[], currentId: string): TermMap {
  const map: TermMap = new Map()
  for (const dish of dishes) {
    if (dish.id === currentId) continue
    const terms = [
      dish.name,
      dish.kana,
      dish.englishName,
      dish.originalName,
      ...(dish.aliases ?? []),
    ].filter((t): t is string => !!t && t.length >= 3)
    for (const term of terms) {
      if (!map.has(term)) map.set(term, dish.id)
    }
  }
  return map
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
  const map = buildTermMap(dishes, currentId)
  if (map.size === 0) return [text]

  const terms = [...map.keys()].sort((a, b) => b.length - a.length)
  const pattern = terms.map(escapeRe).join("|")
  const regex = new RegExp(`(${pattern})`, "g")

  const parts = text.split(regex)

  return parts.map((part, i) => {
    const dishId = map.get(part)
    if (!dishId) return part
    return (
      <Link
        key={i}
        href={`/dishes/${dishId}/`}
        style={{
          color: "#b45309",
          textDecoration: "none",
          borderBottom: "1px dotted #f5c97a",
          ...linkStyle,
        }}
      >
        {part}
      </Link>
    )
  })
}

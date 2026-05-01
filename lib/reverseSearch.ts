import type { DishItem } from "../types/dish"
import { normalize } from "./normalize"

export function reverseSearch(dishes: DishItem[], query: string): DishItem[] {
  if (!query.trim()) return []
  const words = query.trim().split(/\s+/).map(normalize).filter(Boolean)

  const scored = dishes.map((item) => {
    let score = 0
    const targets = [
      ...item.reverseKeywords,
      ...item.tags,
      item.summary,
      item.menuDescription,
      ...item.tasteAndTexture,
      ...item.whatComesOut,
    ].map(normalize)

    for (const word of words) {
      for (const target of targets) {
        if (target.includes(word)) score += 1
      }
    }

    return { item, score }
  })

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((s) => s.item)
}

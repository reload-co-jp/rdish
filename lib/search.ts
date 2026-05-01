import type { DishItem } from "../types/dish"
import { normalize } from "./normalize"

type ScoredItem = { item: DishItem; score: number }

export function searchDishes(dishes: DishItem[], query: string): DishItem[] {
  if (!query.trim()) return []
  const q = normalize(query)

  const scored: ScoredItem[] = dishes.map((item) => {
    let score = 0
    const name = normalize(item.name)
    const kana = normalize(item.kana ?? "")
    const english = normalize(item.englishName ?? "")
    const original = normalize(item.originalName ?? "")
    const aliases = (item.aliases ?? []).map(normalize)
    const summary = normalize(item.summary)
    const tags = item.tags.map(normalize)
    const reverseKeywords = item.reverseKeywords.map(normalize)

    if (name === q) score += 100
    else if (name.startsWith(q)) score += 80
    else if (name.includes(q)) score += 60

    if (aliases.some((a) => a === q)) score += 70
    else if (aliases.some((a) => a.includes(q))) score += 50

    if (kana.includes(q)) score += 60
    if (english.includes(q)) score += 50
    if (original.includes(q)) score += 50

    if (tags.some((t) => t.includes(q))) score += 40
    if (summary.includes(q)) score += 20
    if (reverseKeywords.some((k) => k.includes(q))) score += 20

    return { item, score }
  })

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.item)
}

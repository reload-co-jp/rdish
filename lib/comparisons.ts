import type { DishItem } from "../types/dish"
import { allDishes } from "./dishes"

// similarItems[].difference を使った「AとBの違い」比較ページ。
// 片側にしか説明がない組み合わせは内容が薄くなるため、双方向に説明が
// 揃っていて、かつ共通タグを持つ（比較の文脈が成立する）ペアだけを採用する。
export type Comparison = {
  slug: string
  a: DishItem
  b: DishItem
  // a から見た b との違い / b から見た a との違い
  aDifference: string
  bDifference: string
  sharedTags: string[]
}

const dishById = new Map(allDishes.map((dish) => [dish.id, dish]))

function differenceBetween(from: DishItem, toId: string): string | undefined {
  return from.similarItems.find((s) => s.id === toId && s.difference)
    ?.difference
}

function buildComparisons(): Comparison[] {
  const seen = new Set<string>()
  const comparisons: Comparison[] = []

  for (const dish of allDishes) {
    for (const similar of dish.similarItems) {
      if (!similar.id) continue
      const other = dishById.get(similar.id)
      if (!other || other.id === dish.id) continue

      const [a, b] = dish.id < other.id ? [dish, other] : [other, dish]
      const slug = comparisonSlug(a.id, b.id)
      if (seen.has(slug)) continue

      const aDifference = differenceBetween(a, b.id)
      const bDifference = differenceBetween(b, a.id)
      if (!aDifference || !bDifference) continue

      const sharedTags = a.tags.filter((tag) => b.tags.includes(tag))
      if (sharedTags.length === 0) continue

      seen.add(slug)
      comparisons.push({ slug, a, b, aDifference, bDifference, sharedTags })
    }
  }

  return comparisons.sort((x, y) => x.slug.localeCompare(y.slug))
}

export function comparisonSlug(aId: string, bId: string): string {
  const [first, second] = aId < bId ? [aId, bId] : [bId, aId]
  return `${first}-vs-${second}`
}

export const allComparisons: Comparison[] = buildComparisons()

const comparisonBySlugMap = new Map(allComparisons.map((c) => [c.slug, c]))

export function comparisonPath(slug: string): string {
  return `/compare/${slug}/`
}

export function comparisonBySlug(slug: string): Comparison | undefined {
  return comparisonBySlugMap.get(slug)
}

const comparisonsByDishId = new Map<string, Comparison[]>()
for (const comparison of allComparisons) {
  for (const dish of [comparison.a, comparison.b]) {
    const list = comparisonsByDishId.get(dish.id)
    if (list) list.push(comparison)
    else comparisonsByDishId.set(dish.id, [comparison])
  }
}

export function comparisonsForDish(dishId: string): Comparison[] {
  return comparisonsByDishId.get(dishId) ?? []
}

// 比較ページ内で「相手側」を取り出すヘルパ
export function counterpart(comparison: Comparison, dishId: string): DishItem {
  return comparison.a.id === dishId ? comparison.b : comparison.a
}

export function comparisonTitle(comparison: Comparison): string {
  return `${comparison.a.name}と${comparison.b.name}の違い`
}

export const COMPARE_PAGE_SIZE = 60

export function comparePageUrl(page: number): string {
  return page <= 1 ? "/compare/" : `/compare/p/${page}/`
}

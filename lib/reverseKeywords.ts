import { createHash } from "node:crypto"
import type { DishItem } from "../types/dish"
import { allDishes } from "./dishes"

// 同じreverseKeyword(=この料理が苦手な人が好むもの)を持つ料理群。
// 比較する意味がある3件以上のキーワードだけページ化する。
const MIN_DISHES = 3

export type ReverseKeywordGroup = {
  slug: string
  keyword: string
  dishes: DishItem[]
}

// 日本語キーワードをURLに出さず、データの並び替えでも変わらない短いslugにする
const slugFor = (keyword: string) =>
  createHash("md5").update(keyword).digest("hex").slice(0, 10)

const byKeyword = new Map<string, DishItem[]>()
for (const dish of allDishes) {
  for (const keyword of new Set(dish.reverseKeywords)) {
    const list = byKeyword.get(keyword) ?? []
    list.push(dish)
    byKeyword.set(keyword, list)
  }
}

export const reverseKeywordGroups: ReverseKeywordGroup[] = [...byKeyword]
  .filter(([, dishes]) => dishes.length >= MIN_DISHES)
  .map(([keyword, dishes]) => ({ slug: slugFor(keyword), keyword, dishes }))
  .sort((a, b) => b.dishes.length - a.dishes.length)

const groupBySlug = new Map(reverseKeywordGroups.map((g) => [g.slug, g]))
const groupByKeyword = new Map(reverseKeywordGroups.map((g) => [g.keyword, g]))

export const reverseKeywordGroupBySlug = (slug: string) => groupBySlug.get(slug)
export const reverseKeywordGroupByKeyword = (keyword: string) =>
  groupByKeyword.get(keyword)

export const reverseKeywordPath = (slug: string) => `/reverse/kw/${slug}/`

// グループ内で多く共有されているタグ(=グループの共通の特徴)
export function sharedTags(dishes: DishItem[], limit = 6) {
  const counts = new Map<string, number>()
  for (const dish of dishes) {
    for (const tag of dish.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  return [...counts]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }))
}

// keywordそのものをタグ・説明に持つ料理(=グループと反対の持ち味)
export function dishesMatchingKeyword(keyword: string, limit = 6) {
  return allDishes
    .filter(
      (dish) =>
        !dish.reverseKeywords.includes(keyword) &&
        (dish.tags.includes(keyword) || dish.tasteAndTexture.some((t) => t.includes(keyword)))
    )
    .sort((a, b) => b.beginnerFriendlyScore - a.beginnerFriendlyScore)
    .slice(0, limit)
}

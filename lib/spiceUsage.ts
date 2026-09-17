import type { DishItem } from "../types/dish"

// 名前がテキスト中の別カタカナ語の一部（例:「クラッカー」中の「カー」）に
// 誤ってマッチしないよう、前後が拗音・促音・長音符でないことを要求する
const CONTINUATION_KANA = new Set([
  "ッ",
  "ー",
  "ャ",
  "ュ",
  "ョ",
  "ァ",
  "ィ",
  "ゥ",
  "ェ",
  "ォ",
])

const MIN_TERM_LENGTH = 3

function isBoundaryMatch(text: string, index: number, length: number) {
  const before = text[index - 1]
  const after = text[index + length]
  if (before && CONTINUATION_KANA.has(before)) return false
  if (after && CONTINUATION_KANA.has(after)) return false
  return true
}

function textContainsTerm(text: string, term: string) {
  let index = text.indexOf(term)
  while (index !== -1) {
    if (isBoundaryMatch(text, index, term.length)) return true
    index = text.indexOf(term, index + 1)
  }
  return false
}

function dishSearchText(dish: DishItem) {
  return [
    dish.summary,
    dish.menuDescription,
    ...dish.whatComesOut,
    ...dish.tasteAndTexture,
    dish.orderAdvice,
    dish.caution,
  ]
    .filter(Boolean)
    .join(" ")
}

export const SPICE_CONDIMENT_CATEGORIES = ["香辛料", "ソース"] as const

export function isSpiceOrCondiment(dish: DishItem) {
  return (SPICE_CONDIMENT_CATEGORIES as readonly string[]).includes(
    dish.category
  )
}

export function dishesUsingSpice(
  spice: DishItem,
  allDishes: DishItem[]
): DishItem[] {
  const terms = [spice.name, ...(spice.aliases ?? [])].filter(
    (term) => term.length >= MIN_TERM_LENGTH
  )
  if (terms.length === 0) return []

  return allDishes.filter((dish) => {
    if (dish.category !== "料理") return false
    if (dish.id === spice.id) return false
    const text = dishSearchText(dish)
    return terms.some((term) => textContainsTerm(text, term))
  })
}

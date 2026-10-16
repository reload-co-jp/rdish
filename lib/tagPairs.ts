import type { DishItem } from "../types/dish"
import { allDishes } from "./dishes"
import { COMBO_MIN_DISHES, DIM4_TAG_LABELS } from "./countryTagCombos"
import { tagItems } from "./taxonomy"

// 主食材（次元3）× カテゴリ（次元2）/ 調理法（次元4）
const BASE_TAG_LABELS = [
  "牛肉",
  "豚肉",
  "鶏肉",
  "羊肉",
  "ジビエ",
  "魚介",
  "貝類",
  "卵",
  "チーズ",
  "乳製品",
  "野菜",
  "豆類",
  "きのこ",
  "ハーブ",
  "スパイス",
  "ナッツ",
  "米",
  "小麦",
  "果物",
]

const SUB_TAG_LABELS = [
  "前菜",
  "主菜",
  "スープ",
  "サラダ",
  "デザート",
  "パスタ",
  "麺料理",
  "ご飯もの",
  "軽食",
  "点心",
  "パン",
  "菓子",
  "鍋料理",
  ...DIM4_TAG_LABELS,
]

// 片方のタグ一覧とほぼ同じ中身になる組み合わせ（米×ご飯もの 等）は重複ページになるので除外
const MAX_OVERLAP = 0.8

export type TagPair = {
  baseId: string
  baseLabel: string
  subId: string
  subLabel: string
  dishes: DishItem[]
}

function dishesWith(label: string): DishItem[] {
  return allDishes.filter((dish) => dish.tags.includes(label))
}

const subTags = tagItems.filter((tag) => SUB_TAG_LABELS.includes(tag.label))

export const tagPairs: TagPair[] = tagItems
  .filter((tag) => BASE_TAG_LABELS.includes(tag.label))
  .flatMap((base) => {
    const baseDishes = dishesWith(base.label)
    return subTags.flatMap((sub) => {
      const dishes = baseDishes.filter((dish) => dish.tags.includes(sub.label))
      const subTotal = dishesWith(sub.label).length
      if (dishes.length < COMBO_MIN_DISHES) return []
      if (
        dishes.length >= baseDishes.length * MAX_OVERLAP ||
        dishes.length >= subTotal * MAX_OVERLAP
      )
        return []
      return [
        {
          baseId: base.id,
          baseLabel: base.label,
          subId: sub.id,
          subLabel: sub.label,
          dishes,
        },
      ]
    })
  })

export function tagPairPath(pair: TagPair): string {
  return `/tags/${pair.baseId}/x/${pair.subId}/`
}

export function findTagPair(
  baseId: string,
  subId: string
): TagPair | undefined {
  return tagPairs.find((pair) => pair.baseId === baseId && pair.subId === subId)
}

export function tagPairsForBase(baseId: string): TagPair[] {
  return tagPairs.filter((pair) => pair.baseId === baseId)
}

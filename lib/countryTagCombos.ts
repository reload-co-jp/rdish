import type { DishItem } from "../types/dish"
import { allDishes } from "./dishes"
import { dishMatchesRegion, regionLabel } from "./region"
import { countryItems, tagItems } from "./taxonomy"

export const COMBO_MIN_DISHES = 5

// 次元2（料理カテゴリ）タグのみ掛け合わせ対象
const DIM2_TAG_LABELS = [
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
]

// 次元3（主食材）タグのみ掛け合わせ対象
const DIM3_TAG_LABELS = [
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

export type CombosKind = "category" | "ingredient"

export type CountryTagCombo = {
  kind: CombosKind
  countryId: string
  countryLabel: string
  tagId: string
  tagLabel: string
  dishes: DishItem[]
}

const dim2Tags = tagItems.filter((tag) => DIM2_TAG_LABELS.includes(tag.label))
const dim3Tags = tagItems.filter((tag) => DIM3_TAG_LABELS.includes(tag.label))

function buildCombos(
  kind: CombosKind,
  dimTags: typeof tagItems
): CountryTagCombo[] {
  return countryItems.flatMap((country) => {
    const countryDishes = allDishes.filter((dish) =>
      dishMatchesRegion(dish, country.label)
    )
    return dimTags.flatMap((tag) => {
      const dishes = countryDishes.filter((dish) =>
        dish.tags.includes(tag.label)
      )
      if (dishes.length < COMBO_MIN_DISHES) return []
      return [
        {
          kind,
          countryId: country.id,
          countryLabel: country.label,
          tagId: tag.id,
          tagLabel: tag.label,
          dishes,
        },
      ]
    })
  })
}

export const countryTagCombos: CountryTagCombo[] = buildCombos(
  "category",
  dim2Tags
)
export const countryIngredientCombos: CountryTagCombo[] = buildCombos(
  "ingredient",
  dim3Tags
)

export function comboPath(countryId: string, tagId: string): string {
  return `/countries/${countryId}/t/${tagId}/`
}

export function comboIngredientPath(countryId: string, tagId: string): string {
  return `/countries/${countryId}/i/${tagId}/`
}

export function findCombo(
  countryId: string,
  tagId: string
): CountryTagCombo | undefined {
  return countryTagCombos.find(
    (combo) => combo.countryId === countryId && combo.tagId === tagId
  )
}

export function findIngredientCombo(
  countryId: string,
  tagId: string
): CountryTagCombo | undefined {
  return countryIngredientCombos.find(
    (combo) => combo.countryId === countryId && combo.tagId === tagId
  )
}

export function combosForCountry(countryId: string): CountryTagCombo[] {
  return countryTagCombos.filter((combo) => combo.countryId === countryId)
}

export function ingredientCombosForCountry(
  countryId: string
): CountryTagCombo[] {
  return countryIngredientCombos.filter(
    (combo) => combo.countryId === countryId
  )
}

export function combosForDish(dish: DishItem): CountryTagCombo[] {
  const dishRegionLabels = new Set(dish.regions.map(regionLabel))
  return [...countryTagCombos, ...countryIngredientCombos].filter(
    (combo) =>
      dishRegionLabels.has(combo.countryLabel) &&
      dish.tags.includes(combo.tagLabel)
  )
}

import type { DishItem } from "../types/dish"
import { allDishes } from "./dishes"
import { dishMatchesRegion } from "./region"
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

export type CountryTagCombo = {
  countryId: string
  countryLabel: string
  tagId: string
  tagLabel: string
  dishes: DishItem[]
}

const dim2Tags = tagItems.filter((tag) => DIM2_TAG_LABELS.includes(tag.label))

export const countryTagCombos: CountryTagCombo[] = countryItems.flatMap(
  (country) => {
    const countryDishes = allDishes.filter((dish) =>
      dishMatchesRegion(dish, country.label),
    )
    return dim2Tags.flatMap((tag) => {
      const dishes = countryDishes.filter((dish) =>
        dish.tags.includes(tag.label),
      )
      if (dishes.length < COMBO_MIN_DISHES) return []
      return [
        {
          countryId: country.id,
          countryLabel: country.label,
          tagId: tag.id,
          tagLabel: tag.label,
          dishes,
        },
      ]
    })
  },
)

export function comboPath(countryId: string, tagId: string): string {
  return `/countries/${countryId}/t/${tagId}/`
}

export function findCombo(
  countryId: string,
  tagId: string,
): CountryTagCombo | undefined {
  return countryTagCombos.find(
    (combo) => combo.countryId === countryId && combo.tagId === tagId,
  )
}

export function combosForCountry(countryId: string): CountryTagCombo[] {
  return countryTagCombos.filter((combo) => combo.countryId === countryId)
}

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

// 次元4（調理法）タグのみ掛け合わせ対象
export const DIM4_TAG_LABELS = [
  "煮込み",
  "揚げ物",
  "焼き物",
  "蒸し料理",
  "炒め物",
  "グリル",
  "ロースト",
  "マリネ",
  "低温調理",
  "燻製",
  "発酵",
  "生食",
  "炭火焼き",
]

// 次元5（風味・特徴）タグ → 「〜料理」の言い回し
const FLAVOR_PHRASES: Record<string, string> = {
  ピリ辛: "ピリ辛料理",
  こってり: "こってり料理",
  あっさり: "あっさり料理",
  クリーミー: "クリーミーな料理",
  酸味: "酸味のある料理",
  甘み: "甘みのある料理",
  香ばしい: "香ばしい料理",
  ジューシー: "ジューシーな料理",
  もちもち: "もちもち食感の料理",
  ふわふわ: "ふわふわ食感の料理",
  サクサク: "サクサク食感の料理",
}

export type CombosKind = "category" | "ingredient" | "method" | "flavor"

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
const dim4Tags = tagItems.filter((tag) => DIM4_TAG_LABELS.includes(tag.label))
const dim5Tags = tagItems.filter((tag) => tag.label in FLAVOR_PHRASES)

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

export const countryMethodCombos: CountryTagCombo[] = buildCombos(
  "method",
  dim4Tags
)
export const countryFlavorCombos: CountryTagCombo[] = buildCombos(
  "flavor",
  dim5Tags
)

const KIND_SEGMENT: Record<CombosKind, string> = {
  category: "t",
  ingredient: "i",
  method: "m",
  flavor: "f",
}

const COMBOS_BY_KIND: Record<CombosKind, CountryTagCombo[]> = {
  category: countryTagCombos,
  ingredient: countryIngredientCombos,
  method: countryMethodCombos,
  flavor: countryFlavorCombos,
}

export function comboHref(combo: CountryTagCombo): string {
  return `/countries/${combo.countryId}/${KIND_SEGMENT[combo.kind]}/${combo.tagId}/`
}

// 表示名（例: 前菜 / 牛肉料理 / 煮込み / ピリ辛料理）
export function comboTagName(combo: CountryTagCombo): string {
  if (combo.kind === "ingredient") return `${combo.tagLabel}料理`
  if (combo.kind === "flavor") return FLAVOR_PHRASES[combo.tagLabel]
  return combo.tagLabel
}

export function findComboOf(
  kind: CombosKind,
  countryId: string,
  tagId: string
): CountryTagCombo | undefined {
  return COMBOS_BY_KIND[kind].find(
    (combo) => combo.countryId === countryId && combo.tagId === tagId
  )
}

export function combosOfKind(kind: CombosKind): CountryTagCombo[] {
  return COMBOS_BY_KIND[kind]
}

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

export function combosForDish(dish: DishItem): CountryTagCombo[] {
  const dishRegionLabels = new Set(dish.regions.map(regionLabel))
  return Object.values(COMBOS_BY_KIND)
    .flat()
    .filter(
      (combo) =>
        dishRegionLabels.has(combo.countryLabel) &&
        dish.tags.includes(combo.tagLabel)
    )
}

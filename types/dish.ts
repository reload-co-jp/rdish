export type DishCategory =
  | "料理"
  | "食材"
  | "調理法"
  | "ソース"
  | "香辛料"
  | "チーズ"
  | "野菜"
  | "肉"
  | "魚介"
  | "デザート"
  | "飲み物"

export type SimilarItem = {
  id?: string
  name: string
  difference: string
}

export type DishItem = {
  id: string
  name: string
  kana?: string
  aliases?: string[]
  englishName?: string
  originalName?: string
  category: DishCategory
  regions: string[]
  summary: string
  menuDescription: string
  whatComesOut: string[]
  tasteAndTexture: string[]
  orderAdvice: string
  caution?: string
  similarItems: SimilarItem[]
  relatedIds: string[]
  tags: string[]
  reverseKeywords: string[]
  beginnerFriendlyScore: 1 | 2 | 3 | 4 | 5
  uniquenessScore: 1 | 2 | 3 | 4 | 5
  heavinessScore: 1 | 2 | 3 | 4 | 5
  spicinessScore: 0 | 1 | 2 | 3 | 4 | 5
}

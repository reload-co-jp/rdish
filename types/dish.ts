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
  regions: {
    area?: string
    country?: string
    prefecture?: string
    locality?: string
  }[]
  summary: string
  menuDescription: string
  whatComesOut: string[]
  tasteAndTexture: string[]
  orderAdvice: string
  caution?: string
  similarItems: SimilarItem[]
  relatedIds: string[]
  source?: string[]
  images?: string[]
  tags: string[]
  reverseKeywords: string[]
  // この料理を避けたい人の属性（例: 辛いものが苦手 / 乳製品不可）。lib/dietary.ts が参照
  avoidedBy?: string[]
  beginnerFriendlyScore: 1 | 2 | 3 | 4 | 5
  uniquenessScore: 1 | 2 | 3 | 4 | 5
  heavinessScore: 1 | 2 | 3 | 4 | 5
  spicinessScore: 0 | 1 | 2 | 3 | 4 | 5
}

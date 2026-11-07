export type RestaurantDish = {
  // data/dishes.json の id
  id: string
  // 店でのメニュー表記（例: 「マルゲリータ D.O.C.」）。dish.name と異なる場合のみ
  menuName?: string
  // 価格帯・提供時期などの補足
  note?: string
}

export type RestaurantItem = {
  id: string
  name: string
  kana?: string
  // 次元1の料理圏タグ（例: イタリア料理）
  cuisines: string[]
  // 都道府県
  prefecture: string
  // 市区町村・エリア（例: 渋谷区 / 神楽坂）
  area?: string
  address?: string
  nearestStation?: string
  url?: string
  // 公式予約・SNS等の追加リンク
  links?: { label: string; url: string }[]
  description: string
  dishes: RestaurantDish[]
  // 公式サイトがない・情報が不足する場合に確認に使った情報源（予約サイト・自治体・媒体記事等）
  sources?: string[]
  // 情報確認日（YYYY-MM-DD）
  checkedAt?: string
  closed?: boolean
}

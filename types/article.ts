export type ArticleProperty = {
  label: string
  value: string
}

export type ArticleDifference = {
  label: string
  value: string
}

export type ArticleDishEntry = {
  heading: string
  dishId?: string
  properties: ArticleProperty[]
  differences?: ArticleDifference[]
  note?: string
}

export type ArticleRegion = {
  heading: string
  dishes: ArticleDishEntry[]
}

export type ArticleComparisonRow = {
  name: string
  dishId?: string
  region: string
  skin: string
  filling: string
  cooking: string
  eatStyle: string
  soupInside?: boolean
}

export type ArticleCallout = {
  heading: string
  body: string
  items?: { name: string; description: string }[]
}

export type ArticleHistoryEntry = {
  period: string
  heading: string
  body: string
}

export type ArticleSource = {
  title: string
  url?: string
  author?: string
  note?: string
}

export type Article = {
  id: string
  slug: string
  title: string
  subtitle?: string
  description: string
  publishedAt: string
  updatedAt?: string
  intro: string
  history?: ArticleHistoryEntry[]
  regions: ArticleRegion[]
  comparison: ArticleComparisonRow[]
  callouts: ArticleCallout[]
  relatedDishIds: string[]
  sources?: ArticleSource[]
}

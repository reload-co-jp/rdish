import type { DishItem } from "../types/dish"
import { allDishes } from "./dishes"

export const COLLECTION_MIN_DISHES = 5

// スコア軸 × 料理圏タグの掛け合わせ特集。独自スコアデータを活かした切り口LP。
const COUNTRY_SLUGS: Record<string, string> = {
  フランス料理: "french",
  イタリア料理: "italian",
  スペイン料理: "spanish",
  中国料理: "chinese",
  四川料理: "sichuan",
  韓国料理: "korean",
  タイ料理: "thai",
  インド料理: "indian",
  ベトナム料理: "vietnamese",
  メキシコ料理: "mexican",
  トルコ料理: "turkish",
  アメリカ料理: "american",
}

type Axis = {
  id: string
  groupLabel: string
  countries: string[]
  title: (country: string) => string
  description: (country: string, count: number, top3: string) => string
  filter: (dish: DishItem) => boolean
  sort?: (a: DishItem, b: DishItem) => number
}

const axes: Axis[] = [
  {
    id: "not-spicy",
    groupLabel: "辛さ控えめ",
    countries: [
      "韓国料理",
      "タイ料理",
      "インド料理",
      "四川料理",
      "中国料理",
      "メキシコ料理",
    ],
    title: (country) => `辛くない${country}`,
    description: (country, count, top3) =>
      `辛いものが苦手でも安心して注文できる、辛さ控えめの${country}を集めました。${top3}など全${count}件。`,
    filter: (dish) => dish.spicinessScore <= 1,
  },
  {
    id: "spicy",
    groupLabel: "激辛",
    countries: ["韓国料理", "タイ料理", "インド料理", "四川料理", "中国料理"],
    title: (country) => `激辛好きにおすすめの${country}`,
    description: (country, count, top3) =>
      `しっかり辛い${country}を集めました。${top3}など全${count}件。辛さレベル付きで比較できます。`,
    filter: (dish) => dish.spicinessScore >= 4,
    sort: (a, b) => b.spicinessScore - a.spicinessScore,
  },
  {
    id: "light",
    groupLabel: "あっさり",
    countries: [
      "フランス料理",
      "イタリア料理",
      "中国料理",
      "韓国料理",
      "スペイン料理",
    ],
    title: (country) => `あっさり食べられる${country}`,
    description: (country, count, top3) =>
      `重たい料理が続いたときにも選びやすい、あっさり系の${country}を集めました。${top3}など全${count}件。`,
    filter: (dish) => dish.heavinessScore <= 2,
  },
  {
    id: "hearty",
    groupLabel: "がっつり",
    countries: [
      "フランス料理",
      "イタリア料理",
      "アメリカ料理",
      "中国料理",
      "韓国料理",
    ],
    title: (country) => `がっつり食べたい日の${country}`,
    description: (country, count, top3) =>
      `ボリューム満点・こってり系の${country}を集めました。${top3}など全${count}件。`,
    filter: (dish) => dish.heavinessScore >= 4,
    sort: (a, b) => b.heavinessScore - a.heavinessScore,
  },
  {
    id: "beginner",
    groupLabel: "初心者向け",
    countries: [
      "フランス料理",
      "イタリア料理",
      "スペイン料理",
      "韓国料理",
      "タイ料理",
      "インド料理",
      "中国料理",
      "ベトナム料理",
      "トルコ料理",
    ],
    title: (country) => `初心者におすすめの${country}`,
    description: (country, count, top3) =>
      `初めての${country}でも失敗しにくい定番を集めました。${top3}など全${count}件。注文のコツ付き。`,
    filter: (dish) => dish.beginnerFriendlyScore >= 4,
    sort: (a, b) => b.beginnerFriendlyScore - a.beginnerFriendlyScore,
  },
]

export type Collection = {
  slug: string
  axisId: string
  axisLabel: string
  title: string
  description: string
  dishes: DishItem[]
}

export const allCollections: Collection[] = axes.flatMap((axis) =>
  axis.countries.flatMap((country) => {
    const slug = COUNTRY_SLUGS[country]
    if (!slug) return []
    const dishes = allDishes.filter(
      (dish) =>
        dish.category === "料理" &&
        dish.tags.includes(country) &&
        axis.filter(dish)
    )
    if (dishes.length < COLLECTION_MIN_DISHES) return []
    if (axis.sort) dishes.sort(axis.sort)
    const count = dishes.length
    const top3 = dishes
      .slice(0, 3)
      .map((d) => d.name)
      .join("、")
    return [
      {
        slug: `${axis.id}-${slug}`,
        axisId: axis.id,
        axisLabel: axis.groupLabel,
        title: axis.title(country),
        description: axis.description(country, count, top3),
        dishes,
      },
    ]
  })
)

export type CollectionGroup = {
  id: string
  label: string
  collections: Collection[]
}

export const collectionGroups: CollectionGroup[] = axes.flatMap((axis) => {
  const collections = allCollections.filter((c) => c.axisId === axis.id)
  if (collections.length === 0) return []
  return [{ id: axis.id, label: axis.groupLabel, collections }]
})

export function collectionBySlug(slug: string): Collection | undefined {
  return allCollections.find((collection) => collection.slug === slug)
}

export function collectionPath(slug: string): string {
  return `/collections/${slug}/`
}

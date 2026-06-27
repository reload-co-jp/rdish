import categories from "../data/categories.json"
import countriesData from "../data/countries.json"
import tags from "../data/tags.json"
import type { DishCategory, DishItem } from "../types/dish"
import { allDishes } from "./dishes"
import { regionLabel } from "./region"

const SITE_URL = "https://rdish.reload.co.jp"

type TaxonomyItem<T extends string = string> = {
  id: string
  label: T
  description?: string
  intro?: string[]
}

export const categoryItems = categories as TaxonomyItem<DishCategory>[]

type CountryData = { label: string; description: string; intro?: string[] }
const countryDataMap = new Map(
  (countriesData as CountryData[]).map((c) => [c.label, c]),
)

function toItems(labels: string[]): TaxonomyItem[] {
  return [...new Set(labels)]
    .filter(Boolean)
    .map((label, i) => {
      const data = countryDataMap.get(label)
      return { id: String(i + 1), label, description: data?.description, intro: data?.intro }
    })
}

export const tagItems = tags as TaxonomyItem[]

export const countryItems = toItems(
  allDishes.flatMap((dish) => dish.regions.map(regionLabel)),
)

export function taxonomyById<T extends string>(
  items: TaxonomyItem<T>[],
  id: string,
): TaxonomyItem<T> | undefined {
  return items.find((item) => item.id === id)
}

export function taxonomyIdForLabel<T extends string>(
  items: TaxonomyItem<T>[],
  label: string,
): string | undefined {
  return items.find((item) => item.label === label)?.id
}

export function categoryPath(label: string): string {
  const id = taxonomyIdForLabel(categoryItems, label)
  return id ? `/categories/${id}/` : "/categories/"
}

export function tagPath(label: string): string {
  const id = taxonomyIdForLabel(tagItems, label)
  return id ? `/tags/${id}/` : "/tags/"
}

export function countryPath(label: string): string {
  const id = taxonomyIdForLabel(countryItems, label)
  return id ? `/countries/${id}/` : "/countries/"
}

export function buildItemListJsonLd(
  name: string,
  url: string,
  dishes: DishItem[],
  offset = 0,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url: `${SITE_URL}${url}`,
    numberOfItems: dishes.length,
    itemListElement: dishes.map((dish, i) => ({
      "@type": "ListItem",
      position: offset + i + 1,
      name: dish.name,
      url: `${SITE_URL}/dishes/${dish.id}/`,
    })),
  }
}

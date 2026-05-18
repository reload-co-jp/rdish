import categories from "../data/categories.json"
import countriesData from "../data/countries.json"
import dishes from "../data/dishes.json"
import tags from "../data/tags.json"
import type { DishCategory, DishItem } from "../types/dish"
import { regionLabel } from "./region"

type TaxonomyItem<T extends string = string> = {
  id: string
  label: T
  description?: string
}

export const categoryItems = categories as TaxonomyItem<DishCategory>[]

const allDishes = dishes as DishItem[]

const countryDescriptions = new Map(
  (countriesData as { label: string; description: string }[]).map((c) => [c.label, c.description]),
)

function toItems(labels: string[]): TaxonomyItem[] {
  return [...new Set(labels)]
    .filter(Boolean)
    .map((label, i) => ({ id: String(i + 1), label, description: countryDescriptions.get(label) }))
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

export const dynamic = "force-static"

import type { MetadataRoute } from "next"
import dishes from "../data/dishes.json"
import { categoryItems, countryItems, tagItems } from "../lib/taxonomy"
import type { DishItem } from "../types/dish"

const SITE_URL = "https://rdish.reload.co.jp"
const allDishes = dishes as DishItem[]

export default function sitemap(): MetadataRoute.Sitemap {
  const dishUrls = allDishes.map((dish) => ({
    url: `${SITE_URL}/dishes/${dish.id}/`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }))

  const tagUrls = tagItems.map(({ id }) => ({
    url: `${SITE_URL}/tags/${id}/`,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }))

  const categoryUrls = categoryItems.map(({ id }) => ({
    url: `${SITE_URL}/categories/${id}/`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  const countryUrls = countryItems.map(({ id }) => ({
    url: `${SITE_URL}/countries/${id}/`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/reverse/`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/countries/`, changeFrequency: "monthly", priority: 0.7 },
    ...categoryUrls,
    ...countryUrls,
    ...dishUrls,
    ...tagUrls,
  ]
}

export const dynamic = "force-static"

import type { MetadataRoute } from "next"
import { regionLabel } from "../lib/region"
import dishes from "../data/dishes.json"
import type { DishItem } from "../types/dish"

const SITE_URL = "https://rdish.reload.co.jp"
const allDishes = dishes as DishItem[]

export default function sitemap(): MetadataRoute.Sitemap {
  const dishUrls = allDishes.map((dish) => ({
    url: `${SITE_URL}/dishes/${dish.id}/`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }))

  const allTags = [...new Set(allDishes.flatMap((d) => d.tags))]
  const tagUrls = allTags.map((tag) => ({
    url: `${SITE_URL}/tags/${encodeURIComponent(tag)}/`,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }))

  const allCategories = [...new Set(allDishes.map((d) => d.category))]
  const categoryUrls = allCategories.map((cat) => ({
    url: `${SITE_URL}/categories/${encodeURIComponent(cat)}/`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  const allRegions = [...new Set(allDishes.flatMap((d) => d.regions.map(regionLabel)))]
  const countryUrls = allRegions.map((region) => ({
    url: `${SITE_URL}/countries/${encodeURIComponent(region)}/`,
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

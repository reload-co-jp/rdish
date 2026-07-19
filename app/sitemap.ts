export const dynamic = "force-static"

import type { MetadataRoute } from "next"
import { totalPages } from "../components/features/DishesPageContent"
import { countryTotalPages } from "../components/features/CountryPageContent"
import dishDatesData from "../data/dish-dates.json"
import { allArticles } from "../lib/articles"
import { allCollections, collectionPath } from "../lib/collections"
import {
  comboIngredientPath,
  comboPath,
  countryIngredientCombos,
  countryTagCombos,
} from "../lib/countryTagCombos"
import { allDishes } from "../lib/dishes"
import { dishMatchesRegion } from "../lib/region"
import { categoryItems, countryItems, tagItems } from "../lib/taxonomy"

const dishDates = dishDatesData as Record<string, string>

const SITE_URL = "https://rdish.reload.co.jp"

const page = (
  path: string,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number,
) => ({
  url: `${SITE_URL}${path}`,
  changeFrequency,
  priority,
})

const BUILD_DATE = new Date()

export default function sitemap(): MetadataRoute.Sitemap {
  const dishUrls = allDishes.map((dish) => ({
    url: `${SITE_URL}/dishes/${dish.id}/`,
    lastModified: dishDates[dish.id] ? new Date(dishDates[dish.id]) : BUILD_DATE,
    changeFrequency: "monthly" as const,
    priority: 0.8,
    ...(dish.images?.length
      ? { images: dish.images.map((src) => `${SITE_URL}${src}`) }
      : {}),
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

  const countryPaginatedUrls = countryItems.flatMap(({ id, label }) => {
    const count = allDishes.filter((d) => dishMatchesRegion(d, label)).length
    const countryTotal = countryTotalPages(count)
    return Array.from({ length: Math.max(countryTotal - 1, 0) }, (_, i) => ({
      url: `${SITE_URL}/countries/${id}/p/${i + 2}/`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }))
  })

  const total = totalPages(allDishes.length)
  const paginatedUrls = Array.from({ length: total - 1 }, (_, i) => ({
    url: `${SITE_URL}/dishes/p/${i + 2}/`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }))

  const comboUrls = countryTagCombos.map(({ countryId, tagId }) => ({
    url: `${SITE_URL}${comboPath(countryId, tagId)}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  const ingredientComboUrls = countryIngredientCombos.map(({ countryId, tagId }) => ({
    url: `${SITE_URL}${comboIngredientPath(countryId, tagId)}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  const collectionUrls = allCollections.map(({ slug }) => ({
    url: `${SITE_URL}${collectionPath(slug)}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  const articleUrls = allArticles.map((article) => ({
    url: `${SITE_URL}/articles/${article.slug}/`,
    lastModified: new Date(article.updatedAt ?? article.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }))

  return [
    page("/", "weekly", 1.0),
    page("/dishes/", "weekly", 0.8),
    page("/articles/", "monthly", 0.7),
    ...paginatedUrls,
    page("/reverse/", "monthly", 0.7),
    page("/categories/", "monthly", 0.7),
    page("/countries/", "monthly", 0.7),
    page("/tags/", "monthly", 0.7),
    page("/collections/", "monthly", 0.7),
    page("/llms.txt", "weekly", 0.3),
    page("/llms-full.txt", "weekly", 0.3),
    page("/about/", "yearly", 0.4),
    ...categoryUrls,
    ...countryUrls,
    ...countryPaginatedUrls,
    ...comboUrls,
    ...ingredientComboUrls,
    ...collectionUrls,
    ...dishUrls,
    ...tagUrls,
    ...articleUrls,
  ]
}

export const dynamic = "force-static"

import type { MetadataRoute } from "next"
import dishes from "../data/dishes.json"
import articles from "../data/articles.json"
import { totalPages } from "../components/features/DishesPageContent"
import { categoryItems, countryItems, tagItems } from "../lib/taxonomy"
import type { DishItem } from "../types/dish"
import type { Article } from "../types/article"

const SITE_URL = "https://rdish.reload.co.jp"
const allDishes = dishes as DishItem[]
const allArticles = articles as Article[]

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
    lastModified: BUILD_DATE,
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

  const total = totalPages(allDishes.length)
  const paginatedUrls = Array.from({ length: total - 1 }, (_, i) => ({
    url: `${SITE_URL}/dishes/p/${i + 2}/`,
    changeFrequency: "weekly" as const,
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
    page("/countries/", "monthly", 0.7),
    page("/about/", "yearly", 0.4),
    ...categoryUrls,
    ...countryUrls,
    ...dishUrls,
    ...tagUrls,
    ...articleUrls,
  ]
}

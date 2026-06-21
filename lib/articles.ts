import articlesData from "../data/articles.json"
import type { Article } from "../types/article"
import type { DishItem } from "../types/dish"

export const allArticles: Article[] = articlesData as Article[]

export function relatedDishesOf(article: Article, allDishes: DishItem[]): DishItem[] {
  return article.relatedDishIds
    .map((id) => allDishes.find((d) => d.id === id))
    .filter(Boolean) as DishItem[]
}

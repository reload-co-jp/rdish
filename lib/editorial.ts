import dishDatesData from "../data/dish-dates.json"
import type { Article } from "../types/article"
import type { DishItem } from "../types/dish"
import { allDishes } from "./dishes"

const dishDates = dishDatesData as Record<string, string>

export function formatDate(iso?: string): string {
  return iso ? iso.replaceAll("-", ".") : ""
}

export function dishDate(id: string): string | undefined {
  return dishDates[id]
}

// 記事には画像がないため、関連料理の最初の写真をアイキャッチに使う
export function articleCover(
  article: Article
): { src: string; dish: DishItem } | undefined {
  for (const id of article.relatedDishIds) {
    const dish = allDishes.find((d) => d.id === id)
    if (dish?.images?.[0]) return { src: dish.images[0], dish }
  }
  return undefined
}

export const CATEGORY_EN: Record<string, string> = {
  料理: "Dishes",
  食材: "Ingredients",
  調理法: "Techniques",
  ソース: "Sauces",
  チーズ: "Cheese",
  野菜: "Vegetables",
  香辛料: "Spices",
  デザート: "Desserts",
  飲み物: "Drinks",
  肉: "Meat",
  魚介: "Seafood",
}

import type { DishItem } from "../types/dish"

export function extractSearchTerms(dish: DishItem): string[] {
  return [
    dish.name,
    dish.kana,
    dish.englishName,
    dish.originalName,
    ...(dish.aliases ?? []),
  ].filter((t): t is string => !!t && t.length >= 3)
}

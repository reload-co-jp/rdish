import type { DishItem } from "../types/dish"

type Region = DishItem["regions"][number]

export function regionLabel(r: Region): string {
  const detail = [r.prefecture, r.locality].filter(Boolean).join(" ")
  if (r.country && detail) return `${r.country}（${detail}）`
  if (r.country && r.area) return `${r.country}（${r.area}）`
  if (r.country) return r.country
  return r.area ?? ""
}

export function dishMatchesRegion(dish: DishItem, label: string): boolean {
  return dish.regions.some((r) => regionLabel(r) === label)
}

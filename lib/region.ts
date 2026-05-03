import type { DishItem } from "../types/dish"

type Region = DishItem["regions"][number]

export function regionLabel(r: Region): string {
  if (r.country && r.locality) return `${r.country}（${r.locality}）`
  if (r.country) return r.country
  return r.area ?? ""
}

export function regionLabels(regions: Region[]): string[] {
  return regions.map(regionLabel)
}

export function dishMatchesRegion(dish: DishItem, label: string): boolean {
  return dish.regions.some((r) => regionLabel(r) === label)
}

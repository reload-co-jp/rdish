import type { DishItem } from "../types/dish"

function topLabels(labels: string[], limit: number): string[] {
  const counts = new Map<string, number>()
  for (const label of labels) counts.set(label, (counts.get(label) ?? 0) + 1)
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ja"))
    .slice(0, limit)
    .map(([label]) => label)
}

function joinJapanese(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ""
  return `${items.slice(0, -1).join("、")}、${items.at(-1)}`
}

export function buildTagDescription(tag: string, dishes: DishItem[]): string {
  const examples = dishes.slice(0, 3).map((dish) => dish.name)
  const categories = topLabels(
    dishes.map((dish) => dish.category),
    3,
  )

  if (dishes.length === 1) {
    return `「${tag}」タグは、${examples[0]}に付く分類です。メニュー上で近い特徴を持つ料理を探す手がかりになります。`
  }

  return `「${tag}」タグは、${joinJapanese(categories)}にまたがる分類です。代表例は${joinJapanese(examples)}など、関連する料理・食材・調理法をまとめて探せます。`
}

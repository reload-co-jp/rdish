import { allDishes } from "../../../lib/dishes"
import { buildOgImage, ogContentType, ogSize } from "../../../lib/og"
import { categoryItems, taxonomyById } from "../../../lib/taxonomy"

export const dynamic = "force-static"
export const alt = "カテゴリ別 料理一覧 | RDish"
export const size = ogSize
export const contentType = ogContentType

export function generateStaticParams() {
  return categoryItems.map(({ id }) => ({ category: id }))
}

export default async function Image({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params
  const item = taxonomyById(categoryItems, category)
  if (!item) return new Response("Not found", { status: 404 })
  const count = allDishes.filter((d) => d.category === item.label).length

  return buildOgImage({ title: item.label, titleSize: 72, badge: `${count}件` })
}

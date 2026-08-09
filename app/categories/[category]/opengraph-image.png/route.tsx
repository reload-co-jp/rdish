import { allDishes } from "../../../../lib/dishes"
import { buildOgImage } from "../../../../lib/og"
import { categoryItems, taxonomyById } from "../../../../lib/taxonomy"

export const dynamic = "force-static"
export const contentType = "image/png"

export function generateStaticParams() {
  return categoryItems.map(({ id }) => ({ category: id }))
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ category: string }> },
) {
  const { category } = await params
  const item = taxonomyById(categoryItems, category)
  if (!item) return new Response("Not found", { status: 404 })
  const count = allDishes.filter((d) => d.category === item.label).length

  return buildOgImage({ title: item.label, titleSize: 72, badge: `${count}件` })
}

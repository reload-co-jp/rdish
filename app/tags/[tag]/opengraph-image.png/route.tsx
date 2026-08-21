import { allDishes } from "../../../../lib/dishes"
import { buildOgImage } from "../../../../lib/og"
import { tagItems, taxonomyById } from "../../../../lib/taxonomy"

export const dynamic = "force-static"
export const contentType = "image/png"

export function generateStaticParams() {
  return tagItems.map(({ id }) => ({ tag: id }))
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tag: string }> }
) {
  const { tag } = await params
  const item = taxonomyById(tagItems, tag)
  if (!item) return new Response("Not found", { status: 404 })
  const count = allDishes.filter((d) => d.tags.includes(item.label)).length

  return buildOgImage({ title: item.label, titleSize: 72, badge: `${count}件` })
}

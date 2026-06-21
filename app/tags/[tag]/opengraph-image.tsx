import { allDishes } from "../../../lib/dishes"
import { buildOgImage, ogContentType, ogSize } from "../../../lib/og"
import { tagItems, taxonomyById } from "../../../lib/taxonomy"

export const dynamic = "force-static"
export const alt = "タグ別 料理一覧 | RDish"
export const size = ogSize
export const contentType = ogContentType

export function generateStaticParams() {
  return tagItems.map(({ id }) => ({ tag: id }))
}

export default async function Image({
  params,
}: {
  params: Promise<{ tag: string }>
}) {
  const { tag } = await params
  const item = taxonomyById(tagItems, tag)
  if (!item) return new Response("Not found", { status: 404 })
  const count = allDishes.filter((d) => d.tags.includes(item.label)).length

  return buildOgImage({ title: item.label, titleSize: 72, badge: `${count}件` })
}

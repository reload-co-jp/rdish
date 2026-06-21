import { allDishes } from "../../../lib/dishes"
import { buildOgImage, ogContentType, ogSize } from "../../../lib/og"
import { dishMatchesRegion } from "../../../lib/region"
import { countryItems, taxonomyById } from "../../../lib/taxonomy"

export const dynamic = "force-static"
export const alt = "国・地域別 料理一覧 | RDish"
export const size = ogSize
export const contentType = ogContentType

export function generateStaticParams() {
  return countryItems.map(({ id }) => ({ country: id }))
}

export default async function Image({
  params,
}: {
  params: Promise<{ country: string }>
}) {
  const { country } = await params
  const item = taxonomyById(countryItems, country)
  if (!item) return new Response("Not found", { status: 404 })
  const count = allDishes.filter((d) => dishMatchesRegion(d, item.label)).length

  return buildOgImage({ title: item.label, titleSize: 72, badge: `${count}件の料理` })
}

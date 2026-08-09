import { allDishes } from "../../../../lib/dishes"
import { buildOgImage } from "../../../../lib/og"
import { dishMatchesRegion } from "../../../../lib/region"
import { countryItems, taxonomyById } from "../../../../lib/taxonomy"

export const dynamic = "force-static"
export const contentType = "image/png"

export function generateStaticParams() {
  return countryItems.map(({ id }) => ({ country: id }))
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ country: string }> },
) {
  const { country } = await params
  const item = taxonomyById(countryItems, country)
  if (!item) return new Response("Not found", { status: 404 })
  const count = allDishes.filter((d) => dishMatchesRegion(d, item.label)).length

  return buildOgImage({ title: item.label, titleSize: 72, badge: `${count}件の料理` })
}

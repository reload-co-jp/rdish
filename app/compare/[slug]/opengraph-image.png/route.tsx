import { allComparisons, comparisonBySlug } from "../../../../lib/comparisons"
import { buildOgImage } from "../../../../lib/og"

export const dynamic = "force-static"
export const contentType = "image/png"

export function generateStaticParams() {
  return allComparisons.map(({ slug }) => ({ slug }))
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const comparison = comparisonBySlug(slug)
  if (!comparison) return new Response("Not found", { status: 404 })

  const longest = Math.max(comparison.a.name.length, comparison.b.name.length)
  return buildOgImage({
    title: [comparison.a.name, `× ${comparison.b.name}`],
    titleSize: longest > 10 ? 48 : 64,
    badge: "違いを比較",
  })
}

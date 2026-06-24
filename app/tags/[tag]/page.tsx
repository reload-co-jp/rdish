import { notFound } from "next/navigation"
import { TaxonomyPageLayout } from "../../../components/features/TaxonomyPageLayout"
import { allDishes } from "../../../lib/dishes"
import { buildItemListJsonLd, tagItems, taxonomyById } from "../../../lib/taxonomy"

export function generateStaticParams() {
  return tagItems.map(({ id }) => ({ tag: id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>
}) {
  const { tag } = await params
  const item = taxonomyById(tagItems, tag)
  if (!item) notFound()
  const results = allDishes.filter((d) => d.tags.includes(item.label))
  const count = results.length
  const top3 = results.slice(0, 3).map((d) => d.name).join("、")
  const title = `${item.label}の料理一覧（全${count}件）`
  const tagDescription =
    item.description ?? `外食メニューで見かける「${item.label}」の料理をまとめています。`
  const description = `${tagDescription} ${top3}など${count}件。外食メニューを調べるなら RDish。`
  return {
    title,
    description,
    alternates: { canonical: `/tags/${item.id}/` },
    openGraph: { title, description, url: `/tags/${item.id}/` },
  }
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>
}) {
  const { tag } = await params
  const item = taxonomyById(tagItems, tag)
  if (!item) notFound()
  const results = allDishes.filter((d) => d.tags.includes(item.label))
  if (results.length === 0) notFound()
  const description =
    item.description ??
    `「${item.label}」は、料理を整理するためのキーワードです。`
  const jsonLd = buildItemListJsonLd(
    `#${item.label}の料理一覧`,
    `/tags/${item.id}/`,
    results,
  )

  return (
    <TaxonomyPageLayout
      breadcrumbLabel="タグ"
      breadcrumbHref="/tags/"
      itemLabel={item.label}
      description={description}
      results={results}
      jsonLd={jsonLd}
    />
  )
}

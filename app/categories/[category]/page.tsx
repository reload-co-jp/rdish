import { notFound } from "next/navigation"
import { TaxonomyPageLayout } from "../../../components/features/TaxonomyPageLayout"
import { allDishes } from "../../../lib/dishes"
import { buildItemListJsonLd, categoryItems, taxonomyById } from "../../../lib/taxonomy"

export function generateStaticParams() {
  return categoryItems.map(({ id }) => ({ category: id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params
  const item = taxonomyById(categoryItems, category)
  if (!item) notFound()
  const results = allDishes.filter((d) => d.category === item.label)
  const count = results.length
  const top3 = results.slice(0, 3).map((d) => d.name).join("、")
  const title = `${item.label}の料理一覧（全${count}件）`
  const categoryDescription =
    item.description ?? `${item.label}カテゴリの料理・食材・調理法をまとめています。`
  const description = `${categoryDescription} ${top3}など${count}件。外食メニューを調べるなら RDish。`
  return {
    title,
    description,
    alternates: { canonical: `/categories/${item.id}/` },
    openGraph: { title, description, url: `/categories/${item.id}/` },
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params
  const item = taxonomyById(categoryItems, category)
  if (!item) notFound()
  const results = allDishes.filter((d) => d.category === item.label)
  if (results.length === 0) notFound()
  const description =
    item.description ?? `${item.label}カテゴリの料理・食材・調理法をまとめています。`
  const jsonLd = buildItemListJsonLd(
    `${item.label}の料理一覧`,
    `/categories/${item.id}/`,
    results,
  )

  return (
    <TaxonomyPageLayout
      breadcrumbLabel="カテゴリ"
      breadcrumbHref="/categories/"
      itemLabel={item.label}
      description={description}
      results={results}
      jsonLd={jsonLd}
    />
  )
}

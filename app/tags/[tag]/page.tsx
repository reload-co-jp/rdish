import { notFound } from "next/navigation"
import { TaxonomyPageLayout } from "../../../components/features/TaxonomyPageLayout"
import { allDishes } from "../../../lib/dishes"
import { tagItems, taxonomyById } from "../../../lib/taxonomy"

const SITE_URL = "https://rdish.reload.co.jp"

function topDishNames(results: typeof allDishes, limit = 3) {
  return results
    .slice(0, limit)
    .map((d) => d.name)
    .join("、")
}

function buildTagJsonLd(
  item: { id: string; label: string; description?: string },
  results: typeof allDishes
) {
  const url = `${SITE_URL}/tags/${item.id}/`
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#webpage`,
        name: `${item.label}の料理一覧`,
        description: item.description,
        url,
        inLanguage: "ja",
        about: {
          "@type": "DefinedTerm",
          name: item.label,
          description: item.description,
          inDefinedTermSet: `${SITE_URL}/tags/`,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "タグ",
            item: `${SITE_URL}/tags/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: item.label,
            item: url,
          },
        ],
      },
      {
        "@type": "ItemList",
        name: `${item.label}の料理一覧`,
        url,
        numberOfItems: results.length,
        itemListElement: results.map((dish, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: dish.name,
          url: `${SITE_URL}/dishes/${dish.id}/`,
        })),
      },
    ],
  }
}

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
  const top3 = topDishNames(results)
  const title = `${item.label}とは？関連料理一覧（全${count}件）`
  const tagDescription =
    item.description ??
    `外食メニューで見かける「${item.label}」の料理をまとめています。`
  const description = `${tagDescription} ${top3}など関連料理${count}件をRDishで確認できます。`
  return {
    title,
    description,
    keywords: [
      item.label,
      `${item.label} 料理`,
      `${item.label} メニュー`,
      ...results.slice(0, 5).map((d) => d.name),
    ],
    alternates: { canonical: `/tags/${item.id}/` },
    openGraph: {
      title,
      description,
      url: `/tags/${item.id}/`,
      type: "website",
    },
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
  const jsonLd = buildTagJsonLd(item, results)

  return (
    <TaxonomyPageLayout
      breadcrumbLabel="タグ"
      breadcrumbHref="/tags/"
      itemLabel={item.label}
      itemHref={`/tags/${item.id}/`}
      description={description}
      results={results}
      jsonLd={jsonLd}
    />
  )
}

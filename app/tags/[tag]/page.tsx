import { notFound } from "next/navigation"
import { Breadcrumb } from "../../../components/elements/Breadcrumb"
import { DishCard } from "../../../components/features/DishCard"
import dishes from "../../../data/dishes.json"
import { tagItems, taxonomyById } from "../../../lib/taxonomy"
import type { DishItem } from "../../../types/dish"

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
  const results = (dishes as DishItem[]).filter((d) =>
    d.tags.includes(item.label)
  )
  const count = results.length
  const title = `#${item.label}の料理一覧`
  const tagDescription =
    item.description ??
    `「${item.label}」は、料理を整理するためのキーワードです。`
  const description = `${tagDescription} 全${count}件。`
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
  const results = (dishes as DishItem[]).filter((d) => d.tags.includes(item.label))
  if (results.length === 0) notFound()
  const description =
    item.description ??
    `「${item.label}」は、料理を整理するためのキーワードです。`

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `#${item.label}の料理一覧`,
    url: `https://rdish.reload.co.jp/tags/${item.id}/`,
    numberOfItems: results.length,
    itemListElement: results.map((dish, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: dish.name,
      url: `https://rdish.reload.co.jp/dishes/${dish.id}/`,
    })),
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb
        items={[{ label: "タグ", href: "/" }, { label: `#${item.label}` }]}
      />
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: 800,
          marginBottom: "0.375rem",
        }}
      >
        #{item.label}
      </h1>
      <p
        style={{ color: "#aaa", fontSize: "0.875rem", marginBottom: "0.75rem" }}
      >
        {results.length}件
      </p>
      <p
        style={{
          color: "#7a6655",
          fontSize: "0.9375rem",
          lineHeight: 1.8,
          margin: "0 0 1.5rem",
        }}
      >
        {description}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {results.map((dish) => (
          <DishCard key={dish.id} dish={dish} />
        ))}
      </div>
    </div>
  )
}

import { notFound } from "next/navigation"
import { Breadcrumb } from "../../../components/elements/Breadcrumb"
import { DishCard } from "../../../components/features/DishCard"
import dishes from "../../../data/dishes.json"
import { categoryItems, taxonomyById } from "../../../lib/taxonomy"
import type { DishItem } from "../../../types/dish"

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
  const results = (dishes as DishItem[]).filter((d) => d.category === item.label)
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
  const results = (dishes as DishItem[]).filter((d) => d.category === item.label)
  if (results.length === 0) notFound()
  const description =
    item.description ?? `${item.label}カテゴリの料理・食材・調理法をまとめています。`

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${item.label}の料理一覧`,
    url: `https://rdish.reload.co.jp/categories/${item.id}/`,
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumb items={[{ label: "カテゴリ", href: "/categories/" }, { label: item.label }]} />
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.375rem" }}>
        {item.label}の料理一覧
      </h1>
      <p style={{ color: "#aaa", fontSize: "0.875rem", marginBottom: "0.75rem" }}>
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

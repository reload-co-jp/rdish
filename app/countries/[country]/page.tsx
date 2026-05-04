import { notFound } from "next/navigation"
import { Breadcrumb } from "../../../components/elements/Breadcrumb"
import { DishCard } from "../../../components/features/DishCard"
import dishes from "../../../data/dishes.json"
import { dishMatchesRegion } from "../../../lib/region"
import { countryItems, taxonomyById } from "../../../lib/taxonomy"
import type { DishItem } from "../../../types/dish"

export function generateStaticParams() {
  return countryItems.map(({ id }) => ({ country: id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>
}) {
  const { country } = await params
  const item = taxonomyById(countryItems, country)
  if (!item) notFound()
  const count = (dishes as DishItem[]).filter((d) => dishMatchesRegion(d, item.label)).length
  const title = `${item.label}の料理一覧`
  const description = `${item.label}の料理・食材・調理法 ${count}件。外食メニューで役立つ料理図鑑 RDish。`
  return {
    title,
    description,
    alternates: { canonical: `/countries/${item.id}/` },
    openGraph: { title, description, url: `/countries/${item.id}/` },
  }
}

export default async function CountryPage({
  params,
}: {
  params: Promise<{ country: string }>
}) {
  const { country } = await params
  const item = taxonomyById(countryItems, country)
  if (!item) notFound()
  const results = (dishes as DishItem[]).filter((d) => dishMatchesRegion(d, item.label))
  if (results.length === 0) notFound()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${item.label}の料理一覧`,
    url: `https://rdish.reload.co.jp/countries/${item.id}/`,
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
      <Breadcrumb items={[{ label: "国・地域", href: "/countries/" }, { label: item.label }]} />
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.375rem" }}>
        {item.label}
      </h1>
      <p style={{ color: "#aaa", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
        {results.length}件
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {results.map((dish) => (
          <DishCard key={dish.id} dish={dish} />
        ))}
      </div>
    </div>
  )
}

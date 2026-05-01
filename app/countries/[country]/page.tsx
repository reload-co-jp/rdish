import { notFound } from "next/navigation"
import { Breadcrumb } from "../../../components/elements/Breadcrumb"
import { DishCard } from "../../../components/features/DishCard"
import dishes from "../../../data/dishes.json"
import type { DishItem } from "../../../types/dish"

export function generateStaticParams() {
  const allDishes = dishes as DishItem[]
  const regions = [...new Set(allDishes.flatMap((d) => d.regions))]
  return regions.map((region) => ({ country: region }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>
}) {
  const { country } = await params
  const decoded = decodeURIComponent(country)
  const encoded = encodeURIComponent(decoded)
  const count = (dishes as DishItem[]).filter((d) => d.regions.includes(decoded)).length
  const title = `${decoded}の料理一覧`
  const description = `${decoded}の料理・食材・調理法 ${count}件。外食メニューで役立つ料理図鑑 RDish。`
  return {
    title,
    description,
    alternates: { canonical: `/countries/${encoded}/` },
    openGraph: { title, description, url: `/countries/${encoded}/` },
  }
}

export default async function CountryPage({
  params,
}: {
  params: Promise<{ country: string }>
}) {
  const { country } = await params
  const decoded = decodeURIComponent(country)
  const encoded = encodeURIComponent(decoded)
  const results = (dishes as DishItem[]).filter((d) => d.regions.includes(decoded))
  if (results.length === 0) notFound()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${decoded}の料理一覧`,
    url: `https://rdish.reload.co.jp/countries/${encoded}/`,
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
      <Breadcrumb items={[{ label: "国・地域", href: "/countries/" }, { label: decoded }]} />
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.375rem" }}>
        {decoded}
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

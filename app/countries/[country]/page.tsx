import { notFound } from "next/navigation"
import { Breadcrumb } from "../../../components/elements/Breadcrumb"
import { DishCard } from "../../../components/features/DishCard"
import dishes from "../../../data/dishes.json"
import type { DishItem } from "../../../types/dish"

type Region = { area?: string; country?: string; locality?: string }

function toLabel(r: Region): string {
  if (r.country && r.locality) return `${r.country}（${r.locality}）`
  if (r.country) return r.country
  return r.area ?? ""
}

function matchesLabel(dish: DishItem, label: string): boolean {
  return dish.regions.some((r) => toLabel(r as Region) === label)
}

export function generateStaticParams() {
  const labels = [...new Set((dishes as DishItem[]).flatMap((d) => d.regions.map((r) => toLabel(r as Region))))]
  return labels.filter(Boolean).map((country) => ({ country }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>
}) {
  const { country } = await params
  const label = decodeURIComponent(country)
  const encoded = encodeURIComponent(label)
  const count = (dishes as DishItem[]).filter((d) => matchesLabel(d, label)).length
  const title = `${label}の料理一覧`
  const description = `${label}の料理・食材・調理法 ${count}件。外食メニューで役立つ料理図鑑 RDish。`
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
  const label = decodeURIComponent(country)
  const encoded = encodeURIComponent(label)
  const results = (dishes as DishItem[]).filter((d) => matchesLabel(d, label))
  if (results.length === 0) notFound()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${label}の料理一覧`,
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
      <Breadcrumb items={[{ label: "国・地域", href: "/countries/" }, { label }]} />
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.375rem" }}>
        {label}
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

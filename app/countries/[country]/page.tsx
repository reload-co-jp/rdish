import Link from "next/link"
import { notFound } from "next/navigation"
import { Breadcrumb } from "../../../components/elements/Breadcrumb"
import { DishCard } from "../../../components/features/DishCard"
import dishes from "../../../data/dishes.json"
import { dishMatchesRegion } from "../../../lib/region"
import { countryItems, countryPath, taxonomyById } from "../../../lib/taxonomy"
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
  const countryResults = (dishes as DishItem[]).filter((d) => dishMatchesRegion(d, item.label))
  const count = countryResults.length
  const top3 = countryResults.slice(0, 3).map((d) => d.name).join("、")
  const title = `${item.label}の料理一覧（全${count}件）`
  const countryDesc = item.description ?? `${item.label}の料理・食材・調理法をまとめています。`
  const description = `${countryDesc} ${top3}など${count}件。外食メニューを調べるなら RDish。`
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
  const description = item.description ?? `${item.label}の料理・食材・調理法をまとめています。`
  const localities = countryItems.filter((c) => c.label.startsWith(`${item.label}（`))

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
      {localities.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem 1rem", marginBottom: "1.5rem" }}>
          {localities.map((loc) => (
            <Link
              key={loc.id}
              href={countryPath(loc.label)}
              style={{
                color: "#7a4f2a",
                fontSize: "0.875rem",
                textDecoration: "underline",
                textDecorationColor: "#d4b896",
                textUnderlineOffset: "3px",
              }}
            >
              {loc.label.replace(`${item.label}（`, "").replace(/）$/, "")}
            </Link>
          ))}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {results.map((dish) => (
          <DishCard key={dish.id} dish={dish} />
        ))}
      </div>
    </div>
  )
}

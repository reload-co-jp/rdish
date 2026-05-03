import Link from "next/link"
import type { Metadata } from "next"
import { Breadcrumb } from "../../components/elements/Breadcrumb"
import dishes from "../../data/dishes.json"
import type { DishItem } from "../../types/dish"

export const metadata: Metadata = {
  title: "国・地域別 料理一覧",
  description:
    "国・地域別に料理・食材・調理法を探せる料理図鑑 RDish。フランス、イタリア、スペインなど世界各国の料理を収録。",
  alternates: { canonical: "/countries/" },
  openGraph: { title: "国・地域別 料理一覧", url: "/countries/" },
}

const linkStyle = {
  background: "#f0e6d6",
  border: "1px solid #e8ddd0",
  borderRadius: "0.375rem",
  color: "#7a4f2a",
  fontSize: "0.875rem",
  padding: "0.5rem 1rem",
  textDecoration: "none",
  display: "flex",
  alignItems: "center",
  gap: "0.375rem",
} as const

const countStyle = { color: "#a89080", fontSize: "0.75rem" }

type Section = { region: string; count: number }

function toLabel(r: { area?: string; country?: string; locality?: string }): string {
  if (r.country && r.locality) return `${r.country}（${r.locality}）`
  if (r.country) return r.country
  return r.area ?? ""
}

export default function CountriesPage() {
  const allDishes = dishes as DishItem[]

  const areaMap = new Map<string, number>()
  const countryMap = new Map<string, number>()
  const localityMap = new Map<string, number>()

  for (const dish of allDishes) {
    for (const region of dish.regions) {
      const label = toLabel(region)
      if (region.country && region.locality) {
        localityMap.set(label, (localityMap.get(label) ?? 0) + 1)
        countryMap.set(region.country, (countryMap.get(region.country) ?? 0) + 1)
      } else if (region.country) {
        countryMap.set(label, (countryMap.get(label) ?? 0) + 1)
      } else {
        areaMap.set(label, (areaMap.get(label) ?? 0) + 1)
      }
    }
  }

  const toList = (map: Map<string, number>): Section[] =>
    [...map.entries()].sort((a, b) => b[1] - a[1]).map(([region, count]) => ({ region, count }))

  const countries = toList(countryMap)
  const localities = toList(localityMap)
  const areas = toList(areaMap)
  const allRegions = [...countries, ...localities, ...areas]

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "国・地域別 料理一覧",
    url: "https://rdish.reload.co.jp/countries/",
    numberOfItems: allRegions.length,
    itemListElement: allRegions.map(({ region }, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: region,
      url: `https://rdish.reload.co.jp/countries/${encodeURIComponent(region)}/`,
    })),
  }

  const renderLinks = (list: Section[]) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
      {list.map(({ region, count }) => (
        <Link key={region} href={`/countries/${encodeURIComponent(region)}/`} style={linkStyle}>
          {region}
          <span style={countStyle}>{count}</span>
        </Link>
      ))}
    </div>
  )

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb
        items={[{ label: "国・地域", href: "/countries/" }, { label: "一覧" }]}
      />
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "1.5rem" }}>
        国・地域から探す
      </h1>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#7a4f2a", marginBottom: "0.75rem" }}>
          国
        </h2>
        {renderLinks(countries)}
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#7a4f2a", marginBottom: "0.75rem" }}>
          地方
        </h2>
        {renderLinks(localities)}
      </section>

      <section>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#7a4f2a", marginBottom: "0.75rem" }}>
          地域
        </h2>
        {renderLinks(areas)}
      </section>
    </div>
  )
}

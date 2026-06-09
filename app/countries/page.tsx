import Link from "next/link"
import type { Metadata } from "next"
import { Breadcrumb } from "../../components/elements/Breadcrumb"
import dishes from "../../data/dishes.json"
import { countryPath } from "../../lib/taxonomy"
import type { DishItem } from "../../types/dish"

export const metadata: Metadata = {
  title: "国・地域別 料理一覧",
  description:
    "国・地域別に料理・食材・調理法を探せる料理図鑑 RDish。フランス、イタリア、スペインなど世界各国の料理を収録。",
  alternates: { canonical: "/countries/" },
  openGraph: { title: "国・地域別 料理一覧", url: "/countries/" },
}

const linkStyle = {
  color: "#7a4f2a",
  fontSize: "0.875rem",
  textDecoration: "underline",
  textDecorationColor: "#d4b896",
  textUnderlineOffset: "3px",
} as const

const countStyle = { color: "#a89080", fontSize: "0.75rem" }

type Section = { region: string; count: number }

type CountryGroup = {
  country: string
  countryCount: number
  localities: Section[]
}

export default function CountriesPage() {
  const allDishes = dishes as DishItem[]

  const countryOnlyMap = new Map<string, number>()
  const localityMap = new Map<string, number>()
  const countryForLocalityMap = new Map<string, number>()
  const areaMap = new Map<string, number>()

  for (const dish of allDishes) {
    for (const region of dish.regions) {
      if (region.country && region.locality) {
        const label = `${region.country}（${region.locality}）`
        localityMap.set(label, (localityMap.get(label) ?? 0) + 1)
        countryForLocalityMap.set(region.country, (countryForLocalityMap.get(region.country) ?? 0) + 1)
      } else if (region.country) {
        countryOnlyMap.set(region.country, (countryOnlyMap.get(region.country) ?? 0) + 1)
      } else if (region.area) {
        areaMap.set(region.area, (areaMap.get(region.area) ?? 0) + 1)
      }
    }
  }

  const allCountries = new Set([...countryOnlyMap.keys(), ...countryForLocalityMap.keys()])
  const countryGroups: CountryGroup[] = [...allCountries]
    .map((country) => {
      const countryCount = countryOnlyMap.get(country) ?? 0
      const localities = [...localityMap.entries()]
        .filter(([label]) => label.startsWith(`${country}（`))
        .sort((a, b) => b[1] - a[1])
        .map(([region, count]) => ({ region, count }))
      return { country, countryCount, localities }
    })
    .sort((a, b) => {
      const aTotal = a.countryCount + a.localities.reduce((s, l) => s + l.count, 0)
      const bTotal = b.countryCount + b.localities.reduce((s, l) => s + l.count, 0)
      return bTotal - aTotal
    })

  const areas = [...areaMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([region, count]) => ({ region, count }))

  const allRegions: Section[] = [
    ...countryGroups.map(({ country, countryCount }) => ({ region: country, count: countryCount })).filter(({ count }) => count > 0),
    ...countryGroups.flatMap(({ localities }) => localities),
    ...areas,
  ]

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
      url: `https://rdish.reload.co.jp${countryPath(region)}`,
    })),
  }

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
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#7a4f2a", marginBottom: "1rem" }}>
          国
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {countryGroups.map(({ country, countryCount, localities }) => (
            <div key={country}>
              {countryCount > 0 ? (
                <Link href={countryPath(country)} style={{ ...linkStyle, fontWeight: 600 }}>
                  {country}
                  {" "}<span style={countStyle}>{countryCount}</span>
                </Link>
              ) : (
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#7a4f2a" }}>
                  {country}
                </span>
              )}
              {localities.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem 0.75rem", marginTop: "0.375rem", paddingLeft: "1rem" }}>
                  {localities.map(({ region, count }) => (
                    <Link key={region} href={countryPath(region)} style={linkStyle}>
                      {region.replace(`${country}（`, "").replace(/）$/, "")}
                      {" "}<span style={countStyle}>{count}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {areas.length > 0 && (
        <section>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#7a4f2a", marginBottom: "0.75rem" }}>
            地域
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {areas.map(({ region, count }) => (
              <Link key={region} href={countryPath(region)} style={linkStyle}>
                {region}
                <span style={countStyle}>{count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

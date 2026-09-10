import Link from "next/link"
import type { Metadata } from "next"
import { Breadcrumb } from "../../components/elements/Breadcrumb"
import { allDishes } from "../../lib/dishes"
import { regionLabel } from "../../lib/region"
import { countryPath } from "../../lib/taxonomy"

export const metadata: Metadata = {
  title: "国・地域別 料理一覧",
  description:
    "国・地域別に料理・食材・調理法を探せる料理図鑑 RDish。フランス、イタリア、スペインなど世界各国の料理を収録。",
  alternates: { canonical: "/countries/" },
  openGraph: {
    title: "国・地域別 料理一覧",
    url: "/countries/",
    images: [
      {
        url: "/countries/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "国・地域別 料理一覧 | RDish",
      },
    ],
  },
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

type PrefectureGroup = {
  prefecture: string
  prefLabel: string
  prefCount: number
  localities: Section[]
}

type CountryGroup = {
  country: string
  countryCount: number
  prefectureGroups: PrefectureGroup[]
  areas: Section[]
}

export default function CountriesPage() {
  const countryOnlyMap = new Map<string, number>()
  const prefOnlyMap = new Map<string, number>()
  const localityMap = new Map<string, number>()
  const countryAreaMap = new Map<string, number>()
  const countryForPrefMap = new Map<string, number>()
  const areaMap = new Map<string, number>()

  for (const dish of allDishes) {
    for (const region of dish.regions) {
      if (region.country && region.prefecture && region.locality) {
        const label = regionLabel(region)
        localityMap.set(label, (localityMap.get(label) ?? 0) + 1)
        countryForPrefMap.set(
          region.country,
          (countryForPrefMap.get(region.country) ?? 0) + 1
        )
      } else if (region.country && region.prefecture) {
        const label = regionLabel(region)
        prefOnlyMap.set(label, (prefOnlyMap.get(label) ?? 0) + 1)
        countryForPrefMap.set(
          region.country,
          (countryForPrefMap.get(region.country) ?? 0) + 1
        )
      } else if (region.country && region.area) {
        const label = regionLabel(region)
        countryAreaMap.set(label, (countryAreaMap.get(label) ?? 0) + 1)
        countryForPrefMap.set(
          region.country,
          (countryForPrefMap.get(region.country) ?? 0) + 1
        )
      } else if (region.country) {
        countryOnlyMap.set(
          region.country,
          (countryOnlyMap.get(region.country) ?? 0) + 1
        )
      } else if (region.area) {
        areaMap.set(region.area, (areaMap.get(region.area) ?? 0) + 1)
      }
    }
  }

  const allCountries = new Set([
    ...countryOnlyMap.keys(),
    ...countryForPrefMap.keys(),
  ])
  const countryGroups: CountryGroup[] = [...allCountries]
    .map((country) => {
      const countryCount = countryOnlyMap.get(country) ?? 0
      const prefixLabel = `${country}（`
      const prefectures = new Set(
        [...prefOnlyMap.keys(), ...localityMap.keys()]
          .filter((label) => label.startsWith(prefixLabel))
          .map((label) => label.slice(prefixLabel.length, -1).split(" ")[0])
      )
      const prefectureGroups: PrefectureGroup[] = [...prefectures]
        .map((prefecture) => {
          const prefLabel = `${country}（${prefecture}）`
          const prefCount = prefOnlyMap.get(prefLabel) ?? 0
          const localities = [...localityMap.entries()]
            .filter(([label]) => label.startsWith(`${country}（${prefecture} `))
            .sort((a, b) => b[1] - a[1])
            .map(([region, count]) => ({ region, count }))
          return { prefecture, prefLabel, prefCount, localities }
        })
        .sort((a, b) => {
          const aTotal =
            a.prefCount + a.localities.reduce((s, l) => s + l.count, 0)
          const bTotal =
            b.prefCount + b.localities.reduce((s, l) => s + l.count, 0)
          return bTotal - aTotal
        })
      const areas = [...countryAreaMap.entries()]
        .filter(([label]) => label.startsWith(prefixLabel))
        .sort((a, b) => b[1] - a[1])
        .map(([region, count]) => ({
          region: region.slice(prefixLabel.length, -1),
          count,
        }))
      return { country, countryCount, prefectureGroups, areas }
    })
    .sort((a, b) => {
      const total = (g: CountryGroup) =>
        g.countryCount +
        g.prefectureGroups.reduce(
          (s, p) =>
            s + p.prefCount + p.localities.reduce((s2, l) => s2 + l.count, 0),
          0
        ) +
        g.areas.reduce((s, a2) => s + a2.count, 0)
      return total(b) - total(a)
    })

  const areas = [...areaMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([region, count]) => ({ region, count }))

  const allRegions: Section[] = [
    ...countryGroups
      .map(({ country, countryCount }) => ({
        region: country,
        count: countryCount,
      }))
      .filter(({ count }) => count > 0),
    ...countryGroups.flatMap(({ country, areas: countryAreas }) =>
      countryAreas.map(({ region, count }) => ({
        region: `${country}（${region}）`,
        count,
      }))
    ),
    ...countryGroups.flatMap(({ prefectureGroups }) =>
      prefectureGroups.map(({ prefLabel, prefCount }) => ({
        region: prefLabel,
        count: prefCount,
      }))
    ),
    ...countryGroups.flatMap(({ prefectureGroups }) =>
      prefectureGroups.flatMap(({ localities }) => localities)
    ),
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
      <Breadcrumb items={[{ label: "国・地域", href: "/countries/" }]} />
      <h1
        style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}
      >
        国・地域から探す
      </h1>
      <p
        style={{
          color: "#7a6655",
          fontSize: "0.9375rem",
          lineHeight: 1.8,
          margin: "0 0 1.5rem",
        }}
      >
        フランス、イタリア、中国、タイなど世界各国・地域の料理を国別に収録。気になる国をタップすると、その国の料理一覧・食材・調理法がまとめて見つかる。
      </p>

      <section style={{ marginBottom: "2rem" }}>
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            color: "#7a4f2a",
            marginBottom: "1rem",
          }}
        >
          国
        </h2>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          {countryGroups.map(
            ({
              country,
              countryCount,
              prefectureGroups,
              areas: countryAreas,
            }) => {
              const inlinePrefs = prefectureGroups.filter(
                (p) => p.localities.length === 0
              )
              const nestedPrefs = prefectureGroups.filter(
                (p) => p.localities.length > 0
              )
              return (
                <div key={country}>
                  {countryCount > 0 ? (
                    <Link
                      href={countryPath(country)}
                      style={{ ...linkStyle, fontWeight: 600 }}
                    >
                      {country} <span style={countStyle}>{countryCount}</span>
                    </Link>
                  ) : (
                    <span
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "#7a4f2a",
                      }}
                    >
                      {country}
                    </span>
                  )}
                  {(inlinePrefs.length > 0 || countryAreas.length > 0) && (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.375rem 0.75rem",
                        marginTop: "0.375rem",
                        paddingLeft: "1rem",
                      }}
                    >
                      {inlinePrefs.map(
                        ({ prefecture, prefLabel, prefCount }) => (
                          <Link
                            key={prefecture}
                            href={countryPath(prefLabel)}
                            style={linkStyle}
                          >
                            {prefecture}{" "}
                            <span style={countStyle}>{prefCount}</span>
                          </Link>
                        )
                      )}
                      {countryAreas.map(({ region, count }) => (
                        <Link
                          key={region}
                          href={countryPath(`${country}（${region}）`)}
                          style={linkStyle}
                        >
                          {region} <span style={countStyle}>{count}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                  {nestedPrefs.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                        marginTop: "0.375rem",
                        paddingLeft: "1rem",
                      }}
                    >
                      {nestedPrefs.map(
                        ({ prefecture, prefLabel, prefCount, localities }) => (
                          <div key={prefecture}>
                            {prefCount > 0 ? (
                              <Link
                                href={countryPath(prefLabel)}
                                style={{ ...linkStyle, fontWeight: 600 }}
                              >
                                {prefecture}{" "}
                                <span style={countStyle}>{prefCount}</span>
                              </Link>
                            ) : (
                              <span
                                style={{
                                  fontSize: "0.875rem",
                                  fontWeight: 600,
                                  color: "#7a4f2a",
                                }}
                              >
                                {prefecture}
                              </span>
                            )}
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "0.375rem 0.75rem",
                                marginTop: "0.375rem",
                                paddingLeft: "1rem",
                              }}
                            >
                              {localities.map(({ region, count }) => (
                                <Link
                                  key={region}
                                  href={countryPath(region)}
                                  style={linkStyle}
                                >
                                  {region
                                    .replace(`${country}（${prefecture} `, "")
                                    .replace(/）$/, "")}{" "}
                                  <span style={countStyle}>{count}</span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              )
            }
          )}
        </div>
      </section>

      {areas.length > 0 && (
        <section>
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "#7a4f2a",
              marginBottom: "0.75rem",
            }}
          >
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

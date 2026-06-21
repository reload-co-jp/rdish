import Link from "next/link"
import { notFound } from "next/navigation"
import { Breadcrumb } from "../../../components/elements/Breadcrumb"
import { CountryPageContent, countryTotalPages, paginateCountryDishes } from "../../../components/features/CountryPageContent"
import { allDishes } from "../../../lib/dishes"
import { dishMatchesRegion } from "../../../lib/region"
import { buildItemListJsonLd, categoryPath, countryItems, countryPath, tagPath, taxonomyById } from "../../../lib/taxonomy"

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
  const countryResults = allDishes.filter((d) => dishMatchesRegion(d, item.label))
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
  const results = allDishes.filter((d) => dishMatchesRegion(d, item.label))
  if (results.length === 0) notFound()
  const description = item.description ?? `${item.label}の料理・食材・調理法をまとめています。`
  const localities = countryItems.filter((c) => c.label.startsWith(`${item.label}（`))

  const categoryCounts = new Map<string, number>()
  const tagCounts = new Map<string, number>()
  for (const dish of results) {
    categoryCounts.set(dish.category, (categoryCounts.get(dish.category) ?? 0) + 1)
    for (const tag of dish.tags) {
      if (tag === `${item.label}料理`) continue
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
    }
  }
  const topCategories = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1])
  const topTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)

  const total = countryTotalPages(results.length)
  const pageDishes = paginateCountryDishes(results, 1)

  const jsonLd = buildItemListJsonLd(`${item.label}の料理一覧`, `/countries/${item.id}/`, pageDishes)

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumb items={[{ label: "国・地域", href: "/countries/" }, { label: item.label }]} />
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.375rem" }}>
        {item.label}の料理一覧
      </h1>
      <p style={{ color: "#aaa", fontSize: "0.875rem", marginBottom: "0.75rem" }}>
        全{results.length}件{total > 1 ? ` / ${total}ページ中 1ページ目` : ""}
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
      {(topCategories.length > 1 || topTags.length > 0) && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.5rem" }}>
          {topCategories.length > 1 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
              <span style={{ color: "#a89080", fontSize: "0.75rem" }}>カテゴリ:</span>
              {topCategories.map(([category, count]) => (
                <Link
                  key={category}
                  href={categoryPath(category)}
                  style={{
                    color: "#7a4f2a",
                    fontSize: "0.8125rem",
                    background: "#f0e6d6",
                    borderRadius: "1rem",
                    padding: "0.125rem 0.625rem",
                    textDecoration: "none",
                  }}
                >
                  {category} {count}
                </Link>
              ))}
            </div>
          )}
          {topTags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
              <span style={{ color: "#a89080", fontSize: "0.75rem" }}>タグ:</span>
              {topTags.map(([tag, count]) => (
                <Link
                  key={tag}
                  href={tagPath(tag)}
                  style={{
                    color: "#7a4f2a",
                    fontSize: "0.8125rem",
                    background: "#faf7f2",
                    border: "1px solid #e8ddd0",
                    borderRadius: "1rem",
                    padding: "0.125rem 0.625rem",
                    textDecoration: "none",
                  }}
                >
                  {tag} {count}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
      <CountryPageContent
        countryId={item.id}
        dishes={pageDishes}
        page={1}
        totalCount={results.length}
        offset={0}
      />
    </div>
  )
}

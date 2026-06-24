import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Breadcrumb } from "../../../../../components/elements/Breadcrumb"
import {
  COUNTRY_PAGE_SIZE,
  CountryPageContent,
  countryPageUrl,
  countryTotalPages,
  paginateCountryDishes,
} from "../../../../../components/features/CountryPageContent"
import { allDishes } from "../../../../../lib/dishes"
import { dishMatchesRegion } from "../../../../../lib/region"
import { buildItemListJsonLd, countryItems, taxonomyById } from "../../../../../lib/taxonomy"

export function generateStaticParams() {
  return countryItems.flatMap(({ id, label }) => {
    const count = allDishes.filter((d) => dishMatchesRegion(d, label)).length
    const total = countryTotalPages(count)
    return Array.from({ length: Math.max(total - 1, 0) }, (_, i) => ({
      country: id,
      page: String(i + 2),
    }))
  })
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; page: string }>
}): Promise<Metadata> {
  const { country, page: pageStr } = await params
  const item = taxonomyById(countryItems, country)
  if (!item) notFound()
  const page = Number(pageStr)
  const countryResults = allDishes.filter((d) => dishMatchesRegion(d, item.label))
  const count = countryResults.length
  const total = countryTotalPages(count)
  if (isNaN(page) || page < 2 || page > total) return {}
  const title = `${item.label}の料理一覧（${page}ページ目・全${count}件）`
  const countryDesc = item.description ?? `${item.label}の料理・食材・調理法をまとめています。`
  const description = `${countryDesc} ${page}ページ目（全${total}ページ）。外食メニューを調べるなら RDish。`
  return {
    title,
    description,
    alternates: { canonical: countryPageUrl(item.id, page) },
    openGraph: { title, description, url: countryPageUrl(item.id, page) },
  }
}

export default async function CountryPageN({
  params,
}: {
  params: Promise<{ country: string; page: string }>
}) {
  const { country, page: pageStr } = await params
  const item = taxonomyById(countryItems, country)
  if (!item) notFound()
  const page = Number(pageStr)
  const results = allDishes.filter((d) => dishMatchesRegion(d, item.label))
  const total = countryTotalPages(results.length)
  if (isNaN(page) || page < 2 || page > total) notFound()

  const offset = (page - 1) * COUNTRY_PAGE_SIZE
  const pageDishes = paginateCountryDishes(results, page)

  const jsonLd = buildItemListJsonLd(
    `${item.label}の料理一覧 ${page}ページ目`,
    countryPageUrl(item.id, page),
    pageDishes,
    offset,
  )

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumb
        items={[
          { label: "国・地域", href: "/countries/" },
          { label: item.label, href: `/countries/${item.id}/` },
          { label: `${page}ページ目`, href: countryPageUrl(item.id, page) },
        ]}
      />
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.375rem" }}>
        {item.label}の料理一覧
      </h1>
      <p style={{ color: "#aaa", fontSize: "0.875rem", marginBottom: "0.75rem" }}>
        全{results.length}件 / {total}ページ中 {page}ページ目
      </p>
      <CountryPageContent
        countryId={item.id}
        dishes={pageDishes}
        page={page}
        totalCount={results.length}
        offset={offset}
      />
    </div>
  )
}

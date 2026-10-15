import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Breadcrumb } from "../../../../components/elements/Breadcrumb"
import {
  ComparisonsPageContent,
  paginateComparisons,
  totalPages,
} from "../../../../components/features/ComparisonsPageContent"
import {
  allComparisons,
  comparePageUrl,
  comparisonPath,
} from "../../../../lib/comparisons"

const SITE_URL = "https://rdish.reload.co.jp"

const count = allComparisons.length

export function generateStaticParams() {
  const total = totalPages(count)
  return Array.from({ length: Math.max(total - 1, 0) }, (_, i) => ({
    page: String(i + 2),
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>
}): Promise<Metadata> {
  const { page: pageStr } = await params
  const page = Number(pageStr)
  const total = totalPages(count)
  if (isNaN(page) || page < 2 || page > total) return {}
  const title = `料理の違い比較一覧（${page}ページ目）`
  const description = `似ている料理・食材・調理法の違いを比較。${page}ページ目（全${total}ページ・${count}組）。`
  return {
    title,
    description,
    alternates: { canonical: comparePageUrl(page) },
    openGraph: { title, description, url: comparePageUrl(page) },
  }
}

export default async function ComparePaginatedPage({
  params,
}: {
  params: Promise<{ page: string }>
}) {
  const { page: pageStr } = await params
  const page = Number(pageStr)
  const total = totalPages(count)
  if (isNaN(page) || page < 2 || page > total) notFound()
  const comparisons = paginateComparisons(allComparisons, page)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `料理の違い比較一覧（${page}ページ目）`,
    url: `${SITE_URL}${comparePageUrl(page)}`,
    hasPart: comparisons.map((comparison) => ({
      "@type": "WebPage",
      name: `${comparison.a.name}と${comparison.b.name}の違い`,
      url: `${SITE_URL}${comparisonPath(comparison.slug)}`,
    })),
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb
        items={[
          { label: "違いを比較", href: "/compare/" },
          { label: `${page}ページ目`, href: comparePageUrl(page) },
        ]}
      />
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: 800,
          marginBottom: "0.375rem",
        }}
      >
        料理の違い比較
      </h1>
      <p
        style={{
          color: "var(--c-text-sub)",
          fontSize: "0.875rem",
          marginBottom: "1.5rem",
        }}
      >
        全{count}組（{page} / {total}ページ）
      </p>
      <ComparisonsPageContent
        comparisons={comparisons}
        page={page}
        totalCount={count}
      />
    </div>
  )
}

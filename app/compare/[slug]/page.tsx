import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Breadcrumb } from "../../../components/elements/Breadcrumb"
import { ComparisonDetail } from "../../../components/features/ComparisonDetail"
import {
  allComparisons,
  comparisonBySlug,
  comparisonPath,
  comparisonTitle,
} from "../../../lib/comparisons"

const SITE_URL = "https://rdish.reload.co.jp"

export function generateStaticParams() {
  return allComparisons.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const comparison = comparisonBySlug(slug)
  if (!comparison) return {}
  const path = comparisonPath(comparison.slug)
  const title = `${comparisonTitle(comparison)}は？`
  const description =
    `${comparison.a.name}と${comparison.b.name}の違いを比較。${comparison.aDifference}`
      .slice(0, 160)
      .trimEnd()
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type: "article",
      images: [
        {
          url: `${path}opengraph-image.png`,
          width: 1200,
          height: 630,
          alt: `${comparisonTitle(comparison)} | RDish`,
        },
      ],
    },
  }
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const comparison = comparisonBySlug(slug)
  if (!comparison) notFound()
  const { a, b, aDifference, bDifference } = comparison
  const path = comparisonPath(comparison.slug)

  // 「AとBの違いは？」は検索クエリそのものなので FAQPage で構造化する
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: `${SITE_URL}${path}`,
    name: comparisonTitle(comparison),
    mainEntity: [
      {
        "@type": "Question",
        name: `${a.name}と${b.name}の違いは？`,
        acceptedAnswer: { "@type": "Answer", text: aDifference },
      },
      {
        "@type": "Question",
        name: `${b.name}と${a.name}の違いは？`,
        acceptedAnswer: { "@type": "Answer", text: bDifference },
      },
      {
        "@type": "Question",
        name: `${a.name}とは？`,
        acceptedAnswer: { "@type": "Answer", text: a.summary },
      },
      {
        "@type": "Question",
        name: `${b.name}とは？`,
        acceptedAnswer: { "@type": "Answer", text: b.summary },
      },
    ],
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
          { label: comparisonTitle(comparison), href: path },
        ]}
      />
      <ComparisonDetail comparison={comparison} />
    </div>
  )
}

import Link from "next/link"
import { notFound } from "next/navigation"
import { Breadcrumb } from "../../../components/elements/Breadcrumb"
import {
  CalloutSection,
  ComparisonSection,
  HistorySection,
  RegionSection,
  SourcesSection,
} from "../../../components/features/article/ArticleSections"
import { allArticles, relatedDishesOf } from "../../../lib/articles"
import { buildArticleJsonLd } from "../../../lib/articleJsonLd"
import { allDishes } from "../../../lib/dishes"

export function generateStaticParams() {
  return allArticles.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = allArticles.find((a) => a.slug === slug)
  if (!article) return {}
  const title = article.subtitle
    ? `${article.title}——${article.subtitle}`
    : article.title
  const relatedDishes = relatedDishesOf(article, allDishes)
  const firstImage = relatedDishes.find((d) => d.images && d.images.length > 0)?.images?.[0]
  return {
    title,
    description: article.description,
    alternates: { canonical: `/articles/${article.slug}/` },
    openGraph: {
      title,
      description: article.description,
      url: `/articles/${article.slug}/`,
      type: "article",
      publishedTime: article.publishedAt,
      ...(article.updatedAt ? { modifiedTime: article.updatedAt } : {}),
      ...(firstImage ? { images: [{ url: firstImage }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: article.description,
    },
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = allArticles.find((a) => a.slug === slug)
  if (!article) notFound()

  const relatedDishes = relatedDishesOf(article, allDishes)
  const articleLd = buildArticleJsonLd(article, relatedDishes)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <Breadcrumb
        items={[
          { label: "記事", href: "/articles/" },
          { label: article.title, href: `/articles/${article.slug}/` },
        ]}
      />
      <article>
        <header style={{ marginBottom: "2rem" }}>
          <p style={{ fontSize: "0.75rem", color: "#a89080", marginBottom: "0.5rem" }}>
            {article.publishedAt}
          </p>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, lineHeight: 1.3, color: "#2d1f0e", marginBottom: "0.375rem" }}>
            {article.title}
          </h1>
          {article.subtitle && (
            <p style={{ fontSize: "1.125rem", color: "#7a6655", fontWeight: 600, marginBottom: "0.75rem" }}>
              {article.subtitle}
            </p>
          )}
          <p style={{ fontSize: "0.9375rem", color: "#5a4a3a", lineHeight: 1.7, borderLeft: "3px solid #e8ddd0", paddingLeft: "0.875rem" }}>
            {article.intro}
          </p>
        </header>

        {article.history && article.history.length > 0 && (
          <HistorySection entries={article.history} />
        )}

        {article.regions.map((region) => (
          <RegionSection key={region.heading} region={region} allDishes={allDishes} />
        ))}

        <ComparisonSection rows={article.comparison} />

        {article.callouts.map((callout) => (
          <CalloutSection key={callout.heading} callout={callout} />
        ))}

        {article.sources && article.sources.length > 0 && (
          <SourcesSection sources={article.sources} />
        )}

        {article.relatedDishIds.length > 0 && (
          <section style={{ marginTop: "2rem" }}>
            <h2
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#a89080",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "0.75rem",
              }}
            >
              関連料理を調べる
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {article.relatedDishIds.map((id) => {
                const dish = allDishes.find((d) => d.id === id)
                return (
                  <Link
                    key={id}
                    href={`/dishes/${id}/`}
                    style={{
                      fontSize: "0.875rem",
                      color: "#7a6655",
                      background: "#f0e6d6",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "0.375rem",
                      textDecoration: "none",
                    }}
                  >
                    {dish?.name ?? id}
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        <section style={{ marginTop: "1.5rem" }}>
          <Link
            href="/articles/"
            style={{ fontSize: "0.875rem", color: "#b45309", textDecoration: "none" }}
          >
            → 他の記事も読む
          </Link>
        </section>
      </article>
    </>
  )
}

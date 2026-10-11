import Link from "next/link"
import { notFound } from "next/navigation"
import { Breadcrumb } from "../../../components/elements/Breadcrumb"
import { Photo } from "../../../components/elements/Photo"
import { articleCover, formatDate } from "../../../lib/editorial"
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = allArticles.find((a) => a.slug === slug)
  if (!article) return {}
  const title = article.subtitle
    ? `${article.title}——${article.subtitle}`
    : article.title
  const relatedDishes = relatedDishesOf(article, allDishes)
  const firstImage = relatedDishes.find((d) => d.images && d.images.length > 0)
    ?.images?.[0]
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

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = allArticles.find((a) => a.slug === slug)
  if (!article) notFound()

  const relatedDishes = relatedDishesOf(article, allDishes)
  const articleLd = buildArticleJsonLd(article, relatedDishes)
  const cover = articleCover(article)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <div className="wide">
        <Breadcrumb
          items={[
            { label: "記事", href: "/articles/" },
            { label: article.title, href: `/articles/${article.slug}/` },
          ]}
        />
      </div>
      <article className="wide">
        <header className="article-hero">
          <div className="article-hero__head">
            <span className="eyebrow">
              Stories
              <span className="meta" style={{ letterSpacing: "0.08em" }}>
                {formatDate(article.publishedAt)}
                {article.updatedAt &&
                  article.updatedAt !== article.publishedAt &&
                  ` 更新 ${formatDate(article.updatedAt)}`}
              </span>
            </span>
            <h1>{article.title}</h1>
            {article.subtitle && (
              <p className="article-hero__sub">{article.subtitle}</p>
            )}
          </div>
          {cover && (
            <figure>
              <Photo
                src={cover.src}
                alt={`${cover.dish.name}の料理写真`}
                sizes="100vw"
                priority
              />
              <figcaption className="meta">{cover.dish.name}</figcaption>
            </figure>
          )}
        </header>

        <div className="article-body">
          <p className="article-lead">{article.intro}</p>

          {article.history && article.history.length > 0 && (
            <HistorySection entries={article.history} />
          )}

          {article.regions.map((region) => (
            <RegionSection
              key={region.heading}
              region={region}
              allDishes={allDishes}
            />
          ))}

          <ComparisonSection rows={article.comparison} />

          {article.callouts.map((callout) => (
            <CalloutSection key={callout.heading} callout={callout} />
          ))}

          {article.sources && article.sources.length > 0 && (
            <SourcesSection sources={article.sources} />
          )}
        </div>

        {relatedDishes.length > 0 && (
          <section className="section">
            <div className="section-head">
              <div className="section-head__title">
                <span className="eyebrow">Related</span>
                <h2>関連料理を調べる</h2>
              </div>
            </div>
            <div className="entries entries--even">
              {relatedDishes.map((dish) => (
                <Link
                  key={dish.id}
                  href={`/dishes/${dish.id}/`}
                  className="story"
                >
                  <Photo
                    src={dish.images?.[0]}
                    alt={`${dish.name}の料理写真`}
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="story__body">
                    <span className="meta">{dish.category}</span>
                    <h3 className="story__title">{dish.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section style={{ marginTop: "var(--sp-12)", textAlign: "center" }}>
          <Link href="/articles/" className="more-link">
            他の記事も読む →
          </Link>
        </section>
      </article>
    </>
  )
}

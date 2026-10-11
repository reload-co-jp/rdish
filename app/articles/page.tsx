import type { Metadata } from "next"
import Link from "next/link"
import { Breadcrumb } from "../../components/elements/Breadcrumb"
import { Photo } from "../../components/elements/Photo"
import { articleCover, formatDate } from "../../lib/editorial"
import { allArticles as articles } from "../../lib/articles"
import { organizationJsonLd, organizationRef } from "../../lib/organization"

const SITE_URL = "https://rdish.reload.co.jp"

export const metadata: Metadata = {
  title: "記事",
  description:
    "料理にまつわる読み物。各地の包み料理の違いなど、料理の背景を掘り下げる記事。",
  alternates: { canonical: "/articles/" },
  openGraph: {
    title: "記事",
    description:
      "料理にまつわる読み物。各地の包み料理の違いなど、料理の背景を掘り下げる記事。",
    url: "/articles/",
    type: "website",
  },
}

const [lead, ...rest] = [...articles].sort((a, b) =>
  b.publishedAt.localeCompare(a.publishedAt)
)

export default function ArticlesPage() {
  const itemListLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "記事一覧",
        url: `${SITE_URL}/articles/`,
        inLanguage: "ja",
        publisher: organizationRef,
        hasPart: articles.map((a) => ({
          "@type": "Article",
          headline: a.subtitle ? `${a.title}——${a.subtitle}` : a.title,
          description: a.description,
          datePublished: a.publishedAt,
          url: `${SITE_URL}/articles/${a.slug}/`,
        })),
      },
      organizationJsonLd,
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
      <div className="wide">
        <Breadcrumb items={[{ label: "記事", href: "/articles/" }]} />
        <div className="masthead" style={{ paddingTop: "var(--sp-4)" }}>
          <div className="section-head__title">
            <span className="eyebrow">Stories</span>
            <h1>読みもの</h1>
          </div>
          <p>
            料理の背景や地域ごとの違いを掘り下げる記事。全{articles.length}本。
          </p>
        </div>
        {lead && (
          <section className="hero" style={{ marginTop: "var(--sp-8)" }}>
            <Link
              href={`/articles/${lead.slug}/`}
              className="story"
              tabIndex={-1}
              aria-hidden="true"
            >
              <Photo
                src={articleCover(lead)?.src}
                alt=""
                sizes="(max-width: 768px) 100vw, 60vw"
                priority
              />
            </Link>
            <div className="hero__text">
              <div className="hero__issue">
                <span className="eyebrow">Latest</span>
                <span className="meta">{formatDate(lead.publishedAt)}</span>
              </div>
              <h2
                className="hero__title serif"
                style={{ fontSize: "var(--fs-2xl)" }}
              >
                <Link
                  href={`/articles/${lead.slug}/`}
                  style={{ textDecoration: "none" }}
                >
                  {lead.title}
                </Link>
              </h2>
              {lead.subtitle && <p className="hero__sub">{lead.subtitle}</p>}
              <p className="hero__lead clamp-3">{lead.description}</p>
            </div>
          </section>
        )}
        <div className="features section">
          {rest.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}/`}
              className="story"
            >
              <Photo
                src={articleCover(article)?.src}
                alt=""
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <article className="story__body">
                <span className="meta">{formatDate(article.publishedAt)}</span>
                <h2 className="story__title">{article.title}</h2>
                {article.subtitle && (
                  <p
                    className="story__desc"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {article.subtitle}
                  </p>
                )}
                <p className="story__desc clamp-2">{article.description}</p>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}

import type { Metadata } from "next"
import Link from "next/link"
import { Breadcrumb } from "../../components/elements/Breadcrumb"
import { allArticles as articles } from "../../lib/articles"

const SITE_URL = "https://rdish.reload.co.jp"

export const metadata: Metadata = {
  title: "記事",
  description: "料理にまつわる読み物。各地の包み料理の違いなど、料理の背景を掘り下げる記事。",
  alternates: { canonical: "/articles/" },
  openGraph: {
    title: "記事",
    description: "料理にまつわる読み物。各地の包み料理の違いなど、料理の背景を掘り下げる記事。",
    url: "/articles/",
    type: "website",
  },
}

export default function ArticlesPage() {
  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "記事一覧",
    url: `${SITE_URL}/articles/`,
    inLanguage: "ja",
    publisher: { "@type": "Organization", name: "RDish", url: SITE_URL },
    hasPart: articles.map((a) => ({
      "@type": "Article",
      headline: a.subtitle ? `${a.title}——${a.subtitle}` : a.title,
      description: a.description,
      datePublished: a.publishedAt,
      url: `${SITE_URL}/articles/${a.slug}/`,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
      <Breadcrumb items={[{ label: "記事", href: "/articles/" }]} />
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "1.5rem", color: "#2d1f0e" }}>
        記事
      </h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/articles/${article.slug}/`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <article
              style={{
                background: "#faf7f2",
                border: "1px solid #e8ddd0",
                borderRadius: "0.5rem",
                padding: "1rem 1.25rem",
              }}
            >
              <p style={{ fontSize: "0.7rem", color: "#a89080", marginBottom: "0.375rem" }}>
                {article.publishedAt}
              </p>
              <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "#2d1f0e", marginBottom: "0.25rem" }}>
                {article.title}
                {article.subtitle && (
                  <span style={{ color: "#7a6655", fontWeight: 400 }}>——{article.subtitle}</span>
                )}
              </h2>
              <p style={{ fontSize: "0.8125rem", color: "#7a6655", lineHeight: 1.6, margin: 0 }}>
                {article.description}
              </p>
            </article>
          </Link>
        ))}
      </div>
    </>
  )
}

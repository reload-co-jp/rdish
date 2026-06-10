import Image from "next/image"
import { FC } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Breadcrumb } from "../../../components/elements/Breadcrumb"
import articlesData from "../../../data/articles.json"
import dishesData from "../../../data/dishes.json"
import type {
  Article,
  ArticleDishEntry,
  ArticleRegion,
  ArticleCallout,
  ArticleComparisonRow,
  ArticleHistoryEntry,
  ArticleSource,
} from "../../../types/article"
import type { DishItem } from "../../../types/dish"

const articles = articlesData as Article[]
const dishes = dishesData as DishItem[]

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = articles.find((a) => a.slug === slug)
  if (!article) return {}
  const title = article.subtitle
    ? `${article.title}——${article.subtitle}`
    : article.title
  const relatedDishes = article.relatedDishIds
    .map((id) => dishes.find((d) => d.id === id))
    .filter(Boolean) as DishItem[]
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

const sectionHeadingStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 700,
  color: "#a89080",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  marginBottom: "1rem",
  paddingBottom: "0.375rem",
  borderBottom: "1px solid #e8ddd0",
}

const labelStyle: React.CSSProperties = {
  fontSize: "0.7rem",
  fontWeight: 700,
  color: "#a89080",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  minWidth: "4.5rem",
  paddingTop: "0.125rem",
  flexShrink: 0,
}

const valueStyle: React.CSSProperties = {
  fontSize: "0.875rem",
  color: "#2d1f0e",
  lineHeight: 1.6,
}

const PropertyList: FC<{ items: { label: string; value: string }[] }> = ({ items }) => (
  <dl style={{ margin: "0.5rem 0 0", display: "flex", flexDirection: "column", gap: "0.375rem" }}>
    {items.map((item) => (
      <div key={item.label} style={{ display: "flex", gap: "0.75rem" }}>
        <dt style={labelStyle}>{item.label}</dt>
        <dd style={{ ...valueStyle, margin: 0 }}>{item.value}</dd>
      </div>
    ))}
  </dl>
)

const DifferenceList: FC<{ items: { label: string; value: string }[] }> = ({ items }) => (
  <div style={{ marginTop: "0.75rem" }}>
    <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#a89080", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.375rem" }}>
      他との違い
    </p>
    <dl style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      {items.map((item) => (
        <div key={item.label} style={{ display: "flex", gap: "0.625rem", alignItems: "baseline" }}>
          <dt style={{ fontSize: "0.7rem", fontWeight: 700, color: "#b87a50", minWidth: "5rem", flexShrink: 0 }}>
            {item.label}
          </dt>
          <dd style={{ fontSize: "0.8125rem", color: "#5a4a3a", margin: 0, lineHeight: 1.55 }}>
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  </div>
)

const DishEntry: FC<{ entry: ArticleDishEntry; allDishes: DishItem[] }> = ({ entry, allDishes }) => {
  const dish = entry.dishId ? allDishes.find((d) => d.id === entry.dishId) : null
  const image = dish?.images?.[0]

  return (
    <div
      style={{
        marginBottom: "1.5rem",
        paddingBottom: "1.5rem",
        borderBottom: "1px solid #f0e6d6",
      }}
    >
      <div style={{ display: "flex", gap: "0.875rem", alignItems: "flex-start" }}>
        {image && (
          <div style={{ flexShrink: 0 }}>
            <Link href={`/dishes/${entry.dishId}/`} style={{ display: "block" }}>
              <Image
                src={image}
                alt={dish?.name ?? entry.heading}
                width={96}
                height={72}
                style={{
                  borderRadius: "0.375rem",
                  objectFit: "cover",
                  display: "block",
                  border: "1px solid #e8ddd0",
                }}
              />
            </Link>
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "#2d1f0e",
              marginBottom: "0.25rem",
            }}
          >
            {entry.dishId ? (
              <Link
                href={`/dishes/${entry.dishId}/`}
                style={{ color: "#2d1f0e", textDecoration: "underline", textDecorationColor: "#e8ddd0" }}
              >
                {entry.heading}
              </Link>
            ) : (
              entry.heading
            )}
          </h3>
          <PropertyList items={entry.properties} />
        </div>
      </div>

      {entry.differences && entry.differences.length > 0 && (
        <DifferenceList items={entry.differences} />
      )}

      {entry.note && (
        <p
          style={{
            marginTop: "0.625rem",
            fontSize: "0.8125rem",
            color: "#7a6655",
            lineHeight: 1.65,
            borderLeft: "2px solid #e8ddd0",
            paddingLeft: "0.75rem",
          }}
        >
          {entry.note}
        </p>
      )}
    </div>
  )
}

const RegionSection: FC<{ region: ArticleRegion; allDishes: DishItem[] }> = ({ region, allDishes }) => (
  <section style={{ marginBottom: "2rem" }}>
    <h2 style={sectionHeadingStyle}>{region.heading}</h2>
    {region.dishes.map((dish) => (
      <DishEntry key={dish.heading} entry={dish} allDishes={allDishes} />
    ))}
  </section>
)

const HistorySection: FC<{ entries: ArticleHistoryEntry[] }> = ({ entries }) => (
  <section style={{ marginBottom: "2.5rem" }}>
    <h2 style={sectionHeadingStyle}>歴史と伝播</h2>
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {entries.map((entry) => (
        <div
          key={entry.period}
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              flexShrink: 0,
              width: "7rem",
              fontSize: "0.7rem",
              fontWeight: 700,
              color: "#b87a50",
              paddingTop: "0.2rem",
              lineHeight: 1.4,
            }}
          >
            {entry.period}
          </div>
          <div style={{ flex: 1, borderLeft: "2px solid #f0e6d6", paddingLeft: "1rem" }}>
            <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#2d1f0e", marginBottom: "0.25rem" }}>
              {entry.heading}
            </p>
            <p style={{ fontSize: "0.8125rem", color: "#5a4a3a", lineHeight: 1.7, margin: 0 }}>
              {entry.body}
            </p>
          </div>
        </div>
      ))}
    </div>
  </section>
)

const ComparisonSection: FC<{ rows: ArticleComparisonRow[] }> = ({ rows }) => (
  <section style={{ marginBottom: "2rem" }}>
    <h2 style={sectionHeadingStyle}>比較まとめ</h2>
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {rows.map((row) => (
        <div
          key={row.name}
          style={{
            background: row.soupInside ? "#fff8f0" : "#faf7f2",
            border: `1px solid ${row.soupInside ? "#f0c88a" : "#e8ddd0"}`,
            borderRadius: "0.5rem",
            padding: "0.625rem 0.875rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "0.375rem 1.25rem",
            alignItems: "baseline",
          }}
        >
          <span style={{ fontWeight: 700, fontSize: "0.9375rem", minWidth: "7rem" }}>
            {row.dishId ? (
              <Link
                href={`/dishes/${row.dishId}/`}
                style={{ color: "#2d1f0e", textDecoration: "underline", textDecorationColor: "#e8ddd0" }}
              >
                {row.name}
              </Link>
            ) : (
              row.name
            )}
            {row.soupInside && (
              <span style={{ marginLeft: "0.375rem", fontSize: "0.65rem", color: "#b87a50", fontWeight: 700, background: "#fde9c4", padding: "0.05rem 0.4rem", borderRadius: "0.25rem" }}>
                スープ封入
              </span>
            )}
          </span>
          <span style={{ fontSize: "0.75rem", color: "#7a6655", background: "#f0e6d6", padding: "0.1rem 0.5rem", borderRadius: "0.25rem" }}>
            {row.region}
          </span>
          <span style={{ fontSize: "0.8125rem", color: "#5a4a3a" }}>皮: {row.skin}</span>
          <span style={{ fontSize: "0.8125rem", color: "#5a4a3a" }}>具: {row.filling}</span>
          <span style={{ fontSize: "0.8125rem", color: "#5a4a3a" }}>調理: {row.cooking}</span>
          <span style={{ fontSize: "0.8125rem", color: "#5a4a3a" }}>食べ方: {row.eatStyle}</span>
        </div>
      ))}
    </div>
    {rows.some((row) => row.soupInside) && (
      <p style={{ marginTop: "0.625rem", fontSize: "0.75rem", color: "#a89080" }}>
        ★ オレンジ背景＝スープが皮の内側に封じ込められている
      </p>
    )}
  </section>
)

const CalloutSection: FC<{ callout: ArticleCallout }> = ({ callout }) => (
  <section
    style={{
      marginBottom: "1.5rem",
      background: "#faf7f2",
      border: "1px solid #e8ddd0",
      borderRadius: "0.5rem",
      padding: "1.25rem",
    }}
  >
    <h2
      style={{
        fontSize: "0.875rem",
        fontWeight: 700,
        color: "#5a4a3a",
        marginBottom: "0.625rem",
      }}
    >
      {callout.heading}
    </h2>
    <p style={{ fontSize: "0.875rem", color: "#5a4a3a", lineHeight: 1.7, margin: 0 }}>
      {callout.body}
    </p>
    {callout.items && callout.items.length > 0 && (
      <ul style={{ margin: "0.75rem 0 0", paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.375rem" }}>
        {callout.items.map((item) => (
          <li key={item.name} style={{ fontSize: "0.8125rem", color: "#7a6655", display: "flex", gap: "0.5rem" }}>
            <span style={{ fontWeight: 700, minWidth: "6rem", flexShrink: 0 }}>{item.name}</span>
            <span>{item.description}</span>
          </li>
        ))}
      </ul>
    )}
  </section>
)

const SourcesSection: FC<{ sources: ArticleSource[] }> = ({ sources }) => (
  <section style={{ marginTop: "2.5rem", paddingTop: "1.5rem", borderTop: "1px solid #e8ddd0" }}>
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
      参考資料
    </h2>
    <ol style={{ margin: 0, paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {sources.map((source, i) => (
        <li key={i} style={{ fontSize: "0.8125rem", color: "#7a6655", lineHeight: 1.6 }}>
          {source.author && (
            <span style={{ color: "#5a4a3a" }}>{source.author}. </span>
          )}
          {source.url ? (
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#b87a50", textDecoration: "underline", textDecorationColor: "#e8ddd0" }}
            >
              {source.title}
            </a>
          ) : (
            <span style={{ color: "#5a4a3a", fontStyle: "italic" }}>{source.title}</span>
          )}
          {source.note && (
            <span style={{ color: "#a89080" }}> — {source.note}</span>
          )}
        </li>
      ))}
    </ol>
  </section>
)

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = articles.find((a) => a.slug === slug)
  if (!article) notFound()

  const SITE_URL = "https://rdish.reload.co.jp"

  const relatedDishes = article.relatedDishIds
    .map((id) => dishes.find((d) => d.id === id))
    .filter(Boolean) as DishItem[]

  const firstImage = relatedDishes.find((d) => d.images && d.images.length > 0)?.images?.[0]

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/articles/${article.slug}/`,
    },
    headline: article.subtitle ? `${article.title}——${article.subtitle}` : article.title,
    description: article.description,
    datePublished: article.publishedAt,
    ...(article.updatedAt ? { dateModified: article.updatedAt } : {}),
    inLanguage: "ja",
    ...(firstImage ? { image: `${SITE_URL}${firstImage}` } : {}),
    author: {
      "@type": "Organization",
      name: "RDish",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "RDish",
      url: SITE_URL,
    },
    mentions: relatedDishes.map((d) => ({
      "@type": "Thing",
      name: d.name,
      url: `${SITE_URL}/dishes/${d.id}/`,
    })),
    keywords: relatedDishes.map((d) => d.name).join(", "),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <Breadcrumb items={[{ label: "記事", href: "/articles/" }, { label: article.title }]} />
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
          <RegionSection key={region.heading} region={region} allDishes={dishes} />
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
                const dish = dishes.find((d) => d.id === id)
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
      </article>
    </>
  )
}

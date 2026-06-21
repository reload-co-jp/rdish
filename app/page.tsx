import Link from "next/link"
import { DishCard } from "../components/features/DishCard"
import { FavoriteRelated } from "../components/features/FavoriteRelated"
import { SearchBox } from "../components/features/SearchBox"
import AdSense from "../components/elements/AdSense"
import { allArticles } from "../lib/articles"
import { allDishes } from "../lib/dishes"
import { categoryPath } from "../lib/taxonomy"
import type { DishItem } from "../types/dish"

const POPULAR_IDS = [
  "confit",
  "romanesco",
  "burrata",
  "biryani",
  "hummus",
  "ajillo",
]

const CATEGORIES = [
  "調理法",
  "野菜",
  "チーズ",
  "ソース",
  "料理",
] as const

const popularDishes = POPULAR_IDS.map((id) =>
  allDishes.find((d) => d.id === id),
).filter(Boolean) as DishItem[]

const latestArticles = allArticles
  .slice()
  .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  .slice(0, 3)

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "RDish",
  url: "https://rdish.reload.co.jp",
  description: "いつでも聞ける飾らない料理図鑑",
  inLanguage: "ja",
  publisher: { "@type": "Organization", name: "株式会社Reload", url: "https://reload.co.jp" },
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: "https://rdish.reload.co.jp/search/?q={search_term_string}" },
    "query-input": "required name=search_term_string",
  },
}

export default function TopPage() {
  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <div style={{ textAlign: "center", marginBottom: "2rem", padding: "1rem 0" }}>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 800,
            marginBottom: "0.5rem",
          }}
        >
          RDish
        </h1>
        <p style={{ color: "#a89080", marginBottom: "1.5rem" }}>
          いつでも聞ける飾らない料理図鑑
        </p>
        <SearchBox />
      </div>

      <div
        style={{
          background: "#fef9f0",
          border: "1px solid #f5c97a",
          borderRadius: "0.5rem",
          padding: "1rem",
          marginBottom: "2rem",
        }}
      >
        <p style={{ color: "#a89080", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
          料理名がわからない？特徴から探す
        </p>
        <Link
          href="/reverse/"
          style={{
            display: "block",
            color: "#b45309",
            textDecoration: "none",
            fontSize: "0.9rem",
          }}
        >
          → 「白くてとろっとしたチーズ」「緑色で渦巻きの野菜」など 逆引き検索
        </Link>
        <Link
          href="/dishes/"
          style={{
            display: "block",
            color: "#b45309",
            textDecoration: "none",
            fontSize: "0.9rem",
            marginTop: "0.5rem",
          }}
        >
          → 最新登録順で見る
        </Link>
      </div>

      <FavoriteRelated allDishes={allDishes} />

      {latestArticles.length > 0 && (
        <section style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <h2 style={{ fontSize: "0.875rem", color: "#aaa", fontWeight: 600 }}>読みもの</h2>
            <Link
              href="/articles/"
              style={{ fontSize: "0.75rem", color: "#b45309", textDecoration: "none" }}
            >
              すべて見る →
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {latestArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}/`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  style={{
                    background: "#faf7f2",
                    border: "1px solid #e8ddd0",
                    borderRadius: "0.5rem",
                    padding: "0.75rem 1rem",
                  }}
                >
                  <p style={{ fontSize: "0.65rem", color: "#a89080", marginBottom: "0.25rem" }}>
                    {article.publishedAt}
                  </p>
                  <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#2d1f0e", marginBottom: "0.25rem", lineHeight: 1.35 }}>
                    {article.title}
                    {article.subtitle && (
                      <span style={{ color: "#7a6655", fontWeight: 400, fontSize: "0.875rem" }}>
                        {" "}——{article.subtitle}
                      </span>
                    )}
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "#7a6655", margin: 0, lineHeight: 1.55 }}>
                    {article.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "0.875rem", color: "#aaa", fontWeight: 600 }}>人気の用語</h2>
          <Link
            href="/dishes/"
            style={{ fontSize: "0.75rem", color: "#b45309", textDecoration: "none" }}
          >
            すべて見る →
          </Link>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {popularDishes.map((dish) => (
            <DishCard key={dish.id} dish={dish} />
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: "0.875rem", color: "#aaa", marginBottom: "0.75rem", fontWeight: 600 }}>
          カテゴリ
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={categoryPath(cat)}
              style={{
                background: "#f0e6d6",
                border: "1px solid #e8ddd0",
                borderRadius: "0.375rem",
                color: "#7a4f2a",
                fontSize: "0.875rem",
                padding: "0.5rem 1rem",
                textDecoration: "none",
              }}
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      <AdSense />
    </div>
  )
}

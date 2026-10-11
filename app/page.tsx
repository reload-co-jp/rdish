import Link from "next/link"
import { Photo } from "../components/elements/Photo"
import { FavoriteRelated } from "../components/features/FavoriteRelated"
import { SearchBox } from "../components/features/SearchBox"
import AdSense from "../components/elements/AdSense"
import { allArticles } from "../lib/articles"
import { allDishes } from "../lib/dishes"
import { categoryItems, categoryPath } from "../lib/taxonomy"
import { collectionGroups } from "../lib/collections"
import {
  articleCover,
  CATEGORY_EN,
  dishDate,
  formatDate,
} from "../lib/editorial"
import { organizationJsonLd, organizationRef } from "../lib/organization"
import type { DishItem } from "../types/dish"

const POPULAR_IDS = [
  "confit",
  "romanesco",
  "burrata",
  "biryani",
  "hummus",
  "ajillo",
]

const popularDishes = POPULAR_IDS.map((id) =>
  allDishes.find((d) => d.id === id)
).filter(Boolean) as DishItem[]

const latestArticles = allArticles
  .slice()
  .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  .slice(0, 4)
const [coverArticle, ...moreArticles] = latestArticles
const cover = coverArticle && articleCover(coverArticle)

const newEntries = [...allDishes]
  .reverse()
  .filter((d) => d.images?.length)
  .slice(0, 9)

// 各特集グループの先頭を1件ずつ（写真は掲載料理から）
const featuredCollections = collectionGroups.slice(0, 3).map((g) => {
  const c = g.collections[0]
  return { ...c, image: c.dishes.find((d) => d.images?.length)?.images?.[0] }
})

const categoryCounts = categoryItems
  .map((item) => ({
    label: item.label,
    count: allDishes.filter((d) => d.category === item.label).length,
  }))
  .filter((c) => c.count > 0)
  .sort((a, b) => b.count - a.count)

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://rdish.reload.co.jp/#website",
      name: "RDish",
      url: "https://rdish.reload.co.jp",
      description: "いつでも聞ける飾らない料理図鑑",
      inLanguage: "ja",
      publisher: organizationRef,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate:
            "https://rdish.reload.co.jp/search/?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    organizationJsonLd,
  ],
}

export default function TopPage() {
  return (
    <div className="wide">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      <div className="masthead">
        <div>
          <h1>
            いつでも聞ける、
            <br />
            飾らない料理図鑑
          </h1>
          <p>料理・食材・調理法 {allDishes.length.toLocaleString()}語を収録</p>
        </div>
        <SearchBox />
      </div>

      {coverArticle && (
        <section className="hero" aria-labelledby="cover-title">
          <Link
            href={`/articles/${coverArticle.slug}/`}
            className="story"
            tabIndex={-1}
            aria-hidden="true"
          >
            <Photo
              src={cover?.src}
              alt=""
              sizes="(max-width: 768px) 100vw, 60vw"
              priority
            />
          </Link>
          <div className="hero__text">
            <div className="hero__issue">
              <span className="eyebrow">Feature</span>
              <span className="meta">
                {formatDate(coverArticle.publishedAt)}
              </span>
            </div>
            <h2 id="cover-title" className="hero__title serif">
              <Link
                href={`/articles/${coverArticle.slug}/`}
                style={{ textDecoration: "none" }}
              >
                {coverArticle.title}
              </Link>
            </h2>
            {coverArticle.subtitle && (
              <p className="hero__sub">{coverArticle.subtitle}</p>
            )}
            <p className="hero__lead clamp-3">{coverArticle.description}</p>
            <Link
              href={`/articles/${coverArticle.slug}/`}
              className="more-link"
              style={{ alignSelf: "flex-start" }}
            >
              記事を読む →
            </Link>
          </div>
        </section>
      )}

      <AdSense />

      <FavoriteRelated allDishes={allDishes} />

      {moreArticles.length > 0 && (
        <section className="section">
          <div className="section-head">
            <div className="section-head__title">
              <span className="eyebrow">Stories</span>
              <h2>読みもの</h2>
            </div>
            <Link href="/articles/" className="more-link">
              すべての記事
            </Link>
          </div>
          <div className="stories">
            <ArticleStory article={moreArticles[0]} lead />
            <div className="stories__side">
              {moreArticles.slice(1).map((article) => (
                <ArticleStory key={article.slug} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-head">
          <div className="section-head__title">
            <span className="eyebrow">New Entries</span>
            <h2>新しく加わった料理</h2>
          </div>
          <Link href="/dishes/" className="more-link">
            新着順で見る
          </Link>
        </div>
        <div className="entries">
          {newEntries.map((dish, i) => (
            <Link key={dish.id} href={`/dishes/${dish.id}/`} className="story">
              <Photo
                src={dish.images?.[0]}
                alt={`${dish.name}の料理写真`}
                sizes={
                  i === 0
                    ? "(max-width: 768px) 100vw, 50vw"
                    : "(max-width: 768px) 50vw, 25vw"
                }
              />
              <div className="story__body">
                <span className="meta">
                  {dish.category}
                  {dishDate(dish.id) && ` — ${formatDate(dishDate(dish.id))}`}
                </span>
                <h3 className="story__title">{dish.name}</h3>
                {i === 0 && (
                  <p className="story__desc clamp-3">{dish.summary}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <AdSense />

      <section className="section">
        <div className="section-head">
          <div className="section-head__title">
            <span className="eyebrow">Popular</span>
            <h2>よく読まれている用語</h2>
          </div>
          <Link href="/dishes/" className="more-link">
            図鑑を見る
          </Link>
        </div>
        <ol className="index-list">
          {popularDishes.map((dish, i) => (
            <li key={dish.id}>
              <Link href={`/dishes/${dish.id}/`} className="index-item">
                <span className="index-item__no">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Photo src={dish.images?.[0]} alt="" sizes="104px" />
                <div style={{ minWidth: 0 }}>
                  <span className="meta">{dish.category}</span>
                  <h3
                    className="story__title"
                    style={{ fontSize: "var(--fs-lg)" }}
                  >
                    {dish.name}
                  </h3>
                  <p className="story__desc clamp-2">{dish.summary}</p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {featuredCollections.length > 0 && (
        <section className="section">
          <div className="section-head">
            <div className="section-head__title">
              <span className="eyebrow">Collections</span>
              <h2>特集</h2>
            </div>
            <Link href="/collections/" className="more-link">
              すべての特集
            </Link>
          </div>
          <div className="features">
            {featuredCollections.map((c) => (
              <Link
                key={c.slug}
                href={`/collections/${c.slug}/`}
                className="story"
              >
                <Photo
                  src={c.image}
                  alt=""
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="story__body">
                  <span className="eyebrow">{c.axisLabel}</span>
                  <h3 className="story__title">{c.title}</h3>
                  <p className="story__desc clamp-2">{c.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-head">
          <div className="section-head__title">
            <span className="eyebrow">Browse</span>
            <h2>図鑑を歩く</h2>
          </div>
        </div>
        <div className="browse">
          <ul className="browse__list">
            {categoryCounts.map((cat) => (
              <li key={cat.label}>
                <Link href={categoryPath(cat.label)}>
                  {cat.label}
                  <span className="meta">
                    {CATEGORY_EN[cat.label] ?? ""} · {cat.count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div>
            <Link href="/reverse/" className="callout-line story">
              <span className="eyebrow">Reverse Search</span>
              <strong>料理名がわからない？特徴から探す</strong>
              <span className="story__desc">
                「白くてとろっとしたチーズ」「緑色で渦巻きの野菜」など、見た目や味から逆引き。
              </span>
            </Link>
            <Link href="/countries/" className="callout-line story">
              <span className="eyebrow">Countries</span>
              <strong>国・地域から探す</strong>
              <span className="story__desc">
                フランス、タイ、メキシコ──料理圏ごとに定番と隠れた名物をたどる。
              </span>
            </Link>
            <Link href="/compare/" className="callout-line story">
              <span className="eyebrow">Compare</span>
              <strong>似ている料理の違いを比較</strong>
              <span className="story__desc">
                名前も見た目も近い料理を並べて、違いをひと目で。
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

const ArticleStory = ({
  article,
  lead,
}: {
  article: (typeof allArticles)[number]
  lead?: boolean
}) => {
  const c = articleCover(article)
  return (
    <Link
      href={`/articles/${article.slug}/`}
      className={`story ${lead ? "stories__lead" : ""}`}
    >
      <Photo
        src={c?.src}
        alt=""
        sizes={
          lead
            ? "(max-width: 768px) 100vw, 66vw"
            : "(max-width: 768px) 50vw, 33vw"
        }
      />
      <div className="story__body">
        <span className="meta">{formatDate(article.publishedAt)}</span>
        <h3 className="story__title">{article.title}</h3>
        {article.subtitle && (
          <p
            className="story__desc"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {article.subtitle}
          </p>
        )}
        {lead && <p className="story__desc clamp-3">{article.description}</p>}
      </div>
    </Link>
  )
}

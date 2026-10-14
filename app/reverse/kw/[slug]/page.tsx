import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Breadcrumb } from "../../../../components/elements/Breadcrumb"
import { DishCard } from "../../../../components/features/DishCard"
import { ScoreBadge } from "../../../../components/features/ScoreBadge"
import {
  dishesMatchingKeyword,
  reverseKeywordGroupBySlug,
  reverseKeywordGroups,
  reverseKeywordPath,
  sharedTags,
} from "../../../../lib/reverseKeywords"
import { regionLabel } from "../../../../lib/region"
import { buildItemListJsonLd, tagPath } from "../../../../lib/taxonomy"
import type { DishItem } from "../../../../types/dish"

const DISPLAY_LIMIT = 40

export function generateStaticParams() {
  return reverseKeywordGroups.map(({ slug }) => ({ slug }))
}

const pageTitle = (keyword: string) => `「${keyword}」とは対照的な料理の特徴と違い`

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const group = reverseKeywordGroupBySlug(slug)
  if (!group) return {}
  const path = reverseKeywordPath(slug)
  const title = `${pageTitle(group.keyword)}（${group.dishes.length}件）`
  const top3 = group.dishes
    .slice(0, 3)
    .map((d) => d.name)
    .join("、")
  const description =
    `「${group.keyword}」とはひと味違う個性を持つ${top3}など${group.dishes.length}件。共通する特徴と、重さ・辛さ・食べやすさの違いを比較。`
      .slice(0, 160)
      .trimEnd()
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path },
  }
}

const maxBy = (dishes: DishItem[], score: (d: DishItem) => number) =>
  dishes.reduce((best, d) => (score(d) > score(best) ? d : best))

const thStyle = {
  textAlign: "left" as const,
  padding: "0.5rem",
  borderBottom: "1px solid var(--c-border)",
  color: "var(--c-text-sub)",
  fontWeight: 600,
  whiteSpace: "nowrap" as const,
}
const tdStyle = {
  padding: "0.5rem",
  borderBottom: "1px solid var(--c-border)",
  verticalAlign: "top" as const,
}
const h2Style = { fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }

export default async function ReverseKeywordPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const group = reverseKeywordGroupBySlug(slug)
  if (!group) notFound()
  const { keyword } = group
  const path = reverseKeywordPath(slug)
  const dishes = [...group.dishes]
    .sort((a, b) => b.beginnerFriendlyScore - a.beginnerFriendlyScore)
    .slice(0, DISPLAY_LIMIT)
  const tags = sharedTags(group.dishes)
  const alternatives = dishesMatchingKeyword(keyword)
  const keywordTagPath = tagPath(keyword)

  const easiest = maxBy(group.dishes, (d) => d.beginnerFriendlyScore)
  const heaviest = maxBy(group.dishes, (d) => d.heavinessScore)
  const spiciest = maxBy(group.dishes, (d) => d.spicinessScore)
  const mostUnique = maxBy(group.dishes, (d) => d.uniquenessScore)
  const highlights = [
    { label: "いちばん食べやすい", dish: easiest },
    { label: "いちばん重い", dish: heaviest },
    spiciest.spicinessScore > 1 && { label: "いちばん辛い", dish: spiciest },
    { label: "いちばん個性的", dish: mostUnique },
  ].filter((h): h is { label: string; dish: DishItem } => Boolean(h))

  const jsonLd = buildItemListJsonLd(pageTitle(keyword), path, dishes)

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb
        items={[
          { label: "逆引き検索", href: "/reverse/" },
          { label: "特徴で比較", href: "/reverse/kw/" },
          { label: keyword, href: path },
        ]}
      />
      <h1
        style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.375rem" }}
      >
        {pageTitle(keyword)}
      </h1>
      <p
        style={{
          color: "var(--c-text-sub)",
          fontSize: "0.875rem",
          marginBottom: "0.75rem",
        }}
      >
        該当{group.dishes.length}件
        {group.dishes.length > dishes.length &&
          `（うち食べやすい順に${dishes.length}件を比較）`}
      </p>
      <p
        style={{
          color: "var(--c-text-2)",
          fontSize: "0.9375rem",
          lineHeight: 1.8,
          margin: "0 0 1.5rem",
        }}
      >
        「{keyword}」とは対照的な持ち味の料理を集めました。
        {tags.length > 0 &&
          `多くに共通する特徴は${tags
            .slice(0, 3)
            .map((t) => `「${t.tag}」`)
            .join("")}など。`}
        同じ方向性でも重さ・辛さ・個性はそれぞれ異なるため、特徴を比べながら選べます。
      </p>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={h2Style}>ひと目でわかる違い</h2>
        <ul style={{ margin: 0, paddingLeft: "1.25rem", lineHeight: 1.9 }}>
          {highlights.map(({ label, dish }) => (
            <li key={label}>
              {label}：
              <Link href={`/dishes/${dish.id}/`} style={{ color: "var(--c-accent)" }}>
                {dish.name}
              </Link>
              <span style={{ color: "var(--c-text-sub)", fontSize: "0.875rem" }}>
                {" "}
                — {dish.tasteAndTexture[0]}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {tags.length > 0 && (
        <section style={{ marginBottom: "2rem" }}>
          <h2 style={h2Style}>このグループの特徴</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {tags.map(({ tag, count }) => (
              <Link
                key={tag}
                href={tagPath(tag)}
                style={{
                  border: "1px solid var(--c-border)",
                  borderRadius: "999px",
                  color: "var(--c-text)",
                  fontSize: "0.8125rem",
                  padding: "0.25rem 0.625rem",
                  textDecoration: "none",
                }}
              >
                {tag}
                <span style={{ color: "var(--c-text-sub)" }}> {count}件</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={h2Style}>比較表</h2>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              borderCollapse: "collapse",
              fontSize: "0.8125rem",
              minWidth: "36rem",
              width: "100%",
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>料理</th>
                <th style={thStyle}>スコア</th>
                <th style={thStyle}>特徴</th>
              </tr>
            </thead>
            <tbody>
              {dishes.map((dish) => (
                <tr key={dish.id}>
                  <td style={tdStyle}>
                    <Link
                      href={`/dishes/${dish.id}/`}
                      style={{ color: "var(--c-accent)", fontWeight: 700 }}
                    >
                      {dish.name}
                    </Link>
                    <div style={{ color: "var(--c-text-sub)" }}>
                      {dish.category}
                      {dish.regions[0] && ` / ${regionLabel(dish.regions[0])}`}
                    </div>
                  </td>
                  <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <ScoreBadge label="食べやすさ" score={dish.beginnerFriendlyScore} />
                      <ScoreBadge label="重さ" score={dish.heavinessScore} />
                      <ScoreBadge label="辛さ" score={dish.spicinessScore} />
                      <ScoreBadge label="個性" score={dish.uniquenessScore} />
                    </div>
                  </td>
                  <td style={{ ...tdStyle, lineHeight: 1.6 }}>
                    {dish.menuDescription.split("。")[0]}。
                    <div style={{ color: "var(--c-text-sub)", marginTop: "0.25rem" }}>
                      {dish.tasteAndTexture.slice(0, 2).join(" / ")}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {alternatives.length > 0 && (
        <section style={{ marginBottom: "2rem" }}>
          <h2 style={h2Style}>反対に「{keyword}」が持ち味の料理</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {alternatives.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>
          {keywordTagPath !== "/tags/" && (
            <p style={{ marginTop: "0.75rem" }}>
              <Link
                href={keywordTagPath}
                style={{ color: "var(--c-accent)", fontSize: "0.875rem", fontWeight: 600 }}
              >
                「{keyword}」の料理をすべて見る →
              </Link>
            </p>
          )}
        </section>
      )}
    </div>
  )
}

import Link from "next/link"
import type { Metadata } from "next"
import { Breadcrumb } from "../../components/elements/Breadcrumb"
import { allDishes } from "../../lib/dishes"
import { tagItems, tagPath } from "../../lib/taxonomy"

export const metadata: Metadata = {
  title: "タグ別 料理一覧",
  description:
    "料理ジャンル・食材・味・調理法などのタグから料理用語を探せる料理図鑑 RDish。",
  alternates: { canonical: "/tags/" },
  openGraph: {
    title: "タグ別 料理一覧",
    description:
      "料理ジャンル・食材・味・調理法などのタグから料理用語を探せる料理図鑑 RDish。",
    url: "/tags/",
  },
}

const SITE_URL = "https://rdish.reload.co.jp"

const linkStyle = {
  display: "block",
  background: "#faf7f2",
  border: "1px solid #e8ddd0",
  borderRadius: "0.5rem",
  color: "inherit",
  padding: "0.875rem 1rem",
  textDecoration: "none",
} as const

const countByTag = allDishes.reduce((map, dish) => {
  for (const tag of dish.tags) {
    map.set(tag, (map.get(tag) ?? 0) + 1)
  }
  return map
}, new Map<string, number>())

export default function TagsPage() {
  const tags = tagItems
    .map((item) => ({ ...item, count: countByTag.get(item.label) ?? 0 }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id, "ja"))

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "タグ別 料理一覧",
    url: `${SITE_URL}/tags/`,
    numberOfItems: tags.length,
    itemListElement: tags.map((tag, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: tag.label,
      url: `${SITE_URL}${tagPath(tag.label)}`,
    })),
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb items={[{ label: "タグ", href: "/tags/" }]} />
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>
        タグから探す
      </h1>
      <p style={{ color: "#7a6655", fontSize: "0.9375rem", lineHeight: 1.8, margin: "0 0 1.5rem" }}>
        料理ジャンル、食材、味、調理法など全{tags.length}タグ
      </p>

      <div style={{ display: "grid", gap: "0.75rem" }}>
        {tags.map((tag) => (
          <Link key={tag.id} href={tagPath(tag.label)} style={linkStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: "1rem",
                marginBottom: tag.description ? "0.375rem" : 0,
              }}
            >
              <h2 style={{ color: "#2d1f0e", fontSize: "1rem", fontWeight: 800 }}>
                {tag.label}
              </h2>
              <span style={{ color: "#a89080", fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                {tag.count}件
              </span>
            </div>
            {tag.description && (
              <p style={{ color: "#7a6655", fontSize: "0.875rem", lineHeight: 1.7 }}>
                {tag.description}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}

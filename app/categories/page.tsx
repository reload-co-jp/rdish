import Link from "next/link"
import type { Metadata } from "next"
import { Breadcrumb } from "../../components/elements/Breadcrumb"
import { allDishes } from "../../lib/dishes"
import { categoryItems, categoryPath } from "../../lib/taxonomy"
import type { DishCategory } from "../../types/dish"

export const metadata: Metadata = {
  title: "カテゴリ別 料理一覧",
  description:
    "料理・食材・調理法・ソース・香辛料などカテゴリ別に料理用語を探せる料理図鑑 RDish。",
  alternates: { canonical: "/categories/" },
  openGraph: {
    title: "カテゴリ別 料理一覧",
    description:
      "料理・食材・調理法・ソース・香辛料などカテゴリ別に料理用語を探せる料理図鑑 RDish。",
    url: "/categories/",
  },
}

const SITE_URL = "https://rdish.reload.co.jp"

const linkStyle = {
  display: "block",
  background: "#faf7f2",
  border: "1px solid #e8ddd0",
  borderRadius: "0.5rem",
  color: "inherit",
  padding: "1rem",
  textDecoration: "none",
} as const

const countByCategory = allDishes.reduce(
  (map, dish) => map.set(dish.category, (map.get(dish.category) ?? 0) + 1),
  new Map<DishCategory, number>(),
)

export default function CategoriesPage() {
  const categories = categoryItems.map((item) => ({
    ...item,
    count: countByCategory.get(item.label) ?? 0,
  }))

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "カテゴリ別 料理一覧",
    url: `${SITE_URL}/categories/`,
    numberOfItems: categories.length,
    itemListElement: categories.map((category, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: category.label,
      url: `${SITE_URL}${categoryPath(category.label)}`,
    })),
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb items={[{ label: "カテゴリ", href: "/categories/" }, { label: "一覧" }]} />
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>
        カテゴリから探す
      </h1>
      <p style={{ color: "#a89080", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
        料理・食材・調理法など全{categories.length}カテゴリ
      </p>

      <div style={{ display: "grid", gap: "0.75rem" }}>
        {categories.map((category) => (
          <Link key={category.id} href={categoryPath(category.label)} style={linkStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: "1rem",
                marginBottom: "0.375rem",
              }}
            >
              <h2 style={{ color: "#2d1f0e", fontSize: "1rem", fontWeight: 800 }}>
                {category.label}
              </h2>
              <span style={{ color: "#a89080", fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                {category.count}件
              </span>
            </div>
            {category.description && (
              <p style={{ color: "#7a6655", fontSize: "0.875rem", lineHeight: 1.7 }}>
                {category.description}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}

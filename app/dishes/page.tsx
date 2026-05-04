import type { Metadata } from "next"
import { Breadcrumb } from "../../components/elements/Breadcrumb"
import { DishCard } from "../../components/features/DishCard"
import dishes from "../../data/dishes.json"
import type { DishItem } from "../../types/dish"

const allDishes = dishes as DishItem[]
const latestDishes = [...allDishes].reverse()

export const metadata: Metadata = {
  title: "最新登録順 料理一覧",
  description:
    "RDishに登録された料理・食材・調理法・ソースを新しい順に一覧できます。",
  alternates: { canonical: "/dishes/" },
  openGraph: {
    title: "最新登録順 料理一覧",
    description:
      "RDishに登録された料理・食材・調理法・ソースを新しい順に一覧できます。",
    url: "/dishes/",
  },
}

export default function DishesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "最新登録順 料理一覧",
    url: "https://rdish.reload.co.jp/dishes/",
    numberOfItems: latestDishes.length,
    itemListElement: latestDishes.map((dish, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: dish.name,
      url: `https://rdish.reload.co.jp/dishes/${dish.id}/`,
    })),
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb items={[{ label: "料理一覧" }]} />

      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          最新登録順
        </h1>
        <p style={{ color: "#a89080", fontSize: "0.875rem" }}>
          登録が新しい順に {latestDishes.length} 件表示
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {latestDishes.map((dish, index) => (
          <div key={dish.id} style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                top: "0.75rem",
                right: "0.75rem",
                zIndex: 1,
                color: "#a89080",
                fontSize: "0.7rem",
                fontWeight: 700,
                background: "#fffdf8",
                border: "1px solid #e8ddd0",
                borderRadius: "0.25rem",
                padding: "0.125rem 0.375rem",
              }}
            >
              #{index + 1}
            </div>
            <DishCard dish={dish} />
          </div>
        ))}
      </div>
    </div>
  )
}

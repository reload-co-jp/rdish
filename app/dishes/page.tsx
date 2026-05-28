import type { Metadata } from "next"
import { Breadcrumb } from "../../components/elements/Breadcrumb"
import { DishesPageContent, paginateDishes, totalPages } from "../../components/features/DishesPageContent"
import dishes from "../../data/dishes.json"
import type { DishItem } from "../../types/dish"

const allDishes = dishes as DishItem[]
const latestDishes = [...allDishes].reverse()
const count = allDishes.length
const SITE_URL = "https://rdish.reload.co.jp"

export const metadata: Metadata = {
  title: `料理・食材図鑑 全${count}件一覧`,
  description: `外食メニューで気になった料理・食材・調理法を調べられる図鑑。フランス料理・イタリア料理・アジア料理など全${count}件収録。`,
  alternates: {
    canonical: "/dishes/",
  },
  openGraph: {
    title: `料理・食材図鑑 全${count}件一覧`,
    description: `外食メニューで気になった料理・食材・調理法を調べられる図鑑。フランス料理・イタリア料理・アジア料理など全${count}件収録。`,
    url: "/dishes/",
  },
}

export default function DishesPage() {
  const page = 1
  const pageDishes = paginateDishes(latestDishes, page)
  const total = totalPages(count)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `料理・食材図鑑 全${count}件一覧`,
    url: `${SITE_URL}/dishes/`,
    numberOfItems: pageDishes.length,
    itemListElement: pageDishes.map((dish, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: dish.name,
      url: `${SITE_URL}/dishes/${dish.id}/`,
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
          料理・食材図鑑 一覧
        </h1>
        <p style={{ color: "#a89080", fontSize: "0.875rem" }}>
          全{count}件 / {total}ページ中 1ページ目
        </p>
      </div>
      <DishesPageContent
        dishes={pageDishes}
        page={page}
        totalCount={count}
        offset={0}
      />
    </div>
  )
}

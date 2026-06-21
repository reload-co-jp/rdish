import type { Metadata } from "next"
import { Breadcrumb } from "../../components/elements/Breadcrumb"
import { DishesPageContent, paginateDishes, totalPages } from "../../components/features/DishesPageContent"
import { allDishes } from "../../lib/dishes"
import { buildItemListJsonLd } from "../../lib/taxonomy"

const latestDishes = [...allDishes].reverse()
const count = allDishes.length

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

  const jsonLd = buildItemListJsonLd(`料理・食材図鑑 全${count}件一覧`, "/dishes/", pageDishes)

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

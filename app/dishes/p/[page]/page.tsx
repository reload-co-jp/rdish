import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Breadcrumb } from "../../../../components/elements/Breadcrumb"
import {
  DishesPageContent,
  PAGE_SIZE,
  paginateDishes,
  pageUrl,
  totalPages,
} from "../../../../components/features/DishesPageContent"
import { allDishes } from "../../../../lib/dishes"
import { buildItemListJsonLd } from "../../../../lib/taxonomy"

const latestDishes = [...allDishes].reverse()
const count = allDishes.length

export function generateStaticParams() {
  const total = totalPages(count)
  return Array.from({ length: total - 1 }, (_, i) => ({ page: String(i + 2) }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>
}): Promise<Metadata> {
  const { page: pageStr } = await params
  const page = Number(pageStr)
  const total = totalPages(count)
  if (isNaN(page) || page < 2 || page > total) return {}
  return {
    title: `料理・食材図鑑 一覧（${page}ページ目）`,
    description: `外食メニューで気になった料理・食材・調理法を調べられる図鑑。${page}ページ目（全${total}ページ）。`,
    alternates: {
      canonical: pageUrl(page),
    },
    openGraph: {
      title: `料理・食材図鑑 一覧（${page}ページ目）`,
      description: `外食メニューで気になった料理・食材・調理法を調べられる図鑑。${page}ページ目（全${total}ページ）。`,
      url: pageUrl(page),
    },
  }
}

export default async function DishesPageN({
  params,
}: {
  params: Promise<{ page: string }>
}) {
  const { page: pageStr } = await params
  const page = Number(pageStr)
  const total = totalPages(count)
  if (isNaN(page) || page < 2 || page > total) notFound()

  const offset = (page - 1) * PAGE_SIZE
  const pageDishes = paginateDishes(latestDishes, page)

  const jsonLd = buildItemListJsonLd(
    `料理・食材図鑑 一覧 ${page}ページ目`,
    pageUrl(page),
    pageDishes,
    offset,
  )

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb
        items={[
          { label: "料理一覧", href: "/dishes/" },
          { label: `${page}ページ目` },
        ]}
      />
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          料理・食材図鑑 一覧
        </h1>
        <p style={{ color: "#a89080", fontSize: "0.875rem" }}>
          全{count}件 / {total}ページ中 {page}ページ目
        </p>
      </div>
      <DishesPageContent
        dishes={pageDishes}
        page={page}
        totalCount={count}
        offset={offset}
      />
    </div>
  )
}

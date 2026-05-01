import { FC } from "react"
import { notFound } from "next/navigation"
import { Breadcrumb } from "../../../components/elements/Breadcrumb"
import { DishDetail } from "../../../components/features/DishDetail"
import { RecentlyViewedTracker } from "../../../components/features/RecentlyViewedTracker"
import dishes from "../../../data/dishes.json"
import type { DishItem } from "../../../types/dish"

export function generateStaticParams() {
  return (dishes as DishItem[]).map((d) => ({ id: d.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const dish = (dishes as DishItem[]).find((d) => d.id === id)
  if (!dish) return {}
  const title = `${dish.name}とは？外食メニューで見たときの意味・味・頼む判断`
  return {
    title,
    description: dish.summary,
    alternates: { canonical: `/dishes/${dish.id}/` },
    openGraph: {
      title,
      description: dish.summary,
      url: `/dishes/${dish.id}/`,
      type: "article",
    },
  }
}

const DishPageContent: FC<{ dish: DishItem; allDishes: DishItem[] }> = ({
  dish,
  allDishes,
}) => (
  <>
    <RecentlyViewedTracker id={dish.id} />
    <DishDetail dish={dish} allDishes={allDishes} />
  </>
)

export default async function DishPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const dish = (dishes as DishItem[]).find((d) => d.id === id)
  if (!dish) notFound()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${dish.name}とは？外食メニューで見たときの意味・味・頼む判断`,
    description: dish.summary,
    name: dish.name,
    url: `https://rdish.reload.co.jp/dishes/${dish.id}/`,
    inLanguage: "ja",
    publisher: { "@type": "Organization", name: "RDish", url: "https://rdish.reload.co.jp" },
    ...(dish.images?.[0] ? { image: `https://rdish.reload.co.jp${dish.images[0]}` } : {}),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb items={[{ label: dish.name }]} />
      <DishPageContent dish={dish} allDishes={dishes as DishItem[]} />
    </>
  )
}

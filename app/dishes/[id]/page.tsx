import { FC } from "react"
import { notFound } from "next/navigation"
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
  return {
    title: `${dish.name}とは？外食メニューで見たときの意味・味・頼む判断 | RDish`,
    description: dish.summary,
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
  return <DishPageContent dish={dish} allDishes={dishes as DishItem[]} />
}

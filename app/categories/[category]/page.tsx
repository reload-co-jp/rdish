import { notFound } from "next/navigation"
import { Breadcrumb } from "../../../components/elements/Breadcrumb"
import { DishCard } from "../../../components/features/DishCard"
import dishes from "../../../data/dishes.json"
import type { DishCategory, DishItem } from "../../../types/dish"

const CATEGORIES: DishCategory[] = [
  "料理", "食材", "調理法", "ソース", "香辛料",
  "チーズ", "野菜", "肉", "魚介", "デザート", "飲み物",
]

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category: encodeURIComponent(category) }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params
  const decoded = decodeURIComponent(category) as DishCategory
  const count = (dishes as DishItem[]).filter((d) => d.category === decoded).length
  const title = `${decoded}カテゴリの料理一覧`
  const description = `${decoded}カテゴリの料理・食材・調理法 ${count}件。外食メニューで役立つ料理図鑑 RDish。`
  return {
    title,
    description,
    alternates: { canonical: `/categories/${category}/` },
    openGraph: { title, description, url: `/categories/${category}/` },
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params
  const decoded = decodeURIComponent(category) as DishCategory
  const results = (dishes as DishItem[]).filter((d) => d.category === decoded)
  if (results.length === 0) notFound()

  return (
    <div>
      <Breadcrumb items={[{ label: "カテゴリ", href: "/" }, { label: decoded }]} />
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.375rem" }}>
        {decoded}
      </h1>
      <p style={{ color: "#aaa", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
        {results.length}件
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {results.map((dish) => (
          <DishCard key={dish.id} dish={dish} />
        ))}
      </div>
    </div>
  )
}

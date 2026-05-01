import { notFound } from "next/navigation"
import { Breadcrumb } from "../../../components/elements/Breadcrumb"
import { DishCard } from "../../../components/features/DishCard"
import dishes from "../../../data/dishes.json"
import type { DishItem } from "../../../types/dish"

export function generateStaticParams() {
  const allTags = [...new Set((dishes as DishItem[]).flatMap((d) => d.tags))]
  return allTags.map((tag) => ({ tag: encodeURIComponent(tag) }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>
}) {
  const { tag } = await params
  const decoded = decodeURIComponent(tag)
  const count = (dishes as DishItem[]).filter((d) => d.tags.includes(decoded)).length
  const title = `#${decoded}の料理一覧`
  const description = `「${decoded}」タグが付いた料理・食材・調理法 ${count}件。外食メニューで役立つ料理図鑑 RDish。`
  return {
    title,
    description,
    alternates: { canonical: `/tags/${tag}/` },
    openGraph: { title, description, url: `/tags/${tag}/` },
  }
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>
}) {
  const { tag } = await params
  const decoded = decodeURIComponent(tag)
  const results = (dishes as DishItem[]).filter((d) => d.tags.includes(decoded))
  if (results.length === 0) notFound()

  return (
    <div>
      <Breadcrumb items={[{ label: "タグ", href: "/" }, { label: `#${decoded}` }]} />
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.375rem" }}>
        #{decoded}
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

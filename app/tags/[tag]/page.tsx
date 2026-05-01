import { notFound } from "next/navigation"
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
  return { title: `#${decoded} | RDish` }
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

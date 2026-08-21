import { notFound } from "next/navigation"
import { Breadcrumb } from "../../../components/elements/Breadcrumb"
import { DishCard } from "../../../components/features/DishCard"
import {
  allCollections,
  collectionBySlug,
  collectionPath,
} from "../../../lib/collections"
import { buildItemListJsonLd } from "../../../lib/taxonomy"

export function generateStaticParams() {
  return allCollections.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const collection = collectionBySlug(slug)
  if (!collection) notFound()
  const path = collectionPath(collection.slug)
  const title = `${collection.title}（全${collection.dishes.length}件）`
  return {
    title,
    description: collection.description,
    alternates: { canonical: path },
    openGraph: { title, description: collection.description, url: path },
  }
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const collection = collectionBySlug(slug)
  if (!collection) notFound()
  const path = collectionPath(collection.slug)
  const jsonLd = buildItemListJsonLd(collection.title, path, collection.dishes)

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb
        items={[
          { label: "特集", href: "/collections/" },
          { label: collection.title, href: path },
        ]}
      />
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: 800,
          marginBottom: "0.375rem",
        }}
      >
        {collection.title}
      </h1>
      <p
        style={{ color: "#aaa", fontSize: "0.875rem", marginBottom: "0.75rem" }}
      >
        全{collection.dishes.length}件
      </p>
      <p
        style={{
          color: "#7a6655",
          fontSize: "0.9375rem",
          lineHeight: 1.8,
          margin: "0 0 1.5rem",
        }}
      >
        {collection.description}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {collection.dishes.map((dish) => (
          <DishCard key={dish.id} dish={dish} />
        ))}
      </div>
    </div>
  )
}

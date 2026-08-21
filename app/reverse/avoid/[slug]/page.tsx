import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Breadcrumb } from "../../../../components/elements/Breadcrumb"
import { DietaryNote } from "../../../../components/features/DietaryNote"
import { DietaryTopicLinks } from "../../../../components/features/DietaryTopicLinks"
import { DishCard } from "../../../../components/features/DishCard"
import {
  avoidPath,
  avoidTopicBySlug,
  avoidTopics,
  safePath,
  safeTopicBySlug,
} from "../../../../lib/dietary"
import { buildItemListJsonLd } from "../../../../lib/taxonomy"

const AVOID_DISPLAY_LIMIT = 60

export function generateStaticParams() {
  return avoidTopics.map(({ axis }) => ({ slug: axis.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const topic = avoidTopicBySlug(slug)
  if (!topic) return {}
  const path = avoidPath(slug)
  const top3 = topic.avoidDishes
    .slice(0, 3)
    .map((d) => d.name)
    .join("、")
  const title = `${topic.axis.avoidTitle}（${topic.avoidDishes.length}件）`
  const description =
    `${topic.axis.avoidLead}${top3}など${topic.avoidDishes.length}件。`
      .slice(0, 160)
      .trimEnd()
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path },
  }
}

export default async function DietaryAvoidPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const topic = avoidTopicBySlug(slug)
  if (!topic) notFound()
  const path = avoidPath(slug)
  const dishes = topic.avoidDishes.slice(0, AVOID_DISPLAY_LIMIT)
  const safeTopic = safeTopicBySlug(slug)
  const jsonLd = buildItemListJsonLd(topic.axis.avoidTitle, path, dishes)

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb
        items={[
          { label: "逆引き検索", href: "/reverse/" },
          { label: "苦手なものから探す", href: "/reverse/k/" },
          { label: topic.axis.avoidTitle, href: path },
        ]}
      />
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: 800,
          marginBottom: "0.375rem",
        }}
      >
        {topic.axis.avoidTitle}
      </h1>
      <p
        style={{ color: "#aaa", fontSize: "0.875rem", marginBottom: "0.75rem" }}
      >
        該当{topic.avoidDishes.length}件
        {topic.avoidDishes.length > dishes.length &&
          `（うち${dishes.length}件を掲載）`}
      </p>
      <p
        style={{
          color: "#7a6655",
          fontSize: "0.9375rem",
          lineHeight: 1.8,
          margin: "0 0 1.5rem",
        }}
      >
        {topic.axis.avoidLead}
      </p>

      <DietaryNote />

      {safeTopic && (
        <p style={{ margin: "0 0 1.5rem" }}>
          <Link
            href={safePath(slug)}
            style={{
              color: "#b45309",
              fontSize: "0.875rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            代わりに「{topic.axis.safeTitle}」を見る（{safeTopic.safeTotal}件）
            →
          </Link>
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {dishes.map((dish) => (
          <DishCard key={dish.id} dish={dish} />
        ))}
      </div>

      <section style={{ marginTop: "2rem" }}>
        <h2
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "#a89080",
            letterSpacing: "0.05em",
            marginBottom: "0.5rem",
          }}
        >
          ほかの食材・味から探す
        </h2>
        <DietaryTopicLinks currentSlug={slug} kind="avoid" />
      </section>
    </div>
  )
}

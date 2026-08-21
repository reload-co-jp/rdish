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
  safePath,
  safeTopicBySlug,
  safeTopics,
} from "../../../../lib/dietary"
import { buildItemListJsonLd } from "../../../../lib/taxonomy"

export function generateStaticParams() {
  return safeTopics.map(({ axis }) => ({ slug: axis.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const topic = safeTopicBySlug(slug)
  if (!topic) return {}
  const path = safePath(slug)
  const top3 = topic.safeDishes
    .slice(0, 3)
    .map((d) => d.name)
    .join("、")
  const title = `${topic.axis.safeTitle}（${topic.safeTotal}件）`
  const description =
    `${topic.axis.safeLead}${top3}など${topic.safeTotal}件から紹介。`
      .slice(0, 160)
      .trimEnd()
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path },
  }
}

export default async function DietarySafePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const topic = safeTopicBySlug(slug)
  if (!topic) notFound()
  const path = safePath(slug)
  const avoidTopic = avoidTopicBySlug(slug)
  const jsonLd = buildItemListJsonLd(
    topic.axis.safeTitle,
    path,
    topic.safeDishes
  )

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
          { label: topic.axis.safeTitle, href: path },
        ]}
      />
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: 800,
          marginBottom: "0.375rem",
        }}
      >
        {topic.axis.safeTitle}
      </h1>
      <p
        style={{ color: "#aaa", fontSize: "0.875rem", marginBottom: "0.75rem" }}
      >
        該当{topic.safeTotal}件
        {topic.safeTotal > topic.safeDishes.length &&
          `（うち初心者にも頼みやすい${topic.safeDishes.length}件を掲載）`}
      </p>
      <p
        style={{
          color: "#7a6655",
          fontSize: "0.9375rem",
          lineHeight: 1.8,
          margin: "0 0 1.5rem",
        }}
      >
        {topic.axis.safeLead}
      </p>

      <DietaryNote />

      {avoidTopic && (
        <p style={{ margin: "0 0 1.5rem" }}>
          <Link
            href={avoidPath(slug)}
            style={{
              color: "#b45309",
              fontSize: "0.875rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            逆に「{topic.axis.avoidTitle}」を見る（
            {avoidTopic.avoidDishes.length}件） →
          </Link>
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {topic.safeDishes.map((dish) => (
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
          ほかの「苦手」から探す
        </h2>
        <DietaryTopicLinks currentSlug={slug} kind="safe" />
      </section>
    </div>
  )
}

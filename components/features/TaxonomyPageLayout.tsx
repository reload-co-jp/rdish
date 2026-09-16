import Image from "next/image"
import Link from "next/link"
import { FC } from "react"
import { Breadcrumb } from "../elements/Breadcrumb"
import { DishCard } from "./DishCard"
import type { DishItem } from "../../types/dish"
import { CUISINE_TAGS } from "../../lib/cuisine"
import { categoryPath, tagPath } from "../../lib/taxonomy"

type Props = {
  breadcrumbLabel: string
  breadcrumbHref?: string
  itemLabel: string
  itemHref?: string
  description: string
  results: DishItem[]
  jsonLd: object
}

const OTHER_CUISINE_GROUP = "その他"

function groupByCuisine(results: DishItem[], selfLabel: string) {
  const groups = new Map<string, DishItem[]>()
  for (const dish of results) {
    const cuisine =
      dish.tags.find((t) => t !== selfLabel && CUISINE_TAGS.has(t)) ??
      OTHER_CUISINE_GROUP
    const list = groups.get(cuisine) ?? []
    list.push(dish)
    groups.set(cuisine, list)
  }
  return [...groups.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .map(([label, dishes]) => ({ label, dishes }))
}

function topCounts(
  results: DishItem[],
  pick: (dish: DishItem) => string[],
  limit: number
) {
  const counts = new Map<string, number>()
  for (const dish of results) {
    for (const value of pick(dish)) {
      counts.set(value, (counts.get(value) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
}

export const TaxonomyPageLayout: FC<Props> = ({
  breadcrumbLabel,
  breadcrumbHref,
  itemLabel,
  itemHref,
  description,
  results,
  jsonLd,
}) => {
  const heroImages = results
    .filter((d) => d.images?.[0])
    .slice(0, 6)
    .map((d) => ({ dish: d, src: d.images![0] }))

  const cuisineGroups = groupByCuisine(results, itemLabel)
  const showCuisineGroups = cuisineGroups.length >= 2

  const relatedTags = topCounts(
    results,
    (d) => d.tags.filter((t) => t !== itemLabel && !CUISINE_TAGS.has(t)),
    10
  )
  const categoryCounts = topCounts(results, (d) => [d.category], 5)

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb
        items={[
          { label: breadcrumbLabel, href: breadcrumbHref },
          { label: itemLabel, href: itemHref },
        ]}
      />
      <h1
        style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.375rem" }}
      >
        {itemLabel}の料理一覧
      </h1>
      <p style={{ color: "#aaa", fontSize: "0.875rem", marginBottom: "0.75rem" }}>
        {results.length}件
      </p>
      <p
        style={{
          color: "#7a6655",
          fontSize: "0.9375rem",
          lineHeight: 1.8,
          margin: "0 0 1.5rem",
        }}
      >
        {description}
      </p>

      {heroImages.length >= 3 && (
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            overflowX: "auto",
            marginBottom: "1.5rem",
          }}
        >
          {heroImages.map(({ dish, src }) => (
            <Link
              key={dish.id}
              href={`/dishes/${dish.id}/`}
              style={{
                position: "relative",
                flexShrink: 0,
                width: "7rem",
                height: "7rem",
                borderRadius: "0.5rem",
                overflow: "hidden",
                background: "#f0e6d6",
              }}
            >
              <Image
                src={src}
                alt={dish.name}
                fill
                style={{ objectFit: "cover" }}
                sizes="112px"
              />
            </Link>
          ))}
        </div>
      )}

      {(categoryCounts.length > 0 || relatedTags.length > 0) && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1.5rem",
            marginBottom: "1.5rem",
            padding: "0.875rem 1rem",
            background: "#fbf6ec",
            border: "1px solid #e8ddd0",
            borderRadius: "0.5rem",
          }}
        >
          {categoryCounts.length > 0 && (
            <div>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#aaa",
                  marginBottom: "0.375rem",
                }}
              >
                カテゴリ内訳
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                {categoryCounts.map(([category, count]) => (
                  <Link
                    key={category}
                    href={categoryPath(category)}
                    style={{
                      fontSize: "0.75rem",
                      color: "#7a4f2a",
                      background: "#f0e6d6",
                      borderRadius: "9999px",
                      padding: "0.125rem 0.5rem",
                      textDecoration: "none",
                    }}
                  >
                    {category} {count}
                  </Link>
                ))}
              </div>
            </div>
          )}
          {relatedTags.length > 0 && (
            <div>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#aaa",
                  marginBottom: "0.375rem",
                }}
              >
                関連タグ
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                {relatedTags.map(([tag, count]) => (
                  <Link
                    key={tag}
                    href={tagPath(tag)}
                    style={{
                      fontSize: "0.75rem",
                      color: "#7a4f2a",
                      background: "#f0e6d6",
                      borderRadius: "9999px",
                      padding: "0.125rem 0.5rem",
                      textDecoration: "none",
                    }}
                  >
                    {tag} {count}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showCuisineGroups ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
          {cuisineGroups.map(({ label, dishes }) => (
            <div key={label}>
              <h2
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  marginBottom: "0.625rem",
                }}
              >
                {label}
                <span style={{ color: "#aaa", fontWeight: 400, fontSize: "0.8rem" }}>
                  {" "}
                  {dishes.length}件
                </span>
              </h2>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
              >
                {dishes.map((dish) => (
                  <DishCard key={dish.id} dish={dish} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {results.map((dish) => (
            <DishCard key={dish.id} dish={dish} />
          ))}
        </div>
      )}
    </div>
  )
}

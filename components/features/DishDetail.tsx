import Link from "next/link"
import { FC } from "react"
import type { DishItem } from "../../types/dish"
import { FavoriteButton } from "./FavoriteButton"
import { ScoreBadge } from "./ScoreBadge"
import { TagList } from "./TagList"

type Props = {
  dish: DishItem
  allDishes: DishItem[]
}

const Section: FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section style={{ marginBottom: "1.5rem" }}>
    <h2
      style={{
        fontSize: "0.75rem",
        fontWeight: 700,
        color: "#666",
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        marginBottom: "0.5rem",
      }}
    >
      {title}
    </h2>
    {children}
  </section>
)

export const DishDetail: FC<Props> = ({ dish, allDishes }) => {
  const relatedDishes = dish.relatedIds
    .map((id) => allDishes.find((d) => d.id === id))
    .filter(Boolean) as DishItem[]

  return (
    <article>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.25rem" }}>
            {dish.name}
          </h1>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {dish.kana && (
              <span style={{ color: "#666", fontSize: "0.875rem" }}>{dish.kana}</span>
            )}
            {dish.englishName && (
              <span style={{ color: "#666", fontSize: "0.875rem" }}>
                / {dish.englishName}
              </span>
            )}
            {dish.originalName &&
              dish.originalName !== dish.englishName && (
                <span style={{ color: "#666", fontSize: "0.875rem" }}>
                  / {dish.originalName}
                </span>
              )}
          </div>
          <div style={{ marginTop: "0.375rem" }}>
            <Link
              href={`/categories/${encodeURIComponent(dish.category)}/`}
              style={{
                fontSize: "0.75rem",
                color: "#555",
                background: "#f0f0f0",
                padding: "0.125rem 0.5rem",
                borderRadius: "0.25rem",
                textDecoration: "none",
                marginRight: "0.375rem",
              }}
            >
              {dish.category}
            </Link>
            {dish.regions.map((r) => (
              <span
                key={r}
                style={{
                  fontSize: "0.75rem",
                  color: "#666",
                  marginRight: "0.375rem",
                }}
              >
                {r}
              </span>
            ))}
          </div>
        </div>
        <FavoriteButton id={dish.id} />
      </div>

      <Section title="ひとことで">
        <p style={{ fontSize: "1rem", lineHeight: 1.7 }}>{dish.summary}</p>
      </Section>

      <Section title="メニューで見たら">
        <p style={{ fontSize: "0.9rem", color: "#555", lineHeight: 1.7 }}>
          {dish.menuDescription}
        </p>
      </Section>

      <Section title="何が出てくるか">
        <ul style={{ paddingLeft: "1rem" }}>
          {dish.whatComesOut.map((item) => (
            <li key={item} style={{ fontSize: "0.9rem", color: "#555", marginBottom: "0.25rem" }}>
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="味・食感">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
          {dish.tasteAndTexture.map((t) => (
            <span
              key={t}
              style={{
                background: "#dbeafe",
                color: "#1d4ed8",
                borderRadius: "0.25rem",
                padding: "0.25rem 0.625rem",
                fontSize: "0.875rem",
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </Section>

      <Section title="頼む判断">
        <p
          style={{
            background: "#f0fdf4",
            border: "1px solid #86efac",
            borderRadius: "0.375rem",
            color: "#15803d",
            fontSize: "0.9rem",
            lineHeight: 1.7,
            padding: "0.75rem 1rem",
          }}
        >
          👍 {dish.orderAdvice}
        </p>
        {dish.caution && (
          <p
            style={{
              background: "#fffbeb",
              border: "1px solid #fcd34d",
              borderRadius: "0.375rem",
              color: "#92400e",
              fontSize: "0.875rem",
              lineHeight: 1.7,
              marginTop: "0.5rem",
              padding: "0.75rem 1rem",
            }}
          >
            ⚠️ {dish.caution}
          </p>
        )}
      </Section>

      <Section title="スコア">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          <ScoreBadge label="初心者向け" score={dish.beginnerFriendlyScore} />
          <ScoreBadge label="個性" score={dish.uniquenessScore} />
          <ScoreBadge label="重さ" score={dish.heavinessScore} />
          <ScoreBadge label="辛さ" score={dish.spicinessScore} />
        </div>
      </Section>

      {dish.similarItems.length > 0 && (
        <Section title="似ているもの">
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {dish.similarItems.map((s) => (
              <div
                key={s.name}
                style={{
                  background: "#f9f9f9",
                  border: "1px solid #e0e0e0",
                  borderRadius: "0.375rem",
                  padding: "0.625rem 0.875rem",
                }}
              >
                {s.id ? (
                  <Link
                    href={`/dishes/${s.id}/`}
                    style={{
                      color: "#2563eb",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    {s.name}
                  </Link>
                ) : (
                  <span style={{ color: "#333", fontWeight: 600 }}>{s.name}</span>
                )}
                <span style={{ color: "#666", fontSize: "0.875rem" }}>
                  {" "}
                  — {s.difference}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {relatedDishes.length > 0 && (
        <Section title="関連用語">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {relatedDishes.map((d) => (
              <Link
                key={d.id}
                href={`/dishes/${d.id}/`}
                style={{
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "0.375rem",
                  color: "#2563eb",
                  fontSize: "0.875rem",
                  padding: "0.375rem 0.75rem",
                  textDecoration: "none",
                }}
              >
                {d.name}
              </Link>
            ))}
          </div>
        </Section>
      )}

      <Section title="タグ">
        <TagList tags={dish.tags} />
      </Section>
    </article>
  )
}

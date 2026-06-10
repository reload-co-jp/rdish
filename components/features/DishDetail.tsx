import Image from "next/image"
import Link from "next/link"
import { FC } from "react"
import { regionLabel } from "../../lib/region"
import { categoryPath, countryPath } from "../../lib/taxonomy"
import type { DishItem } from "../../types/dish"
import { LinkedText } from "../elements/LinkedText"
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
        color: "#a89080",
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
              <span style={{ color: "#a89080", fontSize: "0.875rem" }}>{dish.kana}</span>
            )}
            {dish.englishName && (
              <span style={{ color: "#a89080", fontSize: "0.875rem" }}>
                / {dish.englishName}
              </span>
            )}
            {dish.originalName &&
              dish.originalName !== dish.englishName && (
                <span style={{ color: "#a89080", fontSize: "0.875rem" }}>
                  / {dish.originalName}
                </span>
              )}
            {dish.aliases && dish.aliases.length > 0 && dish.aliases.map((alias) => (
              <span key={alias} style={{ color: "#a89080", fontSize: "0.875rem" }}>
                / {alias}
              </span>
            ))}
          </div>
          <div style={{ marginTop: "0.375rem" }}>
            <Link
              href={categoryPath(dish.category)}
              style={{
                fontSize: "0.75rem",
                color: "#7a6655",
                background: "#f0e6d6",
                padding: "0.125rem 0.5rem",
                borderRadius: "0.25rem",
                textDecoration: "none",
                marginRight: "0.375rem",
              }}
            >
              {dish.category}
            </Link>
            {dish.regions.map((r, i) => {
              const label = regionLabel(r)
              return (
                <Link
                  key={`${label}-${i}`}
                  href={countryPath(label)}
                  style={{
                    fontSize: "0.75rem",
                    color: "#a89080",
                    marginRight: "0.375rem",
                    textDecoration: "underline",
                    textDecorationColor: "#d4b896",
                    textUnderlineOffset: "3px",
                  }}
                >
                  {label}
                </Link>
              )
            })}
          </div>
        </div>
        <FavoriteButton id={dish.id} />
      </div>

      {dish.images && dish.images.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            overflowX: "auto",
            marginBottom: "1.5rem",
            borderRadius: "0.5rem",
            scrollSnapType: "x mandatory",
          }}
        >
          {dish.images.map((src, i) => (
            <div
              key={src}
              style={{
                flexShrink: 0,
                width: dish.images!.length === 1 ? "100%" : "80%",
                maxWidth: "24rem",
                aspectRatio: "4/3",
                borderRadius: "0.5rem",
                overflow: "hidden",
                position: "relative",
                scrollSnapAlign: "start",
                background: "#f0e6d6",
              }}
            >
              <Image
                src={src}
                alt={i === 0 ? `${dish.name}の料理写真` : `${dish.name}の料理写真 ${i + 1}`}
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 80vw, 24rem"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      )}

      <Section title="ひとことで">
        <p style={{ fontSize: "1rem", lineHeight: 1.7 }}>
          <LinkedText text={dish.summary} dishes={allDishes} currentId={dish.id} />
        </p>
      </Section>

      <Section title="メニューで見たら">
        <p style={{ fontSize: "0.9rem", color: "#7a6655", lineHeight: 1.7 }}>
          <LinkedText text={dish.menuDescription} dishes={allDishes} currentId={dish.id} />
        </p>
      </Section>

      <Section title="何が出てくるか">
        <ul style={{ paddingLeft: "1rem" }}>
          {dish.whatComesOut.map((item) => (
            <li key={item} style={{ fontSize: "0.9rem", color: "#7a6655", marginBottom: "0.25rem" }}>
              <LinkedText text={item} dishes={allDishes} currentId={dish.id} />
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
                background: "#fef3c7",
                color: "#92400e",
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
            background: "#fef9f0",
            border: "1px solid #f5c97a",
            borderRadius: "0.375rem",
            color: "#92400e",
            fontSize: "0.9rem",
            lineHeight: 1.7,
            padding: "0.75rem 1rem",
          }}
        >
          <LinkedText text={dish.orderAdvice} dishes={allDishes} currentId={dish.id} />
        </p>
        {dish.caution && (
          <p
            style={{
              background: "#fff7ed",
              border: "1px solid #fb923c",
              borderRadius: "0.375rem",
              color: "#7c2d12",
              fontSize: "0.875rem",
              lineHeight: 1.7,
              marginTop: "0.5rem",
              padding: "0.75rem 1rem",
            }}
          >
            <LinkedText text={dish.caution} dishes={allDishes} currentId={dish.id} />
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
                  background: "#faf6f0",
                  border: "1px solid #e8ddd0",
                  borderRadius: "0.375rem",
                  padding: "0.625rem 0.875rem",
                }}
              >
                {s.id ? (
                  <Link
                    href={`/dishes/${s.id}/`}
                    style={{
                      color: "#b45309",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    {s.name}
                  </Link>
                ) : (
                  <span style={{ color: "#2d1f0e", fontWeight: 600 }}>{s.name}</span>
                )}
                <span style={{ color: "#a89080", fontSize: "0.875rem" }}>
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
                  background: "#fef3c7",
                  border: "1px solid #fcd34d",
                  borderRadius: "0.375rem",
                  color: "#92400e",
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

      {dish.source && dish.source.length > 0 && (
        <Section title="参考">
          <ul style={{ paddingLeft: 0, listStyle: "none" }}>
            {dish.source.map((url) => {
              const label = url.includes("ja.wikipedia.org")
                ? "Wikipedia（日本語）"
                : url.includes("en.wikipedia.org")
                  ? "Wikipedia（英語）"
                  : url.includes("it.wikipedia.org")
                    ? "Wikipedia（イタリア語）"
                    : url.includes("britannica.com")
                      ? "Britannica"
                      : url.includes("tasteatlas.com")
                        ? "TasteAtlas"
                        : url
              return (
                <li key={url} style={{ marginBottom: "0.25rem" }}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#7a6655", fontSize: "0.8rem" }}
                  >
                    {label}
                  </a>
                </li>
              )
            })}
          </ul>
        </Section>
      )}
    </article>
  )
}

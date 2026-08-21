import Image from "next/image"
import Link from "next/link"
import { FC } from "react"
import {
  Comparison,
  comparisonPath,
  comparisonTitle,
  comparisonsForDish,
  counterpart,
} from "../../lib/comparisons"
import { regionLabel } from "../../lib/region"
import type { DishItem } from "../../types/dish"
import { TagList } from "./TagList"

type Props = { comparison: Comparison }

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

const scoreDots = (score: number, max = 5) => (
  <span style={{ color: "#2d1f0e", fontWeight: 600, whiteSpace: "nowrap" }}>
    {"●".repeat(score)}
    <span style={{ opacity: 0.3 }}>{"●".repeat(max - score)}</span>
  </span>
)

const regionsText = (dish: DishItem) =>
  dish.regions.map(regionLabel).filter(Boolean).join("・") || "—"

type Row = { label: string; render: (dish: DishItem) => React.ReactNode }

const rows: Row[] = [
  { label: "分類", render: (d) => d.category },
  { label: "地域", render: (d) => regionsText(d) },
  { label: "どんなもの", render: (d) => d.menuDescription },
  { label: "出てくるもの", render: (d) => d.whatComesOut.join("／") || "—" },
  { label: "味・食感", render: (d) => d.tasteAndTexture.join("／") || "—" },
  { label: "初心者向け", render: (d) => scoreDots(d.beginnerFriendlyScore) },
  { label: "個性", render: (d) => scoreDots(d.uniquenessScore) },
  { label: "重さ", render: (d) => scoreDots(d.heavinessScore) },
  { label: "辛さ", render: (d) => scoreDots(d.spicinessScore) },
  { label: "注文のコツ", render: (d) => d.orderAdvice },
]

const DishColumnHead: FC<{ dish: DishItem }> = ({ dish }) => {
  const thumb = dish.images?.[0]
  return (
    <th
      scope="col"
      style={{
        borderBottom: "2px solid #e8ddd0",
        padding: "0.5rem 0.625rem",
        textAlign: "left",
        verticalAlign: "bottom",
        width: "40%",
      }}
    >
      <Link
        href={`/dishes/${dish.id}/`}
        style={{ color: "inherit", textDecoration: "none" }}
      >
        {thumb && (
          <Image
            src={thumb}
            alt={`${dish.name}の写真`}
            width={120}
            height={80}
            style={{
              width: "100%",
              maxWidth: "120px",
              height: "auto",
              borderRadius: "0.375rem",
              marginBottom: "0.375rem",
              objectFit: "cover",
            }}
          />
        )}
        <span
          style={{
            display: "block",
            fontSize: "1rem",
            fontWeight: 700,
            color: "#b45309",
          }}
        >
          {dish.name}
        </span>
        {dish.englishName && (
          <span
            style={{
              display: "block",
              fontSize: "0.6875rem",
              fontWeight: 400,
              color: "#a89080",
            }}
          >
            {dish.englishName}
          </span>
        )}
      </Link>
    </th>
  )
}

const DifferenceBlock: FC<{ from: DishItem; to: DishItem; text: string }> = ({
  from,
  to,
  text,
}) => (
  <div
    style={{
      background: "#faf6f0",
      border: "1px solid #e8ddd0",
      borderRadius: "0.375rem",
      padding: "0.75rem 0.875rem",
      marginBottom: "0.5rem",
    }}
  >
    <h3
      style={{
        fontSize: "0.875rem",
        fontWeight: 700,
        color: "#2d1f0e",
        margin: "0 0 0.25rem",
      }}
    >
      {from.name}から見た{to.name}との違い
    </h3>
    <p
      style={{
        color: "#7a6655",
        fontSize: "0.9375rem",
        lineHeight: 1.8,
        margin: 0,
      }}
    >
      {text}
    </p>
  </div>
)

const RelatedComparisons: FC<{ dish: DishItem; excludeSlug: string }> = ({
  dish,
  excludeSlug,
}) => {
  const others = comparisonsForDish(dish.id)
    .filter((c) => c.slug !== excludeSlug)
    .slice(0, 6)
  if (others.length === 0) return null
  return (
    <div style={{ marginBottom: "0.75rem" }}>
      <p
        style={{
          fontSize: "0.8125rem",
          color: "#a89080",
          margin: "0 0 0.375rem",
        }}
      >
        {dish.name}の他の比較
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
        {others.map((c) => (
          <Link
            key={c.slug}
            href={comparisonPath(c.slug)}
            style={{
              fontSize: "0.75rem",
              background: "#f0e6d6",
              color: "#b45309",
              border: "1px solid #e8ddd0",
              borderRadius: "9999px",
              padding: "0.125rem 0.625rem",
              textDecoration: "none",
            }}
          >
            {dish.name} と {counterpart(c, dish.id).name}
          </Link>
        ))}
      </div>
    </div>
  )
}

export const ComparisonDetail: FC<Props> = ({ comparison }) => {
  const { a, b, aDifference, bDifference, sharedTags } = comparison

  return (
    <article>
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: 800,
          marginBottom: "0.375rem",
        }}
      >
        {comparisonTitle(comparison)}
      </h1>
      <p
        style={{
          color: "#7a6655",
          fontSize: "0.9375rem",
          lineHeight: 1.8,
          margin: "0 0 1.5rem",
        }}
      >
        {a.name}と{b.name}は
        {sharedTags.length > 0
          ? `${sharedTags.slice(0, 3).join("・")}という共通点があり、`
          : ""}
        メニューで並ぶと迷いやすい組み合わせ。両方の説明・味・注文のコツを並べて違いを確認できます。
      </p>

      <Section title="違い">
        <DifferenceBlock from={a} to={b} text={aDifference} />
        <DifferenceBlock from={b} to={a} text={bDifference} />
      </Section>

      <Section title="比較表">
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              minWidth: "480px",
              borderCollapse: "collapse",
              fontSize: "0.875rem",
            }}
          >
            <thead>
              <tr>
                <th
                  scope="col"
                  style={{
                    borderBottom: "2px solid #e8ddd0",
                    padding: "0.5rem 0.625rem",
                    textAlign: "left",
                    color: "#a89080",
                    fontSize: "0.75rem",
                    width: "20%",
                  }}
                >
                  項目
                </th>
                <DishColumnHead dish={a} />
                <DishColumnHead dish={b} />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <th
                    scope="row"
                    style={{
                      borderBottom: "1px solid #e8ddd0",
                      padding: "0.5rem 0.625rem",
                      textAlign: "left",
                      verticalAlign: "top",
                      color: "#a89080",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.label}
                  </th>
                  <td
                    style={{
                      borderBottom: "1px solid #e8ddd0",
                      padding: "0.5rem 0.625rem",
                      verticalAlign: "top",
                      color: "#2d1f0e",
                      lineHeight: 1.7,
                    }}
                  >
                    {row.render(a)}
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #e8ddd0",
                      padding: "0.5rem 0.625rem",
                      verticalAlign: "top",
                      color: "#2d1f0e",
                      lineHeight: 1.7,
                    }}
                  >
                    {row.render(b)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {sharedTags.length > 0 && (
        <Section title="共通するタグ">
          <TagList tags={sharedTags} />
        </Section>
      )}

      <Section title="それぞれの詳細">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {[a, b].map((dish) => (
            <Link
              key={dish.id}
              href={`/dishes/${dish.id}/`}
              style={{
                background: "#b45309",
                borderRadius: "0.375rem",
                color: "#fff",
                fontSize: "0.875rem",
                fontWeight: 600,
                padding: "0.5rem 1rem",
                textDecoration: "none",
              }}
            >
              {dish.name}を詳しく見る
            </Link>
          ))}
        </div>
      </Section>

      <Section title="関連する比較">
        <RelatedComparisons dish={a} excludeSlug={comparison.slug} />
        <RelatedComparisons dish={b} excludeSlug={comparison.slug} />
      </Section>
    </article>
  )
}

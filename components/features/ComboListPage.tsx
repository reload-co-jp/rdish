import { FC, Fragment } from "react"
import AdSense, { InArticleAd } from "../elements/AdSense"
import { Breadcrumb } from "../elements/Breadcrumb"
import { DishCard } from "./DishCard"
import { AD_INTERVAL } from "./DishesPageContent"
import { buildItemListJsonLd } from "../../lib/taxonomy"
import type { DishItem } from "../../types/dish"

type Props = {
  heading: string
  path: string
  breadcrumbs: { label: string; href?: string }[]
  lead: string
  dishes: DishItem[]
}

// 2軸掛け合わせの料理一覧ページ（国×調理法 / 主食材×調理法 等）
export const ComboListPage: FC<Props> = ({
  heading,
  path,
  breadcrumbs,
  lead,
  dishes,
}) => {
  const jsonLd = buildItemListJsonLd(heading, path, dishes)

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb items={breadcrumbs} />
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: 800,
          marginBottom: "0.375rem",
        }}
      >
        {heading}
      </h1>
      <p
        style={{
          color: "var(--c-text-sub)",
          fontSize: "0.875rem",
          marginBottom: "0.75rem",
        }}
      >
        全{dishes.length}件
      </p>
      <p
        style={{
          color: "var(--c-text-2)",
          fontSize: "0.9375rem",
          lineHeight: 1.8,
          margin: "0 0 1.5rem",
        }}
      >
        {lead}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {dishes.map((dish, index) => (
          <Fragment key={dish.id}>
            {index > 0 && index % AD_INTERVAL === 0 && <InArticleAd />}
            <DishCard dish={dish} />
          </Fragment>
        ))}
      </div>
      <AdSense />
    </div>
  )
}

export function comboDescription(heading: string, dishes: DishItem[]): string {
  const top3 = dishes
    .slice(0, 3)
    .map((d) => d.name)
    .join("、")
  return `${heading}を紹介。${top3}など${dishes.length}件。名前・特徴・注文のコツがわかる料理辞典 RDish。`
}

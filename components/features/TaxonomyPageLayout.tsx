import { FC } from "react"
import { Breadcrumb } from "../elements/Breadcrumb"
import { DishCard } from "./DishCard"
import type { DishItem } from "../../types/dish"

type Props = {
  breadcrumbLabel: string
  breadcrumbHref?: string
  itemLabel: string
  itemHref?: string
  description: string
  results: DishItem[]
  jsonLd: object
}

export const TaxonomyPageLayout: FC<Props> = ({
  breadcrumbLabel,
  breadcrumbHref,
  itemLabel,
  itemHref,
  description,
  results,
  jsonLd,
}) => (
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
    <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.375rem" }}>
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
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {results.map((dish) => (
        <DishCard key={dish.id} dish={dish} />
      ))}
    </div>
  </div>
)

import Link from "next/link"
import { FC } from "react"
import type { DishItem } from "../../types/dish"
import { TagList } from "./TagList"

type Props = {
  dish: DishItem
}

export const DishCard: FC<Props> = ({ dish }) => (
  <div
    style={{
      background: "#2a2a2a",
      border: "1px solid #3a3a3a",
      borderRadius: "0.5rem",
      padding: "1rem",
      transition: "border-color 0.15s",
    }}
  >
    <Link
      href={`/dishes/${dish.id}/`}
      style={{ textDecoration: "none", color: "inherit", display: "block", marginBottom: "0.625rem" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "0.375rem",
        }}
      >
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>{dish.name}</h3>
        <span
          style={{
            fontSize: "0.7rem",
            color: "#aaa",
            background: "#3a3a3a",
            padding: "0.125rem 0.375rem",
            borderRadius: "0.25rem",
            whiteSpace: "nowrap",
            marginLeft: "0.5rem",
          }}
        >
          {dish.category}
          {dish.regions[0] ? ` / ${dish.regions[0]}` : ""}
        </span>
      </div>
      <p style={{ fontSize: "0.875rem", color: "#ccc", marginBottom: "0.625rem" }}>
        {dish.summary}
      </p>
      <p style={{ fontSize: "0.75rem", color: "#88aaff", marginBottom: 0 }}>
        👉 {dish.orderAdvice}
      </p>
    </Link>
    <TagList tags={dish.tags.slice(0, 5)} />
  </div>
)

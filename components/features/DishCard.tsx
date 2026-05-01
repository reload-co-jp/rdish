import Image from "next/image"
import Link from "next/link"
import { FC } from "react"
import type { DishItem } from "../../types/dish"
import { TagList } from "./TagList"

type Props = {
  dish: DishItem
}

export const DishCard: FC<Props> = ({ dish }) => {
  const thumb = dish.images?.[0]
  return (
    <div
      style={{
        background: "#fffdf8",
        border: "1px solid #e8ddd0",
        borderRadius: "0.5rem",
        overflow: "hidden",
        transition: "border-color 0.15s",
      }}
    >
      <Link
        href={`/dishes/${dish.id}/`}
        style={{
          textDecoration: "none",
          color: "inherit",
          display: "flex",
          alignItems: "flex-end",
          padding: "1rem",
          gap: "0.75rem",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.375rem",
              marginBottom: "0.375rem",
            }}
          >
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>{dish.name}</h3>
            <span
              style={{
                fontSize: "0.65rem",
                color: "#7a6655",
                background: "#f0e6d6",
                padding: "0.125rem 0.375rem",
                borderRadius: "0.25rem",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {dish.category}
              {dish.regions[0] ? ` / ${dish.regions[0]}` : ""}
            </span>
          </div>
          <p style={{ fontSize: "0.875rem", color: "#7a6655", marginBottom: "0.5rem" }}>
            {dish.summary}
          </p>
          <p style={{ fontSize: "0.75rem", color: "#b45309" }}>
            {dish.orderAdvice}
          </p>
        </div>
        {thumb && (
          <div
            style={{
              position: "relative",
              flexShrink: 0,
              width: "5rem",
              height: "5rem",
              borderRadius: "0.375rem",
              overflow: "hidden",
              background: "#f0e6d6",
            }}
          >
            <Image
              src={thumb}
              alt={dish.name}
              fill
              style={{ objectFit: "cover" }}
              sizes="80px"
            />
          </div>
        )}
      </Link>
      <div style={{ padding: "0 1rem 1rem" }}>
        <TagList tags={dish.tags.slice(0, 5)} />
      </div>
    </div>
  )
}

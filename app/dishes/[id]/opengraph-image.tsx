import { ImageResponse } from "next/og"
import dishes from "../../../data/dishes.json"
import type { DishItem } from "../../../types/dish"

export const dynamic = "force-static"
export const alt = "料理図鑑 | RDish"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export function generateStaticParams() {
  return (dishes as DishItem[]).map((d) => ({ id: d.id }))
}

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const dish = (dishes as DishItem[]).find((d) => d.id === id)
  if (!dish) return new Response("Not found", { status: 404 })

  const summary = dish.summary.length > 60 ? dish.summary.slice(0, 60) + "…" : dish.summary

  return new ImageResponse(
    (
      <div
        style={{
          background: "#fffdf8",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", background: "#b45309", height: 8 }} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            padding: "0 80px",
          }}
        >
          <div style={{ display: "flex", fontSize: 24, color: "#a89080", marginBottom: 16 }}>
            RDish — 料理図鑑
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 80,
              fontWeight: 800,
              color: "#2d1f0e",
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            {dish.name}
          </div>
          {dish.kana && (
            <div style={{ display: "flex", fontSize: 28, color: "#a89080", marginBottom: 20 }}>
              {dish.kana}
            </div>
          )}
          <div
            style={{
              display: "flex",
              fontSize: 26,
              color: "#7a6655",
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            {summary}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "0 40px 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              background: "#f0e6d6",
              border: "2px solid #e8ddd0",
              borderRadius: 8,
              padding: "6px 20px",
              fontSize: 22,
              color: "#7a4f2a",
            }}
          >
            {dish.category}
          </div>
        </div>
      </div>
    ),
    size,
  )
}

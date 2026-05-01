import { ImageResponse } from "next/og"
import dishes from "../../../data/dishes.json"
import type { DishCategory, DishItem } from "../../../types/dish"

export const dynamic = "force-static"
export const alt = "カテゴリ別 料理一覧 | RDish"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const CATEGORIES: DishCategory[] = [
  "料理", "食材", "調理法", "ソース", "香辛料",
  "チーズ", "野菜", "肉", "魚介", "デザート", "飲み物",
]

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category }))
}

export default async function Image({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params
  const decoded = decodeURIComponent(category) as DishCategory
  const count = (dishes as DishItem[]).filter((d) => d.category === decoded).length

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
          }}
        >
          <div style={{ display: "flex", fontSize: 28, color: "#a89080", marginBottom: 16 }}>
            RDish — 料理図鑑
          </div>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 800, color: "#2d1f0e", marginBottom: 24 }}>
            {decoded}
          </div>
          <div
            style={{
              display: "flex",
              background: "#f0e6d6",
              border: "2px solid #e8ddd0",
              borderRadius: 12,
              padding: "12px 32px",
              fontSize: 32,
              color: "#7a4f2a",
            }}
          >
            {count}件
          </div>
        </div>
      </div>
    ),
    size,
  )
}

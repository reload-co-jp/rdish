import { ImageResponse } from "next/og"
import dishes from "../../../data/dishes.json"
import { dishMatchesRegion } from "../../../lib/region"
import { countryItems, taxonomyById } from "../../../lib/taxonomy"
import type { DishItem } from "../../../types/dish"

export const dynamic = "force-static"
export const alt = "国・地域別 料理一覧 | RDish"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export function generateStaticParams() {
  return countryItems.map(({ id }) => ({ country: id }))
}

export default async function Image({
  params,
}: {
  params: Promise<{ country: string }>
}) {
  const { country } = await params
  const item = taxonomyById(countryItems, country)
  if (!item) return new Response("Not found", { status: 404 })
  const count = (dishes as DishItem[]).filter((d) => dishMatchesRegion(d, item.label)).length

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
            {item.label}
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
            {count}件の料理
          </div>
        </div>
      </div>
    ),
    size,
  )
}

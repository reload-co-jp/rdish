import { readFileSync } from "fs"
import { ImageResponse } from "next/og"
import path from "path"
import sharp from "sharp"
import dishes from "../../../data/dishes.json"
import type { DishItem } from "../../../types/dish"

export const dynamic = "force-static"
export const alt = "料理図鑑 | RDish"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export function generateStaticParams() {
  return (dishes as DishItem[]).map((d) => ({ id: d.id }))
}

async function loadImageDataUrl(imagePath: string): Promise<string | null> {
  try {
    const filePath = path.join(process.cwd(), "public", imagePath)
    const buffer = readFileSync(filePath)
    const resized = await sharp(buffer)
      .resize(540, 630, { fit: "cover", position: "centre" })
      .jpeg({ quality: 80 })
      .toBuffer()
    return `data:image/jpeg;base64,${resized.toString("base64")}`
  } catch {
    return null
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const dish = (dishes as DishItem[]).find((d) => d.id === id)
  if (!dish) return new Response("Not found", { status: 404 })

  const imageDataUrl = dish.images?.[0] ? await loadImageDataUrl(dish.images[0]) : null
  const summary = dish.summary.length > 60 ? dish.summary.slice(0, 60) + "…" : dish.summary

  return new ImageResponse(
    (
      <div
        style={{
          background: "#fffdf8",
          width: "100%",
          height: "100%",
          display: "flex",
          fontFamily: "sans-serif",
        }}
      >
        {imageDataUrl ? (
          <>
            {/* 左: 料理写真 */}
            <div
              style={{
                width: "45%",
                height: "100%",
                display: "flex",
                flexShrink: 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageDataUrl}
                alt={dish.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            {/* 右: テキスト */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "48px 56px",
                borderLeft: "4px solid #b45309",
              }}
            >
              <div style={{ display: "flex", fontSize: 20, color: "#a89080", marginBottom: 16 }}>
                RDish — 料理図鑑
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: dish.name.length > 8 ? 56 : 72,
                  fontWeight: 800,
                  color: "#2d1f0e",
                  marginBottom: 12,
                  lineHeight: 1.1,
                }}
              >
                {dish.name}
              </div>
              {dish.kana && (
                <div style={{ display: "flex", fontSize: 22, color: "#a89080", marginBottom: 16 }}>
                  {dish.kana}
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  fontSize: 20,
                  color: "#7a6655",
                  lineHeight: 1.6,
                }}
              >
                {summary}
              </div>
              <div
                style={{
                  display: "flex",
                  marginTop: 24,
                  background: "#f0e6d6",
                  border: "2px solid #e8ddd0",
                  borderRadius: 8,
                  padding: "4px 16px",
                  fontSize: 18,
                  color: "#7a4f2a",
                  alignSelf: "flex-start",
                }}
              >
                {dish.category}
              </div>
            </div>
          </>
        ) : (
          /* 画像なし: 既存の中央揃えレイアウト */
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              height: "100%",
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
        )}
      </div>
    ),
    size,
  )
}

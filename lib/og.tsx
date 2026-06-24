import { ImageResponse } from "next/og"

export const ogSize = { width: 1200, height: 630 }
export const ogContentType = "image/png"

export function normalizeOgText(text: string) {
  return text.replaceAll("℃", "°C")
}

type OgImageOptions = {
  title: string | string[]
  titleSize?: number
  subtitle?: string
  badge?: string
}

export function buildOgImage({ title, titleSize = 64, subtitle, badge }: OgImageOptions) {
  const titleLines = (Array.isArray(title) ? title : [title]).map(normalizeOgText)
  const normalizedSubtitle = subtitle ? normalizeOgText(subtitle) : undefined
  const normalizedBadge = badge ? normalizeOgText(badge) : undefined

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
          {titleLines.map((line, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                fontSize: titleSize,
                fontWeight: 800,
                color: "#2d1f0e",
                marginBottom: i === titleLines.length - 1 ? 24 : 16,
              }}
            >
              {line}
            </div>
          ))}
          {normalizedBadge && (
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
              {normalizedBadge}
            </div>
          )}
          {normalizedSubtitle && (
            <div style={{ display: "flex", fontSize: 28, color: "#7a6655" }}>{normalizedSubtitle}</div>
          )}
        </div>
      </div>
    ),
    ogSize,
  )
}

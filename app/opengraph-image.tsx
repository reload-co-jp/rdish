import { ImageResponse } from "next/og"

export const dynamic = "force-static"
export const alt = "RDish — いつでも聞ける飾らない料理図鑑"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
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
          <div style={{ display: "flex", fontSize: 96, fontWeight: 800, color: "#2d1f0e", marginBottom: 16 }}>
            RDish
          </div>
          <div style={{ display: "flex", fontSize: 32, color: "#a89080", marginBottom: 32 }}>
            いつでも聞ける飾らない料理図鑑
          </div>
          <div
            style={{
              display: "flex",
              gap: 16,
            }}
          >
            {["フランス料理", "イタリア料理", "スペイン料理", "チーズ", "調理法"].map((tag) => (
              <div
                key={tag}
                style={{
                  display: "flex",
                  background: "#f0e6d6",
                  border: "2px solid #e8ddd0",
                  borderRadius: 8,
                  padding: "8px 20px",
                  fontSize: 24,
                  color: "#7a4f2a",
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  )
}

import { ImageResponse } from "next/og"

export const dynamic = "force-static"
export const alt = "逆引き検索 — 特徴から料理名を調べる | RDish"
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
          <div style={{ display: "flex", fontSize: 28, color: "#a89080", marginBottom: 16 }}>
            RDish — 料理図鑑
          </div>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 800, color: "#2d1f0e", marginBottom: 24 }}>
            逆引き検索
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#7a6655" }}>
            「白くてとろっとしたチーズ」「緑色で渦巻きの野菜」
          </div>
        </div>
      </div>
    ),
    size,
  )
}

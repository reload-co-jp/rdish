import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "ページが見つかりません",
  robots: { index: false },
}

export default function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
      <p style={{ fontSize: "3rem", fontWeight: 800, color: "#e8ddd0", marginBottom: "1rem" }}>
        404
      </p>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#2d1f0e", marginBottom: "0.5rem" }}>
        ページが見つかりません
      </h1>
      <p style={{ fontSize: "0.875rem", color: "#a89080", marginBottom: "2rem", lineHeight: 1.7 }}>
        URLが間違っているか、削除された可能性があります。
      </p>
      <Link
        href="/"
        style={{
          display: "inline-block",
          background: "#f0e6d6",
          border: "1px solid #e8ddd0",
          borderRadius: "0.375rem",
          color: "#7a4f2a",
          fontSize: "0.875rem",
          padding: "0.625rem 1.25rem",
          textDecoration: "none",
        }}
      >
        トップに戻る
      </Link>
    </div>
  )
}

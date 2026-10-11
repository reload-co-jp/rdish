import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "ページが見つかりません",
  robots: { index: false },
}

const links = [
  { href: "/search/", label: "料理を検索" },
  { href: "/categories/", label: "カテゴリ" },
  { href: "/countries/", label: "国から探す" },
  { href: "/tags/", label: "タグ" },
]

export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        minHeight: "calc(100dvh - 12rem)",
        padding: "2rem 0",
      }}
    >
      <p
        style={{
          fontSize: "4.5rem",
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: "0.05em",
          color: "var(--c-border)",
          marginBottom: "1.25rem",
        }}
      >
        404
      </p>
      <h1
        style={{
          fontSize: "1.25rem",
          fontWeight: 700,
          color: "var(--c-text)",
          marginBottom: "0.5rem",
        }}
      >
        ページが見つかりません
      </h1>
      <p
        style={{
          fontSize: "0.875rem",
          color: "var(--c-text-sub)",
          marginBottom: "2rem",
          lineHeight: 1.7,
        }}
      >
        URLが間違っているか、削除された可能性があります。
      </p>
      <Link
        href="/"
        style={{
          display: "inline-block",
          background: "var(--c-accent)",
          borderRadius: "var(--radius)",
          color: "var(--c-bg)",
          fontSize: "0.875rem",
          fontWeight: 700,
          padding: "0.75rem 1.5rem",
          textDecoration: "none",
          marginBottom: "1.5rem",
        }}
      >
        トップに戻る
      </Link>
      <nav
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0.5rem",
        }}
      >
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            style={{
              background: "var(--c-tint)",
              border: "1px solid var(--c-border)",
              borderRadius: "999px",
              color: "var(--c-accent)",
              fontSize: "0.8125rem",
              padding: "0.375rem 0.875rem",
              textDecoration: "none",
            }}
          >
            {label}
          </Link>
        ))}
      </nav>
    </div>
  )
}

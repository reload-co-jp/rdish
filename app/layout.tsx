import type { Metadata } from "next"
import Link from "next/link"
import "./reset.css"

const SITE_URL = "https://rdish.reload.co.jp"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "RDish — 外食で困らない料理図鑑",
    template: "%s | RDish",
  },
  description:
    "メニューの「これ何？」をその場で解決する。料理名・食材名・調理法をすばやく調べられるWebアプリです。",
  openGraph: {
    siteName: "RDish",
    locale: "ja_JP",
    type: "website",
    url: SITE_URL,
  },
  twitter: {
    card: "summary",
    site: "@r_dish_reload",
  },
  alternates: {
    canonical: "/",
  },
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="ja">
      <body>
        <header
          style={{
            backgroundColor: "#ffffff",
            borderBottom: "1px solid #e0e0e0",
            padding: "0.75rem 1rem",
          }}
        >
          <div
            style={{
              maxWidth: "48rem",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Link
              href="/"
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                alignItems: "baseline",
                gap: "0.5rem",
              }}
            >
              <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#1a1a1a" }}>
                RDish
              </span>
              <span style={{ fontSize: "0.75rem", color: "#666" }}>料理図鑑</span>
            </Link>
            <nav style={{ display: "flex", gap: "1rem" }}>
              <Link href="/reverse/" style={{ color: "#555", fontSize: "0.875rem", textDecoration: "none" }}>
                逆引き
              </Link>
              <Link href="/favorites/" style={{ color: "#555", fontSize: "0.875rem", textDecoration: "none" }}>
                お気に入り
              </Link>
            </nav>
          </div>
        </header>
        <main
          style={{
            maxWidth: "48rem",
            margin: "0 auto",
            padding: "1.5rem 1rem",
            minHeight: "calc(100dvh - 7rem)",
          }}
        >
          {children}
        </main>
        <footer
          style={{
            borderTop: "1px solid #e0e0e0",
            color: "#999",
            fontSize: "0.75rem",
            padding: "1rem",
            textAlign: "center",
          }}
        >
          <p>RDish — 外食で困らない料理図鑑</p>
        </footer>
      </body>
    </html>
  )
}
export default RootLayout

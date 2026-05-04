import type { Metadata } from "next"
import Script from "next/script"
import Link from "next/link"
import "./reset.css"

const GA_ID = "G-Y2D3TYWS2Q"

const SITE_URL = "https://rdish.reload.co.jp"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "RDish — いつでも聞ける飾らない料理図鑑",
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
        {process.env.NODE_ENV === "production" && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}</Script>
          </>
        )}
        <header
          style={{
            backgroundColor: "#fffdf8",
            borderBottom: "1px solid #e8ddd0",
            padding: "0.75rem 1rem",
          }}
        >
          <div
            style={{
              maxWidth: "48rem",
              margin: "0 auto",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.75rem",
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
              <span
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 800,
                  color: "#2d1f0e",
                }}
              >
                RDish
              </span>
              <span style={{ fontSize: "0.75rem", color: "#a89080" }}>
                料理図鑑
              </span>
            </Link>
            <nav style={{ display: "flex", gap: "1rem" }}>
              <Link
                href="/dishes/"
                style={{
                  color: "#7a6655",
                  fontSize: "0.875rem",
                  textDecoration: "none",
                }}
              >
                新着
              </Link>
              <Link
                href="/reverse/"
                style={{
                  color: "#7a6655",
                  fontSize: "0.875rem",
                  textDecoration: "none",
                }}
              >
                逆引き
              </Link>
              <Link
                href="/favorites/"
                style={{
                  color: "#7a6655",
                  fontSize: "0.875rem",
                  textDecoration: "none",
                }}
              >
                お気に入り
              </Link>
              <Link
                href="/about/"
                style={{
                  color: "#7a6655",
                  fontSize: "0.875rem",
                  textDecoration: "none",
                }}
              >
                このサイトについて
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
            borderTop: "1px solid #e8ddd0",
            color: "#a89080",
            fontSize: "0.75rem",
            padding: "1rem",
            textAlign: "center",
          }}
        >
          <p>RDish — いつでも聞ける飾らない料理図鑑</p>
          <p
            style={{
              marginTop: "0.5rem",
              display: "flex",
              justifyContent: "center",
              gap: "1rem",
            }}
          >
            <Link
              href="/dishes/"
              style={{ color: "#a89080", textDecoration: "underline" }}
            >
              新着
            </Link>
            <Link
              href="/countries/"
              style={{ color: "#a89080", textDecoration: "underline" }}
            >
              国から探す
            </Link>
            <Link
              href="/about/"
              style={{ color: "#a89080", textDecoration: "underline" }}
            >
              このサイトについて
            </Link>
          </p>
        </footer>
      </body>
    </html>
  )
}
export default RootLayout

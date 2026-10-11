import type { Metadata } from "next"
import Script from "next/script"
import Link from "next/link"
import { Noto_Serif_JP } from "next/font/google"
import "./reset.css"
import { RouteAd } from "../components/elements/AdSense"
import { MobileMenu } from "../components/elements/MobileMenu"

const serif = Noto_Serif_JP({
  weight: ["500", "600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-serif",
})

const NAV = [
  { href: "/articles/", label: "読みもの", en: "Stories" },
  { href: "/dishes/", label: "図鑑", en: "Dictionary" },
  { href: "/countries/", label: "国から探す", en: "Countries" },
  { href: "/categories/", label: "カテゴリ", en: "Categories" },
  { href: "/reverse/", label: "逆引き", en: "Reverse" },
  { href: "/tags/", label: "タグ", en: "Tags" },
  { href: "/favorites/", label: "お気に入り", en: "Favorites" },
]

const FOOTER_NAV = [
  { href: "/dishes/", label: "新着" },
  { href: "/articles/", label: "読みもの" },
  { href: "/categories/", label: "カテゴリ" },
  { href: "/countries/", label: "国から探す" },
  { href: "/tags/", label: "タグ" },
  { href: "/collections/", label: "特集" },
  { href: "/compare/", label: "違いを比較" },
  { href: "/reverse/k/", label: "苦手から探す" },
  { href: "/about/", label: "このサイトについて" },
]

const GA_ID = "G-Y2D3TYWS2Q"
const ADSENSE_ID = "ca-pub-6542845006087970"

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
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "RDish — いつでも聞ける飾らない料理図鑑",
      },
    ],
  },
  twitter: {
    card: "summary",
    site: "@r_dish_reload",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      noimageindex: true,
    },
  },
  alternates: {
    canonical: "/",
  },
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="ja" className={serif.variable}>
      <head>
        <link
          rel="alternate"
          type="text/markdown"
          href="/llms.txt"
          title="LLMs.txt"
        />
      </head>
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
            <Script
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
              strategy="afterInteractive"
              crossOrigin="anonymous"
            />
          </>
        )}
        <header className="site-header">
          <div className="site-header__inner">
            <Link href="/" className="logo" aria-label="RDish トップへ">
              <span className="logo__mark">RDish</span>
              <span className="logo__sub">Food Dictionary</span>
            </Link>
            <nav className="nav nav--desktop" aria-label="メイン">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
            <MobileMenu items={NAV} />
          </div>
        </header>
        <main className="site-main">
          {children}
          <RouteAd />
        </main>
        <footer className="site-footer">
          <div className="site-footer__inner">
            <div>
              <p className="logo__mark">RDish</p>
              <p style={{ marginTop: "0.75rem" }}>
                いつでも聞ける飾らない料理図鑑
              </p>
            </div>
            <nav aria-label="フッター">
              {FOOTER_NAV.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </footer>
      </body>
    </html>
  )
}
export default RootLayout

import Link from "next/link"
import { Breadcrumb } from "../../../components/elements/Breadcrumb"
import {
  avoidPath,
  avoidTopics,
  safePath,
  safeTopics,
} from "../../../lib/dietary"

const SITE_URL = "https://rdish.reload.co.jp"

const title = "苦手なもの・アレルギーから料理を探す"
const description =
  "辛いもの・乳製品・小麦・魚介・肉・卵・ナッツなど、食べられないものから外食メニューを探せる一覧。避けたい料理と、代わりに頼める料理をまとめています。"

export const metadata = {
  title,
  description,
  alternates: { canonical: "/reverse/k/" },
  openGraph: { title, description, url: "/reverse/k/" },
}

const cardStyle = {
  background: "#fffdf8",
  border: "1px solid #e8ddd0",
  borderRadius: "0.5rem",
  color: "inherit",
  display: "block",
  padding: "0.75rem 0.875rem",
  textDecoration: "none",
}

export default function DietaryIndexPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    url: `${SITE_URL}/reverse/k/`,
    hasPart: [
      ...safeTopics.map(({ axis, safeTotal }) => ({
        "@type": "ItemList",
        name: axis.safeTitle,
        url: `${SITE_URL}${safePath(axis.slug)}`,
        numberOfItems: safeTotal,
      })),
      ...avoidTopics.map(({ axis, avoidDishes }) => ({
        "@type": "ItemList",
        name: axis.avoidTitle,
        url: `${SITE_URL}${avoidPath(axis.slug)}`,
        numberOfItems: avoidDishes.length,
      })),
    ],
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb
        items={[
          { label: "逆引き検索", href: "/reverse/" },
          { label: "苦手なものから探す", href: "/reverse/k/" },
        ]}
      />
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: 800,
          marginBottom: "0.375rem",
        }}
      >
        苦手なもの・アレルギーから探す
      </h1>
      <p
        style={{
          color: "#7a6655",
          fontSize: "0.9375rem",
          lineHeight: 1.8,
          margin: "0 0 1.5rem",
        }}
      >
        食べられないもの・苦手な味から、外食で頼める料理を探せます。「これは避けたい」という料理の一覧と、代わりに頼みやすい料理の両方を用意しました。
      </p>

      <section style={{ marginBottom: "2rem" }}>
        <h2
          style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}
        >
          苦手でも食べられる料理
        </h2>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          {safeTopics.map(({ axis, safeTotal }) => (
            <Link key={axis.slug} href={safePath(axis.slug)} style={cardStyle}>
              <span
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: 700,
                  color: "#2d1f0e",
                }}
              >
                {axis.safeTitle}
              </span>
              <span
                style={{
                  display: "block",
                  color: "#a89080",
                  fontSize: "0.75rem",
                  marginTop: "0.125rem",
                }}
              >
                該当{safeTotal}件
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2
          style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}
        >
          注文前に確認したい料理
        </h2>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          {avoidTopics.map(({ axis, avoidDishes }) => (
            <Link key={axis.slug} href={avoidPath(axis.slug)} style={cardStyle}>
              <span
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: 700,
                  color: "#2d1f0e",
                }}
              >
                {axis.avoidTitle}
              </span>
              <span
                style={{
                  display: "block",
                  color: "#a89080",
                  fontSize: "0.75rem",
                  marginTop: "0.125rem",
                }}
              >
                該当{avoidDishes.length}件
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

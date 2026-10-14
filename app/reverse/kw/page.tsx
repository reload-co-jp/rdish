import Link from "next/link"
import { Breadcrumb } from "../../../components/elements/Breadcrumb"
import {
  reverseKeywordGroups,
  reverseKeywordPath,
} from "../../../lib/reverseKeywords"

const title = "特徴で比べる料理グループ"
const description =
  "「あっさり」「辛い料理」「魚料理」などと対照的な持ち味ごとに料理をグループ化。共通する特徴と、重さ・辛さ・食べやすさの違いを並べて紹介します。"

export const metadata = {
  title,
  description,
  alternates: { canonical: "/reverse/kw/" },
  openGraph: { title, description, url: "/reverse/kw/" },
}

export default function ReverseKeywordIndexPage() {
  return (
    <div>
      <Breadcrumb
        items={[
          { label: "逆引き検索", href: "/reverse/" },
          { label: "特徴で比較", href: "/reverse/kw/" },
        ]}
      />
      <h1
        style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.375rem" }}
      >
        {title}
      </h1>
      <p
        style={{
          color: "var(--c-text-2)",
          fontSize: "0.9375rem",
          lineHeight: 1.8,
          margin: "0 0 1.5rem",
        }}
      >
        {description}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {reverseKeywordGroups.map(({ slug, keyword, dishes }) => (
          <Link
            key={slug}
            href={reverseKeywordPath(slug)}
            style={{
              border: "1px solid var(--c-border)",
              borderRadius: "999px",
              color: "var(--c-text)",
              fontSize: "0.8125rem",
              padding: "0.25rem 0.625rem",
              textDecoration: "none",
            }}
          >
            「{keyword}」と対照的
            <span style={{ color: "var(--c-text-sub)" }}> {dishes.length}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

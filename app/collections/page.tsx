import Link from "next/link"
import { Breadcrumb } from "../../components/elements/Breadcrumb"
import { allCollections, collectionPath } from "../../lib/collections"

const SITE_URL = "https://rdish.reload.co.jp"

const title = `特集一覧（全${allCollections.length}件）`
const description =
  "「辛くない韓国料理」「初心者におすすめのフランス料理」など、辛さ・こってり度・入門しやすさの独自スコアで選んだ特集一覧。外食メニュー選びの参考に。"

export const metadata = {
  title,
  description,
  alternates: { canonical: "/collections/" },
  openGraph: { title, description, url: "/collections/" },
}

export default function CollectionsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "特集一覧",
    url: `${SITE_URL}/collections/`,
    hasPart: allCollections.map((collection) => ({
      "@type": "ItemList",
      name: collection.title,
      url: `${SITE_URL}${collectionPath(collection.slug)}`,
      numberOfItems: collection.dishes.length,
    })),
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb items={[{ label: "特集", href: "/collections/" }]} />
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.375rem" }}>
        特集一覧
      </h1>
      <p style={{ color: "#aaa", fontSize: "0.875rem", marginBottom: "0.75rem" }}>
        全{allCollections.length}件
      </p>
      <p
        style={{
          color: "#7a6655",
          fontSize: "0.9375rem",
          lineHeight: 1.8,
          margin: "0 0 1.5rem",
        }}
      >
        辛さ・こってり度・入門しやすさの独自スコアをもとに、シーン別に料理を選べる特集です。
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {allCollections.map((collection) => (
          <Link
            key={collection.slug}
            href={collectionPath(collection.slug)}
            style={{
              display: "block",
              padding: "0.875rem 1rem",
              background: "#fffdf8",
              border: "1px solid #e8ddd0",
              borderRadius: "0.5rem",
              textDecoration: "none",
            }}
          >
            <span style={{ color: "#4a3a2a", fontSize: "1rem", fontWeight: 700 }}>
              {collection.title}
            </span>
            <span style={{ color: "#a89080", fontSize: "0.8125rem", marginLeft: "0.5rem" }}>
              {collection.dishes.length}件
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

import { Breadcrumb } from "../../components/elements/Breadcrumb"
import {
  ComparisonsPageContent,
  paginateComparisons,
} from "../../components/features/ComparisonsPageContent"
import { allComparisons, comparisonPath } from "../../lib/comparisons"

const SITE_URL = "https://rdish.reload.co.jp"

const title = `料理の違い比較一覧（全${allComparisons.length}組）`
const description =
  "「パエリアとピラフの違い」「コンフィとブレゼの違い」など、似ている料理・食材・調理法の違いを1ページで比較。味・重さ・辛さ・注文のコツを並べて確認できます。"

export const metadata = {
  title,
  description,
  alternates: { canonical: "/compare/" },
  openGraph: { title, description, url: "/compare/" },
}

export default function CompareIndexPage() {
  const comparisons = paginateComparisons(allComparisons, 1)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "料理の違い比較一覧",
    url: `${SITE_URL}/compare/`,
    hasPart: comparisons.map((comparison) => ({
      "@type": "WebPage",
      name: `${comparison.a.name}と${comparison.b.name}の違い`,
      url: `${SITE_URL}${comparisonPath(comparison.slug)}`,
    })),
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb items={[{ label: "違いを比較", href: "/compare/" }]} />
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: 800,
          marginBottom: "0.375rem",
        }}
      >
        料理の違い比較
      </h1>
      <p
        style={{ color: "#aaa", fontSize: "0.875rem", marginBottom: "0.75rem" }}
      >
        全{allComparisons.length}組
      </p>
      <p
        style={{
          color: "#7a6655",
          fontSize: "0.9375rem",
          lineHeight: 1.8,
          margin: "0 0 1.5rem",
        }}
      >
        名前も見た目も似ていて紛らわしい料理・食材・調理法を、2つ並べて比較します。どこが違うのか、どちらを頼むと好みに合うのかを、味・重さ・辛さ・注文のコツから確認できます。
      </p>
      <ComparisonsPageContent
        comparisons={comparisons}
        page={1}
        totalCount={allComparisons.length}
      />
    </div>
  )
}

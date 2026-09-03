import { Breadcrumb } from "../../components/elements/Breadcrumb"
import { DishNetworkGraph } from "../../components/features/DishNetworkGraph"
import { allDishes } from "../../lib/dishes"

const SITE_URL = "https://rdish.reload.co.jp"

const title = `料理の相関図（全${allDishes.length}品）`
const description =
  "料理・食材・調理法を「似ている」でつないだネットワーク図。ノードをクリックすると要約と似ている項目、辞典ページへのリンクが見られます。"

export const metadata = {
  title,
  description,
  alternates: { canonical: "/network/" },
  openGraph: { title, description, url: "/network/" },
}

export default function NetworkPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "料理の相関図",
    url: `${SITE_URL}/network/`,
    description,
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb items={[{ label: "料理の相関図", href: "/network/" }]} />
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: 800,
          marginBottom: "0.375rem",
        }}
      >
        料理の相関図
      </h1>
      <p
        style={{ color: "#aaa", fontSize: "0.875rem", marginBottom: "0.75rem" }}
      >
        全{allDishes.length}品
      </p>
      <p
        style={{
          color: "#7a6655",
          fontSize: "0.9375rem",
          lineHeight: 1.8,
          marginBottom: "1.25rem",
        }}
      >
        「似ている」で結ばれた料理・食材・調理法のネットワーク図。近くにある点ほど味や作り方が近い仲間で、点をクリックすると要約と似ている項目が見られます。比較は
        <a href="/compare/" style={{ color: "#b45309" }}>
          違いを比較
        </a>
        でも読めます。
      </p>

      <DishNetworkGraph />
    </div>
  )
}

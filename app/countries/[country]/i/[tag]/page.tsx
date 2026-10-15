import { notFound } from "next/navigation"
import { Breadcrumb } from "../../../../../components/elements/Breadcrumb"
import { Fragment } from "react"
import AdSense, {
  InArticleAd,
} from "../../../../../components/elements/AdSense"
import { DishCard } from "../../../../../components/features/DishCard"
import { AD_INTERVAL } from "../../../../../components/features/DishesPageContent"
import {
  comboIngredientPath,
  countryIngredientCombos,
  findIngredientCombo,
} from "../../../../../lib/countryTagCombos"
import { buildItemListJsonLd } from "../../../../../lib/taxonomy"

export function generateStaticParams() {
  return countryIngredientCombos.map(({ countryId, tagId }) => ({
    country: countryId,
    tag: tagId,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; tag: string }>
}) {
  const { country, tag } = await params
  const combo = findIngredientCombo(country, tag)
  if (!combo) notFound()
  const path = comboIngredientPath(combo.countryId, combo.tagId)
  const top3 = combo.dishes
    .slice(0, 3)
    .map((d) => d.name)
    .join("、")
  const title = `${combo.countryLabel}の${combo.tagLabel}料理一覧（全${combo.dishes.length}件）`
  const description = `${combo.tagLabel}を使った${combo.countryLabel}の料理を一覧で紹介。${top3}など${combo.dishes.length}件。名前・特徴・注文のコツがわかる料理辞典 RDish。`
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path },
  }
}

export default async function CountryIngredientPage({
  params,
}: {
  params: Promise<{ country: string; tag: string }>
}) {
  const { country, tag } = await params
  const combo = findIngredientCombo(country, tag)
  if (!combo) notFound()
  const path = comboIngredientPath(combo.countryId, combo.tagId)
  const jsonLd = buildItemListJsonLd(
    `${combo.countryLabel}の${combo.tagLabel}料理一覧`,
    path,
    combo.dishes
  )

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb
        items={[
          { label: "国・地域", href: "/countries/" },
          { label: combo.countryLabel, href: `/countries/${combo.countryId}/` },
          { label: `${combo.tagLabel}料理`, href: path },
        ]}
      />
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: 800,
          marginBottom: "0.375rem",
        }}
      >
        {combo.countryLabel}の{combo.tagLabel}料理一覧
      </h1>
      <p
        style={{
          color: "var(--c-text-sub)",
          fontSize: "0.875rem",
          marginBottom: "0.75rem",
        }}
      >
        全{combo.dishes.length}件
      </p>
      <p
        style={{
          color: "var(--c-text-2)",
          fontSize: "0.9375rem",
          lineHeight: 1.8,
          margin: "0 0 1.5rem",
        }}
      >
        {combo.tagLabel}を主役にした{combo.countryLabel}
        の料理を集めました。メニューで見かけたときに、どんな料理か・味の特徴・注文のコツをすぐ調べられます。
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {combo.dishes.map((dish, index) => (
          <Fragment key={dish.id}>
            {index > 0 && index % AD_INTERVAL === 0 && <InArticleAd />}
            <DishCard dish={dish} />
          </Fragment>
        ))}
      </div>
      <AdSense />
    </div>
  )
}

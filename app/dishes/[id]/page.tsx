import { FC } from "react"
import { notFound } from "next/navigation"
import { Breadcrumb } from "../../../components/elements/Breadcrumb"
import { DishDetail } from "../../../components/features/DishDetail"
import { RecentlyViewedTracker } from "../../../components/features/RecentlyViewedTracker"
import dishes from "../../../data/dishes.json"
import type { DishItem } from "../../../types/dish"

export function generateStaticParams() {
  return (dishes as DishItem[]).map((d) => ({ id: d.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const dish = (dishes as DishItem[]).find((d) => d.id === id)
  if (!dish) return {}
  const title = `${dish.name}とは？外食メニューで見たときの意味・味・頼む判断`
  return {
    title,
    description: dish.summary,
    alternates: { canonical: `/dishes/${dish.id}/` },
    openGraph: {
      title,
      description: dish.summary,
      url: `/dishes/${dish.id}/`,
      type: "article",
    },
  }
}

const DishPageContent: FC<{ dish: DishItem; allDishes: DishItem[] }> = ({
  dish,
  allDishes,
}) => (
  <>
    <RecentlyViewedTracker id={dish.id} />
    <DishDetail dish={dish} allDishes={allDishes} />
  </>
)

export default async function DishPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const dish = (dishes as DishItem[]).find((d) => d.id === id)
  if (!dish) notFound()

  const SITE_URL = "https://rdish.reload.co.jp"

  const definedTermLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: dish.name,
    description: dish.summary,
    inDefinedTermSet: { "@type": "DefinedTermSet", name: "RDish 料理図鑑", url: SITE_URL },
    url: `${SITE_URL}/dishes/${dish.id}/`,
    inLanguage: "ja",
    ...(dish.englishName ? { alternateName: dish.englishName } : {}),
    ...(dish.images?.[0] ? { image: `${SITE_URL}${dish.images[0]}` } : {}),
  }

  const faqEntries = [
    dish.whatComesOut.length > 0 && {
      "@type": "Question",
      name: `${dish.name}を注文すると何が出てくる？`,
      acceptedAnswer: { "@type": "Answer", text: dish.whatComesOut.join("、") },
    },
    dish.tasteAndTexture.length > 0 && {
      "@type": "Question",
      name: `${dish.name}の味・食感は？`,
      acceptedAnswer: { "@type": "Answer", text: dish.tasteAndTexture.join("、") },
    },
    dish.orderAdvice && {
      "@type": "Question",
      name: `${dish.name}を注文するときのコツは？`,
      acceptedAnswer: { "@type": "Answer", text: dish.orderAdvice },
    },
  ].filter(Boolean)

  const faqLd = faqEntries.length > 0
    ? { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqEntries }
    : null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}
      <Breadcrumb items={[{ label: "料理一覧", href: "/dishes/" }, { label: dish.name }]} />
      <DishPageContent dish={dish} allDishes={dishes as DishItem[]} />
    </>
  )
}

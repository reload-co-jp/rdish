import { FC } from "react"
import { notFound } from "next/navigation"
import { Breadcrumb } from "../../../components/elements/Breadcrumb"
import { DishDetail } from "../../../components/features/DishDetail"
import { RecentlyViewedTracker } from "../../../components/features/RecentlyViewedTracker"
import AdSense from "../../../components/elements/AdSense"
import { allDishes } from "../../../lib/dishes"
import type { DishItem } from "../../../types/dish"

export function generateStaticParams() {
  return allDishes.map((d) => ({ id: d.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const dish = allDishes.find((d) => d.id === id)
  if (!dish) return {}
  const aliases = dish.aliases ?? []
  const aliasPart = aliases.length > 0 ? ` ${aliases.map((a) => `「${a}」`).join(" / ")}` : ""
  const title = `「${dish.name}」とは？${aliasPart} メニューで見たときに困らない料理図鑑`
  const description = `${dish.name}とは、${dish.summary}`
    .slice(0, 160)
    .trimEnd()
  const firstImage = dish.images?.[0]
  const imageAlt = `${dish.name}の料理写真`
  const metadataImages = [
    ...(firstImage
      ? [
          {
            url: firstImage,
            alt: imageAlt,
          },
        ]
      : []),
    {
      url: `/dishes/${dish.id}/opengraph-image`,
      width: 1200,
      height: 630,
      alt: `${dish.name} | RDish`,
    },
  ]
  return {
    title,
    description,
    alternates: { canonical: `/dishes/${dish.id}/` },
    openGraph: {
      title,
      description,
      url: `/dishes/${dish.id}/`,
      type: "article",
      images: metadataImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: firstImage
        ? [{ url: firstImage, alt: imageAlt }]
        : [
            {
              url: `/dishes/${dish.id}/opengraph-image`,
              alt: `${dish.name} | RDish`,
            },
          ],
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
  const dish = allDishes.find((d) => d.id === id)
  if (!dish) notFound()

  const SITE_URL = "https://rdish.reload.co.jp"
  const canonicalUrl = `${SITE_URL}/dishes/${dish.id}/`
  const alternateNames = [
    dish.kana,
    dish.englishName,
    dish.originalName && dish.originalName !== dish.englishName
      ? dish.originalName
      : null,
    ...(dish.aliases ?? []),
  ].filter(Boolean)
  const relatedDishes = dish.relatedIds
    .map((relatedId) => allDishes.find((d) => d.id === relatedId))
    .filter(Boolean) as DishItem[]
  const sourceUrls = (dish.source ?? []).filter((source) =>
    source.startsWith("http")
  )

  const definedTermLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "@id": `${canonicalUrl}#term`,
    name: dish.name,
    identifier: dish.id,
    description: dish.summary,
    termCode: dish.id,
    inLanguage: "ja",
    url: canonicalUrl,
    mainEntityOfPage: canonicalUrl,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "RDish 料理図鑑",
      url: `${SITE_URL}/dishes/`,
    },
    keywords: dish.tags.join(", "),
    about: [
      { "@type": "Thing", name: dish.category },
      ...dish.tags.map((tag) => ({ "@type": "Thing", name: tag })),
    ],
    mentions: relatedDishes.map((relatedDish) => ({
      "@type": "DefinedTerm",
      name: relatedDish.name,
      url: `${SITE_URL}/dishes/${relatedDish.id}/`,
    })),
    ...(sourceUrls.length > 0 ? { sameAs: sourceUrls } : {}),
    ...(alternateNames.length > 0 ? { alternateName: alternateNames } : {}),
    ...(dish.images?.[0]
      ? {
          image: dish.images.map((image) => ({
            "@type": "ImageObject",
            url: `${SITE_URL}${image}`,
            caption: `${dish.name}の料理写真`,
          })),
        }
      : {}),
  }

  const webPageLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": canonicalUrl,
    url: canonicalUrl,
    name: `${dish.name}とは？`,
    description: dish.summary,
    inLanguage: "ja",
    isPartOf: { "@type": "WebSite", name: "RDish", url: SITE_URL },
    primaryImageOfPage: dish.images?.[0]
      ? {
          "@type": "ImageObject",
          url: `${SITE_URL}${dish.images[0]}`,
          caption: `${dish.name}の料理写真`,
        }
      : undefined,
    mainEntity: { "@id": `${canonicalUrl}#term` },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "section"],
    },
  }

  const faqEntries = [
    {
      "@type": "Question",
      name: `${dish.name}とは何ですか？`,
      acceptedAnswer: { "@type": "Answer", text: dish.summary },
    },
    dish.whatComesOut.length > 0 && {
      "@type": "Question",
      name: `${dish.name}を注文すると何が出てくる？`,
      acceptedAnswer: { "@type": "Answer", text: dish.whatComesOut.join("、") },
    },
    dish.tasteAndTexture.length > 0 && {
      "@type": "Question",
      name: `${dish.name}の味・食感は？`,
      acceptedAnswer: {
        "@type": "Answer",
        text: dish.tasteAndTexture.join("、"),
      },
    },
    dish.orderAdvice && {
      "@type": "Question",
      name: `${dish.name}を注文するときのコツは？`,
      acceptedAnswer: { "@type": "Answer", text: dish.orderAdvice },
    },
    dish.caution && {
      "@type": "Question",
      name: `${dish.name}を食べるときの注意点は？`,
      acceptedAnswer: { "@type": "Answer", text: dish.caution },
    },
  ].filter(Boolean)

  const faqLd =
    faqEntries.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqEntries,
        }
      : null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}
      <Breadcrumb
        items={[
          { label: "料理一覧", href: "/dishes/" },
          { label: dish.name, href: `/dishes/${dish.id}/` },
        ]}
      />
      <DishPageContent dish={dish} allDishes={allDishes} />
      <AdSense />
    </>
  )
}

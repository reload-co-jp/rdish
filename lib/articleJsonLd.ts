import type { Article } from "../types/article"
import type { DishItem } from "../types/dish"
import { organizationJsonLd, organizationRef } from "./organization"

const SITE_URL = "https://rdish.reload.co.jp"

function countCharacters(article: Article): number {
  const texts = [
    article.intro,
    ...(article.history ?? []).map((h) => h.body),
    ...article.regions.flatMap((region) => [
      region.intro ?? "",
      ...region.dishes.flatMap((d) => [
        ...d.properties.map((p) => p.value),
        ...(d.differences ?? []).map((diff) => diff.value),
        d.note ?? "",
      ]),
    ]),
    ...article.callouts.flatMap((c) => [c.body, ...(c.items ?? []).map((i) => i.description)]),
  ]
  return texts.join("").length
}

export function buildArticleJsonLd(article: Article, relatedDishes: DishItem[]) {
  const firstImage = relatedDishes.find((d) => d.images && d.images.length > 0)?.images?.[0]
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${SITE_URL}/articles/${article.slug}/#article`,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${SITE_URL}/articles/${article.slug}/`,
        },
        headline: article.subtitle ? `${article.title}——${article.subtitle}` : article.title,
        description: article.description,
        datePublished: article.publishedAt,
        ...(article.updatedAt ? { dateModified: article.updatedAt } : {}),
        inLanguage: "ja",
        ...(firstImage ? { image: `${SITE_URL}${firstImage}` } : {}),
        articleSection: "料理コラム",
        wordCount: countCharacters(article),
        author: organizationRef,
        publisher: organizationRef,
        mentions: relatedDishes.map((d) => ({
          "@type": "Thing",
          name: d.name,
          url: `${SITE_URL}/dishes/${d.id}/`,
        })),
        keywords: relatedDishes.map((d) => d.name).join(", "),
      },
      organizationJsonLd,
    ],
  }
}

import type { Article } from "../types/article"
import type { DishItem } from "../types/dish"

const SITE_URL = "https://rdish.reload.co.jp"

export function buildArticleJsonLd(article: Article, relatedDishes: DishItem[]) {
  const firstImage = relatedDishes.find((d) => d.images && d.images.length > 0)?.images?.[0]
  return {
    "@context": "https://schema.org",
    "@type": "Article",
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
    author: {
      "@type": "Organization",
      name: "RDish",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "RDish",
      url: SITE_URL,
    },
    mentions: relatedDishes.map((d) => ({
      "@type": "Thing",
      name: d.name,
      url: `${SITE_URL}/dishes/${d.id}/`,
    })),
    keywords: relatedDishes.map((d) => d.name).join(", "),
  }
}

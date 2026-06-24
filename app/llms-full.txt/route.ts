import { allArticles } from "../../lib/articles"
import { allDishes } from "../../lib/dishes"
import { regionLabel } from "../../lib/region"

export const dynamic = "force-static"

const SITE_URL = "https://rdish.reload.co.jp"

function markdownResponse(body: string) {
  return new Response(body, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  })
}

function field(label: string, value: string | string[] | undefined) {
  if (!value) return ""
  const text = Array.isArray(value) ? value.filter(Boolean).join(" / ") : value
  return text ? `- ${label}: ${text}\n` : ""
}

export function GET() {
  const dishSections = allDishes
    .map((dish) => {
      const aliases = [
        dish.kana,
        dish.englishName,
        dish.originalName && dish.originalName !== dish.englishName ? dish.originalName : undefined,
        ...(dish.aliases ?? []),
      ].filter(Boolean) as string[]
      const regions = dish.regions.map(regionLabel)
      const related = dish.relatedIds
        .map((id) => allDishes.find((d) => d.id === id))
        .filter(Boolean)
        .map((d) => `${d!.name} (${SITE_URL}/dishes/${d!.id}/)`)

      return `## ${dish.name}

- URL: ${SITE_URL}/dishes/${dish.id}/
${field("Aliases", aliases)}${field("Category", dish.category)}${field("Regions", regions)}${field("Summary", dish.summary)}${field("Menu meaning", dish.menuDescription)}${field("What comes out", dish.whatComesOut)}${field("Taste and texture", dish.tasteAndTexture)}${field("Ordering advice", dish.orderAdvice)}${field("Caution", dish.caution)}${field("Tags", dish.tags)}${field("Related entries", related)}${field("Sources", dish.source)}
`
    })
    .join("\n")

  const articleSections = allArticles
    .map(
      (article) => `## ${article.title}

- URL: ${SITE_URL}/articles/${article.slug}/
- Published: ${article.publishedAt}
${field("Updated", article.updatedAt)}${field("Subtitle", article.subtitle)}${field("Description", article.description)}
`,
    )
    .join("\n")

  return markdownResponse(`# RDish Full LLM Corpus

Canonical site: ${SITE_URL}
Language: Japanese
Use canonical URLs when citing RDish.

# Glossary Entries

${dishSections}

# Articles

${articleSections}
`)
}

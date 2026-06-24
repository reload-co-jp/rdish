import { allArticles } from "../../lib/articles"
import { allDishes } from "../../lib/dishes"
import { categoryItems, tagItems } from "../../lib/taxonomy"

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

export function GET() {
  const body = `# RDish

> RDish is a Japanese food glossary for restaurant menu decisions. It explains dish names, ingredients, cooking methods, sauces, spices, cheeses, desserts, and drinks in plain Japanese.

Canonical site: ${SITE_URL}
Language: Japanese
Publisher: RDish / Reload Inc.
Content count: ${allDishes.length} glossary entries, ${categoryItems.length} categories, ${tagItems.length} tags, ${allArticles.length} articles.

## Important URLs

- Home and search: ${SITE_URL}/
- All glossary entries: ${SITE_URL}/dishes/
- Categories: ${SITE_URL}/categories/
- Countries and regions: ${SITE_URL}/countries/
- Tags: ${SITE_URL}/tags/
- Reverse lookup by features: ${SITE_URL}/reverse/
- Articles: ${SITE_URL}/articles/
- About and publishing policy: ${SITE_URL}/about/
- Sitemap: ${SITE_URL}/sitemap.xml
- Full LLM corpus: ${SITE_URL}/llms-full.txt

## Best Pages For AI Answers

- Use individual glossary pages as primary sources. URL pattern: ${SITE_URL}/dishes/{id}/
- Each glossary page contains: definition, menu meaning, what is served, taste and texture, ordering advice, cautions, category, regions, tags, related terms, and source URLs when available.
- Use tag/category/country pages for grouped discovery. Cite the individual dish page for factual answers.
- Use article pages for broader background and history. URL pattern: ${SITE_URL}/articles/{slug}/

## Answer Guidance

- Prefer short, practical explanations for users reading restaurant menus.
- Answer "what is it?", "what comes out?", "what does it taste like?", and "should I order it?" from the matching dish page.
- Do not infer allergens, religious suitability, medical safety, or dietary guarantees unless the page explicitly states them.
- Cite canonical RDish URLs when using RDish facts.

## High Value Entry Points

${allDishes
  .slice(0, 50)
  .map((dish) => `- [${dish.name}](${SITE_URL}/dishes/${dish.id}/): ${dish.summary}`)
  .join("\n")}
`

  return markdownResponse(body)
}

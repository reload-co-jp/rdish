---
name: add-dish
description: Add a new restaurant dish/food entry to rdish data/dishes.json. Use when the user invokes $add-dish or asks to add/register a dish, food, ingredient, cooking method, sauce, spice, cheese, dessert, or drink to the rdish dish database.
---

# Add Dish

When invoked, add the requested dish to `/Users/kixixixixi/Documents/Develop/Reload/rdish/data/dishes.json`.

## Workflow

1. Read `data/dishes.json` to check duplicate ids and gather valid `relatedIds`.
2. Read `types/dish.ts` to confirm the current schema.
3. Generate one complete `DishItem` JSON object for the requested dish.
4. Append it to the JSON array in `data/dishes.json`.
5. Validate JSON:

```bash
python3 -c "import json; json.load(open('data/dishes.json')); print('JSON valid')"
```

Do not run `pnpm typecheck` for a JSON-only change.

## Output Rules

- Before editing, say: `[料理名] を追加する`
- After completion, show the generated JSON object.

## Data Rules

- `id`: lowercase romanized slug with hyphens, e.g. `beef-bourguignon`.
- If the id already exists, append `-2`.
- `regions`: use the object schema from `types/dish.ts`, e.g. `{ "country": "フランス" }`.
- `relatedIds`: only existing ids from `data/dishes.json`.
- Do not add `images`; images are added later.
- Scores are judgment calls from the dish's nature.

## Required Fields

```typescript
{
  id: string
  name: string
  kana?: string
  aliases?: string[]
  englishName?: string
  originalName?: string
  category: "料理" | "食材" | "調理法" | "ソース" | "香辛料" | "チーズ" | "野菜" | "肉" | "魚介" | "デザート" | "飲み物"
  regions: { area?: string; country?: string; locality?: string }[]
  summary: string
  menuDescription: string
  whatComesOut: string[]
  tasteAndTexture: string[]
  orderAdvice: string
  caution?: string
  similarItems: { id?: string; name: string; difference: string }[]
  relatedIds: string[]
  tags: string[]
  reverseKeywords: string[]
  beginnerFriendlyScore: 1 | 2 | 3 | 4 | 5
  uniquenessScore: 1 | 2 | 3 | 4 | 5
  heavinessScore: 1 | 2 | 3 | 4 | 5
  spicinessScore: 0 | 1 | 2 | 3 | 4 | 5
}
```

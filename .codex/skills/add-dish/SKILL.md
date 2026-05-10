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
5. Download images for the added dish only:

```bash
node scripts/download-images.mjs <dish-id>
```

This updates the added object's `images` field and stores files under `public/images/dishes/<dish-id>/`.

6. Validate JSON:

```bash
python3 -c "import json; json.load(open('data/dishes.json')); print('JSON valid')"
```

Do not run `pnpm typecheck` for a JSON-only change.

## Output Rules

- Before editing, say: `[料理名] を追加する`
- After completion, show the generated JSON object.
- Include the downloaded image paths in the final output.

## Tag Policy

Tags use **5 dimensions** (4–8 total per dish):

| Dimension | Examples |
|-----------|---------|
| Cuisine | `フランス料理` / `イタリア料理` / `中国料理` / `四川料理` — country-level only |
| Dish type | `前菜` / `主菜` / `スープ` / `サラダ` / `デザート` / `ソース` |
| Main ingredient | `牛肉` / `豚肉` / `魚介` / `チーズ` / `野菜` / `ハーブ` / `スパイス` |
| Cooking method | `煮込み` / `揚げ物` / `焼き物` / `蒸し料理` / `炒め物` / `グリル` / `燻製` |
| Flavor/texture | `ピリ辛` / `こってり` / `あっさり` / `クリーミー` / `香ばしい` |

**Prohibited patterns:**
- City/region name tags (`ナポリ`, `プロヴァンス`, `ブルゴーニュ`) → use country cuisine tag
- Dimension-mixed tags (`イタリアチーズ`, `フランスソース`, `地中海野菜`) → use single-dimension tags instead

See `CLAUDE.md` Tag Policy section for the full canonical tag list.

## Data Rules

- `id`: lowercase romanized slug with hyphens, e.g. `beef-bourguignon`.
- If the id or name already exists, do not add a duplicate entry. Report that it already exists.
- `regions`: use the object schema from `types/dish.ts`, e.g. `{ "country": "フランス" }`.
- `relatedIds`: only existing ids from `data/dishes.json`.
- Do not hand-write `images`; run `node scripts/download-images.mjs <dish-id>` after adding the entry.
- If image download returns no images, keep `images: []` and mention that no image was found.
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
  tags: string[]  // 4–8 tags. See Tag Policy below.
  reverseKeywords: string[]
  beginnerFriendlyScore: 1 | 2 | 3 | 4 | 5
  uniquenessScore: 1 | 2 | 3 | 4 | 5
  heavinessScore: 1 | 2 | 3 | 4 | 5
  spicinessScore: 0 | 1 | 2 | 3 | 4 | 5
}
```

---
description: dishes.jsonに新しい料理エントリを追加する
argument-hint: <料理名>
---

# Add Dish

`$ARGUMENTS` を dishes.json に追加する。

## 手順

1. `/Users/kixixixixi/Documents/Develop/Reload/rdish/data/dishes.json` を Read して既存エントリ確認（重複チェック・relatedIds候補収集）
2. `/Users/kixixixixi/Documents/Develop/Reload/rdish/types/dish.ts` を Read して型確認
3. `$ARGUMENTS` の料理について以下フィールドを全て生成:

```typescript
{
  id: string           // ローマ字・ハイフン区切り（例: "beef-bourguignon"）
  name: string         // 日本語表記
  kana?: string        // ひらがな読み
  aliases?: string[]   // 別名・表記揺れ
  englishName?: string
  originalName?: string // 原語名
  category: DishCategory // "料理"|"食材"|"調理法"|"ソース"|"香辛料"|"チーズ"|"野菜"|"肉"|"魚介"|"デザート"|"飲み物"
  regions: string[]    // 発祥地域（例: ["フランス"]）
  summary: string      // 1〜2文の簡潔な説明
  menuDescription: string // メニューに書かれた場合の丁寧な説明
  whatComesOut: string[]  // 実際に運ばれてくるもの（3〜5項目）
  tasteAndTexture: string[] // 味・食感の特徴（3〜4項目）
  orderAdvice: string  // 注文するかどうかの判断基準
  caution?: string     // アレルギー・注意事項（必要なら）
  similarItems: SimilarItem[] // 似ている料理と違い（2〜4項目）
  relatedIds: string[] // 既存dishesのidから関連するもの
  tags: string[]       // 検索・フィルタ用タグ（5〜10個）
  reverseKeywords: string[] // この料理が苦手な人が好むもの（3〜5個）
  beginnerFriendlyScore: 1|2|3|4|5  // 初心者に向いているか
  uniquenessScore: 1|2|3|4|5        // 珍しさ・個性
  heavinessScore: 1|2|3|4|5         // 重さ・ボリューム感
  spicinessScore: 0|1|2|3|4|5       // 辛さ
}
```

4. 生成したJSONオブジェクトを dishes.json の配列末尾に追加（Edit使用）
5. `python3 -c "import json; json.load(open('data/dishes.json')); print('JSON valid')"` で検証
6. `pnpm typecheck` は不要（JSONファイルのみの変更）

## 制約

- `id` は既存と重複禁止。重複なら `-2` 付加
- `relatedIds` は必ず既存dishesに存在するidのみ使用
- スコアは独断で設定（料理の性質から判断）
- `images` フィールドは追加しない（後で別途追加）
- 生成前に「[料理名] を追加する」と1行表示
- 追加完了後に生成したJSONを表示

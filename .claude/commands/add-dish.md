---
description: dishes.jsonに新しい料理エントリを追加する
argument-hint: <料理名>
---

# Add Dish

`$ARGUMENTS` を dishes.json に追加する。

## 手順

1. `/Users/kixixixixi/Documents/Develop/Reload/rdish/data/dishes.json` を Read して既存エントリ確認（重複チェック・relatedIds候補収集）
2. `/Users/kixixixixi/Documents/Develop/Reload/rdish/types/dish.ts` を Read して型確認
3. **ソース調査**: WebSearch で `$ARGUMENTS` の信頼性の高い参考情報（Wikipedia日本語・英語版、公式サイト等）を検索し、上位2〜3件を WebFetch で取得。取得内容を `summary`・`menuDescription`・`whatComesOut`・`tasteAndTexture`・`orderAdvice` の記述根拠として使用。URLは `source` フィールドに格納。
4. `$ARGUMENTS` の料理について以下フィールドを全て生成:

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
  source: string[]     // ソース調査で取得したURLの配列
  tags: string[]       // 検索・フィルタ用タグ（4〜8個）— タグ方針参照
  reverseKeywords: string[] // この料理が苦手な人が好むもの（3〜5個）
  beginnerFriendlyScore: 1|2|3|4|5  // 初心者に向いているか
  uniquenessScore: 1|2|3|4|5        // 珍しさ・個性
  heavinessScore: 1|2|3|4|5         // 重さ・ボリューム感
  spicinessScore: 0|1|2|3|4|5       // 辛さ
}
```

5. 生成したJSONオブジェクトを dishes.json の配列末尾に追加（Edit使用）
6. `python3 -c "import json; json.load(open('data/dishes.json')); print('JSON valid')"` で検証
7. `node scripts/download-images.mjs <追加したidをスペース区切り>` で画像ダウンロード（dishes.jsonも自動更新される）
8. `pnpm typecheck` は不要（JSONファイルのみの変更）

## タグ方針

タグは **5次元** で構成し、各次元から適切なものを選ぶ（合計4〜8個）:

| 次元         | 例                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------ |
| 料理圏       | `フランス料理` / `イタリア料理` / `中国料理` / `四川料理` 等（国レベル統一）               |
| 料理カテゴリ | `前菜` / `主菜` / `スープ` / `サラダ` / `デザート` / `パスタ` / `ソース` 等                |
| 主食材       | `牛肉` / `豚肉` / `鶏肉` / `魚介` / `チーズ` / `野菜` / `ハーブ` / `スパイス` 等           |
| 調理法       | `煮込み` / `揚げ物` / `焼き物` / `蒸し料理` / `炒め物` / `グリル` / `ロースト` / `燻製` 等 |
| 風味・特徴   | `ピリ辛` / `こってり` / `あっさり` / `クリーミー` / `香ばしい` / `ジューシー` 等           |

**禁止パターン:**

- 地名タグ（`ナポリ` / `プロヴァンス` / `ブルゴーニュ` 等）→ 国料理タグに置換
- 次元混合タグ（`イタリアチーズ` / `フランスソース` / `地中海野菜` 等）→ 食材/ソース タグ単体で

詳細: `CLAUDE.md` の「タグ方針」セクション

## 制約

- `id` は既存と重複禁止。
- `relatedIds` は必ず既存dishesに存在するidのみ使用
- スコアは独断で設定（料理の性質から判断）
- `source` は必ず実際にfetchしたURLを格納。URL を捏造しない
- `images` フィールドは追加しない（download-images.mjs が自動追加する）
- 生成前に「[料理名] を追加する」と1行表示
- 追加完了後に生成したJSONを表示
- 画像ダウンロード完了後、取得できた枚数を報告

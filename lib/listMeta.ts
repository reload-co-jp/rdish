import type { DishItem } from "../types/dish"

// 一覧・比較ページの <title> / meta description 生成。
// 検索結果で「件数」「代表的な料理名」「得られる情報」が一目でわかる形にしてCTRを上げる。

const TITLE_MAX = 36
const DESCRIPTION_MAX = 140

/** 候補のうち長さに収まる最初のものを返す（最後の候補は必ず返す） */
function fitTitle(candidates: string[]): string {
  return candidates.find((t) => t.length <= TITLE_MAX) ?? candidates.at(-1)!
}

/** 本文が長すぎる場合は本文側を削り、末尾の訴求文を残す */
function fitDescription(body: string, tail: string): string {
  const full = `${body}${tail}`
  if (full.length <= DESCRIPTION_MAX) return full
  const room = DESCRIPTION_MAX - tail.length - 1
  if (room < 30) return full.slice(0, DESCRIPTION_MAX - 1) + "…"
  return `${body.slice(0, room)}…${tail}`
}

/**
 * 検索結果に載せる代表料理。データ順ではなく、
 * 料理カテゴリ → 頼みやすさ（=知名度の目安）→ 個性が控えめな順で選ぶ。
 */
export function representativeDishes(
  dishes: DishItem[],
  n: number
): DishItem[] {
  return [...dishes]
    .sort(
      (a, b) =>
        Number(b.category === "料理") - Number(a.category === "料理") ||
        b.beginnerFriendlyScore - a.beginnerFriendlyScore ||
        a.uniquenessScore - b.uniquenessScore
    )
    .slice(0, n)
}

function representativeNames(dishes: DishItem[], n: number): string {
  return representativeDishes(dishes, n)
    .map((d) => d.name)
    .join("、")
}

/** 「フランス」→「フランス料理」 */
export function cuisineName(countryLabel: string): string {
  return countryLabel.endsWith("料理") ? countryLabel : `${countryLabel}料理`
}

// ---- 国別一覧 -------------------------------------------------------------

export function countryListTitle(
  countryLabel: string,
  count: number,
  page?: number
): string {
  const cuisine = cuisineName(countryLabel)
  if (page && page > 1) {
    return `${cuisine}の種類・名前一覧（${page}ページ目・全${count}件）`
  }
  return fitTitle([
    `${cuisine}の種類・名前一覧【全${count}件】定番から珍しい料理まで`,
    `${cuisine}の種類・名前一覧【全${count}件】定番から珍しい料理`,
    `${cuisine}の種類・名前一覧【全${count}件】`,
  ])
}

export function countryListDescription(
  countryLabel: string,
  dishes: DishItem[],
  page?: number
): string {
  const cuisine = cuisineName(countryLabel)
  const pagePart = page && page > 1 ? `（${page}ページ目）` : ""
  return fitDescription(
    `${cuisine}の種類を一覧で紹介${pagePart}。${representativeNames(dishes, 5)}など定番から珍しい料理まで全${dishes.length}件。`,
    "どんな料理か・味・注文のコツがわかる料理図鑑 RDish。"
  )
}

// ---- 国×タグ などの組み合わせ一覧 -------------------------------------------

export function comboListTitle(heading: string, count: number): string {
  return fitTitle([
    `${heading}【全${count}件】名前・特徴・注文のコツ`,
    `${heading}【全${count}件】名前と特徴`,
    `${heading}【全${count}件】`,
  ])
}

export function comboListDescription(
  heading: string,
  dishes: DishItem[]
): string {
  return fitDescription(
    `${heading}を紹介。${representativeNames(dishes, 4)}など全${dishes.length}件。`,
    "どんな料理か・味・注文のコツがわかる料理図鑑 RDish。"
  )
}

// ---- 比較ページ -----------------------------------------------------------

export function comparisonPageTitle(a: DishItem, b: DishItem): string {
  const base = `${a.name}と${b.name}の違いは？`
  return fitTitle([
    `${base}味・食感・食べ方を比較`,
    `${base}味・特徴を比較`,
    base,
  ])
}

export function comparisonPageDescription(
  a: DishItem,
  b: DishItem,
  aDifference: string
): string {
  // 検索結果の冒頭で答え（違いの要点）を見せる
  const answer = aDifference.replace(/。$/, "")
  return fitDescription(
    `【${a.name}と${b.name}の違い】${answer}。`,
    "味・食感・重さ・辛さ・注文のコツを表で比較。"
  )
}

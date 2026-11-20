import type { DishItem } from "../types/dish"

// 検索結果に表示されるタイトル（" | RDish" を除く）の目安文字数。
// 日本語は全角30〜35字前後を超えると省略されやすいため、重要語（名前・別名）を前に置く。
const TITLE_MAX = 36
const DESCRIPTION_MAX = 140

const HOOK_BY_CATEGORY: Partial<Record<DishItem["category"], string>> = {
  料理: "注文のコツ",
  デザート: "注文のコツ",
  飲み物: "飲み方",
}

/** タイトルに載せる別名（表記ゆれ検索の受け皿）。名前と同一のものは除く */
function titleAlias(dish: DishItem): string | undefined {
  return dish.aliases?.find((a) => a && a !== dish.name)
}

/**
 * 料理ページの <title>。
 * 「〇〇とは？」の検索意図に答えつつ、別名で表記ゆれ検索を拾い、
 * ページで得られる情報（味・違い・コツ）を明示してCTRを上げる。
 * 別名 > 違い > 味・特徴 の優先度で、長さに収まる最も情報量の多い形を選ぶ。
 */
export function buildDishTitle(dish: DishItem): string {
  const alias = titleAlias(dish)
  const similar = dish.similarItems[0]?.name
  const hook = HOOK_BY_CATEGORY[dish.category] ?? "食べ方"
  const heads = [
    alias ? `${dish.name}（${alias}）とは？` : null,
    `${dish.name}とは？`,
  ].filter((h): h is string => Boolean(h))
  const candidates = heads.flatMap((head) => [
    similar ? `${head}味・特徴と${similar}との違い` : null,
    `${head}味・特徴・${hook}`,
    `${head}味・特徴`,
    head,
  ])
  return (
    candidates.find((t): t is string => Boolean(t) && t!.length <= TITLE_MAX) ??
    `${dish.name}とは？`
  )
}

/**
 * 料理ページの meta description。
 * 表記ゆれ（原語・別名）→ 何が出てくるか → 味 → 違いの順で、検索結果の2行に収まる情報を前寄せする。
 */
export function buildDishDescription(dish: DishItem): string {
  // 原語はラテン文字かつ短いものだけ（タイ文字・長い英訳は検索結果で読みにくい）
  const original = [dish.originalName, dish.englishName].find(
    (n): n is string =>
      Boolean(n) &&
      n !== dish.name &&
      n!.length <= 20 &&
      /^[\p{Script=Latin}\s'’.-]+$/u.test(n!)
  )
  // タイトルに出した別名以外を優先して載せ、拾える表記ゆれを増やす
  const alias = titleAlias(dish)
  const title = buildDishTitle(dish)
  const otherAliases = (dish.aliases ?? []).filter(
    (a) => a && a !== dish.name && !(a === alias && title.includes(`（${a}）`))
  )
  const variants = [original, ...otherAliases.slice(0, 2)].filter(Boolean)
  const head =
    variants.length > 0 ? `${dish.name}（${variants.join("／")}）` : dish.name
  const body = (dish.menuDescription || dish.summary).replace(/。$/, "")
  const taste = dish.tasteAndTexture[0]
  const similar = dish.similarItems[0]?.name
  const tail = [
    taste ? `特徴は「${taste}」。` : "",
    similar ? `${similar}との違いも解説。` : "",
  ].join("")
  const full = `${head}は、${body}。${tail}`
  if (full.length <= DESCRIPTION_MAX) return full
  // 長い場合は本文を削って末尾の訴求を残す
  const room = DESCRIPTION_MAX - head.length - tail.length - 4
  if (room < 30) return full.slice(0, DESCRIPTION_MAX - 1) + "…"
  return `${head}は、${body.slice(0, room)}…${tail}`
}

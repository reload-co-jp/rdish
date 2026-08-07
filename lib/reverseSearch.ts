import type { DishItem } from "../types/dish"
import { extractSearchTerms } from "./dishTerms"
import { normalize } from "./normalize"
import { expandSynonyms, ALL_SYNONYM_TERMS } from "./synonyms"
import { TAG_VOCABULARY } from "./tagVocabulary"

// 辞書は最長一致を優先するため長い順に並べておく
const DICTIONARY = [...ALL_SYNONYM_TERMS, ...TAG_VOCABULARY]
  .map(normalize)
  .sort((a, b) => b.length - a.length)

// 区切り文字を含まない複合語(例:「酸っぱい野菜」)を、既知語辞書との
// 最長一致で貪欲に分割する。辞書にない部分はそのまま1語として残す。
function splitByDictionary(chunk: string): string[] {
  const parts: string[] = []
  let buf = ""
  let i = 0
  while (i < chunk.length) {
    const match = DICTIONARY.find((w) => chunk.startsWith(w, i))
    if (match) {
      if (buf) { parts.push(buf); buf = "" }
      parts.push(match)
      i += match.length
    } else {
      buf += chunk[i]
      i += 1
    }
  }
  if (buf) parts.push(buf)
  return parts
}

function tokenize(query: string): string[] {
  return query
    .trim()
    .split(/[\s\u3000のをがはにでともへからまでより・、。,.，]+/)
    .flatMap((chunk) => {
      // further split katakana / kanji boundaries if chunk is long
      const parts: string[] = []
      let buf = ""
      for (const ch of chunk) {
        buf += ch
        // split after katakana runs (バター / 焼き boundary etc.) only when mixed
        if (buf.length >= 4 && /[ぁ-ん]$/.test(ch) && /[ァ-ヶ]/.test(buf.slice(0, -1))) {
          parts.push(buf.slice(0, -1))
          buf = ch
        }
      }
      if (buf) parts.push(buf)
      return parts
    })
    .map(normalize)
    .flatMap(splitByDictionary)
    .filter((w) => w.length >= 1)
}

export function reverseSearch(dishes: DishItem[], query: string): DishItem[] {
  if (!query.trim()) return []
  const words = expandSynonyms(tokenize(query))

  const scored = dishes.map((item) => {
    let score = 0
    const targets = [
      ...item.reverseKeywords,
      ...item.tags,
      item.summary,
      item.menuDescription,
      ...item.tasteAndTexture,
      ...item.whatComesOut,
    ].map(normalize)

    for (const word of words) {
      for (const target of targets) {
        if (target.includes(word)) score += 1
      }
    }

    return { item, score }
  })

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((s) => s.item)
}

export type KeywordMatch = { dish: DishItem; term: string }

export function detectKeywordsInQuery(dishes: DishItem[], query: string): KeywordMatch[] {
  const nq = normalize(query)
  const matches: KeywordMatch[] = []
  const seenIds = new Set<string>()

  // longest terms first to avoid partial shadowing
  const candidates: { dish: DishItem; term: string }[] = []
  for (const dish of dishes) {
    for (const term of extractSearchTerms(dish)) {
      candidates.push({ dish, term })
    }
  }
  candidates.sort((a, b) => b.term.length - a.term.length)

  for (const { dish, term } of candidates) {
    if (seenIds.has(dish.id)) continue
    if (nq.includes(normalize(term))) {
      matches.push({ dish, term })
      seenIds.add(dish.id)
    }
  }

  return matches
}

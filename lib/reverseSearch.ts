import type { DishItem } from "../types/dish"
import { conjugationCandidates } from "./conjugation"
import { allDishes } from "./dishes"
import { extractSearchTerms } from "./dishTerms"
import { normalize } from "./normalize"
import { segmentUnknown } from "./segmenter"
import { expandSynonyms, ALL_SYNONYM_TERMS } from "./synonyms"
import { TAG_VOCABULARY } from "./tagVocabulary"

// 実データのtags/reverseKeywordsから既知語を集める。1文字語は誤分割の
// もとになるため除外する。
const DATA_VOCABULARY = new Set<string>()
for (const dish of allDishes) {
  for (const term of [...dish.tags, ...dish.reverseKeywords]) {
    if (term.length >= 2) DATA_VOCABULARY.add(term)
  }
}

const NORMALIZED_VOCAB = new Set(
  [...ALL_SYNONYM_TERMS, ...TAG_VOCABULARY, ...DATA_VOCABULARY].map(normalize),
)

// 辞書は最長一致を優先するため長い順に並べておく(重複除去済み)
const DICTIONARY = [...NORMALIZED_VOCAB].sort((a, b) => b.length - a.length)

// 辞書に一致しない残り文字列を解決する。まず活用語尾(音便/形容詞活用)
// を語幹に変換して辞書照合を試み、それでもヒットしなければ
// TinySegmenterによる統計的分かち書きにフォールバックする。
// TinySegmenterにはカタカナ/ひらがなの文字種情報が精度に効くため、
// 正規化(ひらがな統一)前のrawBufを渡す。
function resolveUnknown(buf: string, rawBuf: string): string[] {
  if (NORMALIZED_VOCAB.has(buf)) return [buf]
  for (const candidate of conjugationCandidates(buf)) {
    if (NORMALIZED_VOCAB.has(candidate)) return [candidate]
  }
  if (buf.length < 3) return [buf]

  const segments = segmentUnknown(rawBuf)
  if (segments.length <= 1) return [buf]

  // 分割できた断片それぞれにも辞書・活用語尾照合をかけ、語幹化できる
  // ものは語幹化する(例:「揉ん」「だ」「キャベツ」→「揉み」「だ」「野菜」名一致)
  return segments.map((seg) => {
    const n = normalize(seg)
    if (NORMALIZED_VOCAB.has(n)) return n
    for (const candidate of conjugationCandidates(n)) {
      if (NORMALIZED_VOCAB.has(candidate)) return candidate
    }
    return n
  })
}

// 区切り文字を含まない複合語(例:「酸っぱい野菜」)を、既知語辞書との
// 最長一致で貪欲に分割する。辞書にない部分はresolveUnknownで解決する。
// chunkは辞書照合用の正規化済み文字列、rawChunkは同じ長さ・同じ位置の
// 正規化前(カタカナ/大文字保持)文字列。
function splitByDictionary(chunk: string, rawChunk: string): string[] {
  const parts: string[] = []
  let buf = ""
  let rawBuf = ""
  let i = 0
  while (i < chunk.length) {
    const match = DICTIONARY.find((w) => chunk.startsWith(w, i))
    if (match) {
      if (buf) { parts.push(...resolveUnknown(buf, rawBuf)); buf = ""; rawBuf = "" }
      parts.push(match)
      i += match.length
    } else {
      buf += chunk[i]
      rawBuf += rawChunk[i]
      i += 1
    }
  }
  if (buf) parts.push(...resolveUnknown(buf, rawBuf))
  return parts
}

function tokenize(query: string): string[] {
  return query
    .trim()
    // 文字クラス[...]では「から/まで/より」が1文字ずつのORになってしまう
    // (例:「酸っぱかった」の「か」で誤分断される)ため、交代(|)で複数文字の
    // 助詞をひとまとまりとして区切る。
    .split(/(?:\s|\u3000|から|まで|より|の|を|が|は|に|で|と|も|へ|・|、|。|,|\.|，)+/)
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
    .flatMap((rawChunk) => splitByDictionary(normalize(rawChunk), rawChunk))
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

import { normalize } from "./normalize"

// 同じ意味とみなす語のグループ。逆引き検索でどれか1語にヒットすれば
// グループ全体にマッチしたものとして扱う。タグ次元5(風味・特徴)の
// 語彙を軸に、口語的な言い換えをまとめている。
const RAW_SYNONYM_GROUPS: string[][] = [
  ["とろける", "とろっと", "とろとろ", "とろり", "なめらか"],
  ["ピリ辛", "辛い", "スパイシー", "ホット"],
  ["もちもち", "もっちり"],
  ["サクサク", "カリカリ", "パリパリ"],
  ["こってり", "濃厚", "リッチ"],
  ["あっさり", "さっぱり", "さわやか"],
  ["酸味", "酸っぱい", "すっぱい", "すっぱみ"],
  ["甘み", "甘い", "甘さ"],
  ["香ばしい", "こうばしい", "香り高い"],
  ["ジューシー", "多汁", "肉汁"],
  ["ふわふわ", "ふんわり"],
  ["クリーミー", "まろやか"],
  ["白い", "白色", "ホワイト"],
  ["渦巻き", "らせん", "スパイラル"],
  ["こんがり", "きつね色", "香ばしい焼き色"],
]

const GROUP_INDEX = new Map<string, string[]>()
for (const group of RAW_SYNONYM_GROUPS) {
  const normalized = group.map(normalize)
  for (const term of normalized) {
    GROUP_INDEX.set(term, normalized)
  }
}

// 単語リストを受け取り、各語が属する同義語グループの全語を加えて返す
// (重複除去済み)。マッチしない語はそのまま残す。
export function expandSynonyms(words: string[]): string[] {
  const expanded = new Set<string>()
  for (const word of words) {
    expanded.add(word)
    const group = GROUP_INDEX.get(word)
    if (group) {
      for (const term of group) expanded.add(term)
    }
  }
  return [...expanded]
}

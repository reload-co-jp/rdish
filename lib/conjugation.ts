// 活用語尾を辞書駆動で語幹に正規化する簡易ヒューリスティック。
// 厳密な形態素解析はせず、料理表現によく出る動詞テ形/タ形の音便・
// 形容詞活用のパターンを列挙し、辞書照合でヒットするものだけ採用する。
// (例: 「焼いた」→「焼き」、「酸っぱかった」→「酸っぱい」)
export function conjugationCandidates(word: string): string[] {
  const candidates = new Set<string>()

  // カ行イ音便: 焼いた/焼いて → 焼き
  if (/(いた|いて)$/.test(word)) candidates.add(word.replace(/(いた|いて)$/, "き"))
  // ガ行イ音便: 泳いだ/泳いで → 泳ぎ
  if (/(いだ|いで)$/.test(word)) candidates.add(word.replace(/(いだ|いで)$/, "ぎ"))
  // サ行(音便なし): 蒸した/蒸して → 蒸し
  if (/(した|して)$/.test(word)) candidates.add(word.replace(/(した|して)$/, "し"))
  // タ行/ラ行/ワ行 促音便: 炒った/炒って → 炒り・炒ち・炒い(語幹が曖昧なため複数候補)
  if (/(った|って)$/.test(word)) {
    const stem = word.replace(/(った|って)$/, "")
    candidates.add(stem + "り")
    candidates.add(stem + "ち")
    candidates.add(stem + "い")
  }
  // マ行/バ行 撥音便: 揉んだ/揉んで → 揉み・揉び(語幹が曖昧なため複数候補)
  if (/(んだ|んで)$/.test(word)) {
    const stem = word.replace(/(んだ|んで)$/, "")
    candidates.add(stem + "み")
    candidates.add(stem + "び")
  }
  // 一段動詞(煮る/漬ける等): て/たを外すと連用形になる
  if (/て$/.test(word)) candidates.add(word.replace(/て$/, ""))
  if (/た$/.test(word)) candidates.add(word.replace(/た$/, ""))
  // ます形
  if (/(ました|ません|ます)$/.test(word)) {
    candidates.add(word.replace(/(ました|ません|ます)$/, ""))
  }
  // 形容詞活用: 酸っぱかった/酸っぱくない/酸っぱく/酸っぱさ → 酸っぱい
  if (/かった$/.test(word)) candidates.add(word.replace(/かった$/, "い"))
  if (/くない$/.test(word)) candidates.add(word.replace(/くない$/, "い"))
  if (/く$/.test(word)) candidates.add(word.replace(/く$/, "い"))
  if (/さ$/.test(word)) candidates.add(word.replace(/さ$/, "い"))

  candidates.delete(word)
  return [...candidates].filter((c) => c.length >= 1)
}

// wordが辞書に無い場合、活用候補を順に試して辞書にヒットすればその
// 語幹形を返す。ヒットしなければ元の語をそのまま返す。
export function normalizeConjugation(word: string, dict: Set<string>): string {
  if (dict.has(word)) return word
  for (const candidate of conjugationCandidates(word)) {
    if (dict.has(candidate)) return candidate
  }
  return word
}

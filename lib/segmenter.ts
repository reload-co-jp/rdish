import TinySegmenter from "tiny-segmenter"

const segmenter = new TinySegmenter()

// 辞書(タグ/reverseKeywords/同義語)に一致しなかった未知の複合語を
// さらに分かち書きする最後の砦。TinySegmenterは辞書を持たない統計的
// 分かち書きのため精度は粗いが、未知の食材名・料理名の境界を大まかに
// 推定できる。1〜2文字は分割しても意味が薄いのでそのまま返す。
export function segmentUnknown(text: string): string[] {
  if (text.length < 3) return [text]
  const segments = segmenter.segment(text).filter((w) => w.trim().length > 0)
  return segments.length > 0 ? segments : [text]
}

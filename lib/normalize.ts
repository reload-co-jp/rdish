export function toHiragana(str: string): string {
  return str.replace(/[ァ-ヶ]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) - 0x60),
  )
}

export function toKatakana(str: string): string {
  return str.replace(/[ぁ-ゖ]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) + 0x60),
  )
}

export function normalize(str: string): string {
  return toHiragana(str.toLowerCase().trim())
}

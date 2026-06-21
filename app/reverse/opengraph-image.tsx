import { buildOgImage, ogContentType, ogSize } from "../../lib/og"

export const dynamic = "force-static"
export const alt = "逆引き検索 — 特徴から料理名を調べる | RDish"
export const size = ogSize
export const contentType = ogContentType

export default function Image() {
  return buildOgImage({
    title: "逆引き検索",
    subtitle: "「白くてとろっとしたチーズ」「緑色で渦巻きの野菜」",
  })
}

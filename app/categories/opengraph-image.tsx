import { buildOgImage, ogContentType, ogSize } from "../../lib/og"

export const dynamic = "force-static"
export const alt = "カテゴリ別 料理一覧 | RDish"
export const size = ogSize
export const contentType = ogContentType

export default function Image() {
  return buildOgImage({
    title: "カテゴリ別 料理一覧",
    subtitle: "料理・食材・調理法などから探す",
  })
}
